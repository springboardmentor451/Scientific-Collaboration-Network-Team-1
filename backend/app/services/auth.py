import logging

import pyotp
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import TOTP_INTERVAL, TokenType, UserStatus
from app.models import RevokedToken, User
from app.schemas import (
    EmailVerifyRequest,
    LoginCodeRequest,
    MessageResponse,
    TokenPayload,
    TokenResponse,
    UserRequest,
)
from app.services.token import TokenService
from app.services.user import UserService
from app.utils import send_verification_email

logger: logging.Logger = logging.getLogger(__name__)


class AuthService:
    def __init__(self, token_service: TokenService) -> None:
        self.token_service: TokenService = token_service

    async def register(
        self, credentials: UserRequest, user_service: UserService
    ) -> MessageResponse:
        logger.debug("registering user: %s", credentials.email)
        existing: User | None = await user_service.get_by_email(credentials.email)
        if existing:
            logger.warning("registration failed, user exists: %s", credentials.email)
            raise HTTPException(status_code=409, detail="user already exists")

        new_user = User(
            email=credentials.email,
            password=credentials.password,
            status=UserStatus.PENDING,
        )
        user_service.session.add(new_user)
        await user_service.session.commit()

        secret, code = self._generate_totp()
        new_user.verification_code = secret
        await user_service.session.commit()
        send_verification_email(new_user.email, code)
        return MessageResponse(message="verification code sent to your email")

    async def verify_email(
        self, data: EmailVerifyRequest, user_service: UserService
    ) -> MessageResponse:
        user: User | None = await user_service.get_by_email(data.email)
        if not user:
            logger.warning("user not found: %s", data.email)
            raise HTTPException(status_code=404, detail="user not found")
        self._validate_verification_code(data, user)
        user.is_verified = True
        user.verification_code = None
        await user_service.session.commit()
        logger.info("email verified: %s", data.email)
        return MessageResponse(message="email verified - awaiting admin approval")

    async def login(
        self, credentials: UserRequest, user_service: UserService
    ) -> MessageResponse:
        logger.info("login attempt: %s", credentials.email)
        user: User | None = await user_service.get_by_email(str(credentials.email))
        if not user or not user.check_password(credentials.password):
            logger.warning("login failed: %s", credentials.email)
            raise HTTPException(status_code=409, detail="invalid email or password")
        self._validate_status(user)
        secret, code = self._generate_totp()
        user.login_code = secret
        await user_service.session.commit()
        send_verification_email(user.email, code)
        return MessageResponse(message="OTP sent - check your email to complete login")

    async def verify_login_code(
        self, data: LoginCodeRequest, user_service: UserService
    ) -> TokenResponse:
        user: User | None = await user_service.get_by_email(data.email)
        if not user:
            logger.warning("user not found: %s", data.email)
            raise HTTPException(status_code=409, detail="user not found")
        self._validate_login_code(data, user)
        user.login_code = None
        await user_service.session.commit()
        logger.info("login successful: %s", user.email)
        return TokenResponse(
            access_token=self.token_service.create_access_token(user.email),
            refresh_token=self.token_service.create_refresh_token(user.email),
            token_type=TokenType.BEARER,
        )

    async def logout(self, refresh_token: str, session: AsyncSession) -> None:
        payload: TokenPayload = self.token_service.decode_token(refresh_token)
        if payload.token_type != "refresh":
            raise HTTPException(status_code=400, detail="invalid refresh token")
        existing: RevokedToken | None = await session.scalar(
            select(RevokedToken).where(RevokedToken.token == refresh_token)
        )
        if not existing:
            session.add(RevokedToken(token=refresh_token))
            await session.commit()

    async def refresh(
        self, refresh_token: str, user_service: UserService, session: AsyncSession
    ) -> TokenResponse:
        payload: TokenPayload = self.token_service.decode_token(refresh_token)
        if payload.token_type != "refresh":
            raise HTTPException(status_code=400, detail="invalid refresh token")
        revoked: RevokedToken | None = await session.scalar(
            select(RevokedToken).where(RevokedToken.token == refresh_token)
        )
        if revoked:
            raise HTTPException(
                status_code=401, detail="refresh token has been revoked"
            )
        user: User | None = await user_service.get_by_email(payload.sub)
        if not user:
            raise HTTPException(status_code=401, detail="user not found")
        return TokenResponse(
            access_token=self.token_service.create_access_token(payload.sub),
            token_type=TokenType.BEARER,
        )

    def _generate_totp(self) -> tuple[str, str]:
        secret: str = pyotp.random_base32()
        totp = pyotp.TOTP(secret, interval=TOTP_INTERVAL)
        code: str = totp.now()
        return secret, code

    def _verify_totp(self, secret: str, code: str) -> bool:
        totp = pyotp.TOTP(secret, interval=TOTP_INTERVAL)
        return totp.verify(code, valid_window=1)

    def _validate_status(self, user: User) -> None:
        if not user.is_verified:
            raise HTTPException(status_code=403, detail="email not verified")
        if user.status == UserStatus.PENDING:
            raise HTTPException(status_code=403, detail="account pending approval")
        if user.status == UserStatus.REJECTED:
            raise HTTPException(status_code=403, detail="account rejected")
        if user.status == UserStatus.BANNED:
            raise HTTPException(status_code=403, detail="account banned")

    def _validate_verification_code(self, data: EmailVerifyRequest, user: User) -> None:
        if user.status in (UserStatus.BANNED, UserStatus.REJECTED):
            raise HTTPException(
                status_code=403, detail="account is not eligible for verification"
            )
        if user.is_verified:
            raise HTTPException(status_code=400, detail="user is already verified")
        if not user.verification_code:
            raise HTTPException(status_code=400, detail="no OTP requested")
        if not self._verify_totp(user.verification_code, data.code):
            raise HTTPException(status_code=400, detail="invalid verification code")

    def _validate_login_code(self, data: LoginCodeRequest, user: User) -> None:
        if not user.login_code:
            raise HTTPException(status_code=400, detail="no login code requested")
        if not self._verify_totp(user.login_code, data.code):
            raise HTTPException(status_code=400, detail="invalid or expired code")
