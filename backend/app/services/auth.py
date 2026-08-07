import logging

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import TokenType, UserStatus
from app.models import RevokedToken, User
from app.schemas import TokenPayload, TokenResponse, UserRequest
from app.services.token import TokenService
from app.services.user import UserService

logger: logging.Logger = logging.getLogger(__name__)


class AuthService:
    def __init__(self, token_service: TokenService) -> None:
        self.token_service: TokenService = token_service

    def login_registered_user(self, user: User) -> TokenResponse:
        self._validate_status(user)
        access_token: str = self.token_service.create_access_token(user.email)
        refresh_token: str = self.token_service.create_refresh_token(user.email)
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type=TokenType.BEARER,
        )

    async def login(
        self, credentials: UserRequest, user_service: UserService
    ) -> TokenResponse:
        logger.info("login attempt: %s", credentials.email)
        user: User | None = await user_service.get_by_email(str(credentials.email))
        if not user or not user.check_password(credentials.password):
            logger.warning("login fialed: %s", credentials.email)
            raise HTTPException(status_code=409, detail="invalid email or password")
        self._validate_status(user)
        return TokenResponse(
            access_token=self.token_service.create_access_token(user.email),
            refresh_token=self.token_service.create_access_token(user.email),
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
        return self.login_registered_user(user)

    def _validate_status(self, user: User) -> None:
        if not user.is_verified:
            raise HTTPException(status_code=403, detail="email not verified")
        if user.status == UserStatus.PENDING:
            raise HTTPException(status_code=403, detail="account pending approval")
        if user.status == UserStatus.REJECTED:
            raise HTTPException(status_code=403, detail="account rejected")
        if user.status == UserStatus.BANNED:
            raise HTTPException(status_code=403, detail="account banned")
