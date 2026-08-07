import logging
import random

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.engine.result import ScalarResult
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import UserStatus
from app.core.security import hash_password
from app.models import User
from app.schemas import (
    UserRequest,
    UserResponse,
    UserRoleUpdateRequest,
    UserUpdateRequest,
)

logger: logging.Logger = logging.getLogger(__name__)


class UserService:
    def __init__(self, session: AsyncSession) -> None:
        self.session: AsyncSession = session

    async def get_by_email(self, email: str) -> User | None:
        return await self.session.scalar(select(User).where(User.email == email))

    async def get_user(self, user_id: int) -> UserResponse:
        user: User = await self._get_by_id(user_id)
        return UserResponse.from_orm(user)

    async def get_pending_users(self) -> list[UserResponse]:
        logger.debug("fetching pending users")
        result: ScalarResult[User] = await self.session.scalars(
            select(User).where(User.status == UserStatus.PENDING)
        )
        return [UserResponse.from_orm(u) for u in result.all()]

    async def register(self, credentials: UserRequest) -> dict[str, str]:
        logger.debug("registering user: %s", credentials.email)
        existing: User | None = await self.get_by_email(credentials.email)
        if existing:
            logger.warning("registration failed, user exists: %s", credentials.email)
            raise HTTPException(status_code=409, detail="user already exists")

        code = str(random.randint(100000, 999999))
        new_user = User(
            email=credentials.email,
            password=credentials.password,
            status=UserStatus.PENDING,
            verification_code=code,
        )
        self.session.add(new_user)
        await self.session.commit()

        # shown in console - user copies this into swagger
        print(
            f"\n{'=' * 50}\nVerification Code for {credentials.email} is {code}\n{'=' * 50}\n"
        )
        logger.info("verification code generated for: %s", credentials.email)
        return {
            "message": "registration successful — check console for verification code"
        }

    async def verify_email(self, email: str, code: str) -> dict[str, str]:
        user: User | None = await self.get_by_email(email)
        if not user:
            logger.warning("user not found: %s", email)
            raise HTTPException(status_code=404, detail="user not found")
        if user.status in (UserStatus.BANNED, UserStatus.REJECTED):
            raise HTTPException(
                status_code=403, detail="account is not eligible for verification"
            )
        if user.is_verified:
            raise HTTPException(status_code=400, detail="user is already verified")
        if user.verification_code != code:
            raise HTTPException(status_code=400, detail="invalid verification code")
        user.is_verified = True
        user.verification_code = None
        await self.session.commit()
        logger.info("email verified: %s", email)
        return {"message": "email verified - awaiting admin approval"}

    async def approve(self, user_id: int) -> UserResponse:
        logger.debug("approving user %d", user_id)
        user: User = await self._get_by_id(user_id)
        await self._set_status(user, UserStatus.ACTIVE, require_pending=True)
        logger.info("user approved: %s", user.email)
        return UserResponse.from_orm(user)

    async def reject(self, user_id: int) -> UserResponse:
        logger.debug("rejecting user %d", user_id)
        user: User = await self._get_by_id(user_id)
        await self._set_status(user, UserStatus.REJECTED, require_pending=True)
        logger.warning("user rejected: %s", user.email)
        return UserResponse.from_orm(user)

    async def ban(self, user_id: int) -> UserResponse:
        logger.debug("banning user: %d", user_id)
        user: User = await self._get_by_id(user_id)
        await self._set_status(user, UserStatus.BANNED)
        logger.warning("user banned: %s", user.email)
        return UserResponse.from_orm(user)

    async def update(self, credentials: UserUpdateRequest, user: User) -> UserResponse:
        logger.debug("updating user: %s", user.email)
        updates = credentials.model_dump(exclude_none=True)
        if UserUpdateRequest.PASSWORD_FIELD in updates:
            user.password = hash_password(updates.pop(UserUpdateRequest.PASSWORD_FIELD))
        for key, val in updates.items():
            setattr(user, key, val)
        await self.session.commit()
        logger.info("user updated successfully: %s", user.email)
        return UserResponse.from_orm(user)

    async def change_role(
        self, user_id: int, data: UserRoleUpdateRequest
    ) -> UserResponse:
        logger.info("changing role for user: %d to %s", user_id, data.role)
        user: User = await self._get_by_id(user_id)
        user.role = data.role
        await self.session.commit()
        logger.info("role changed for user: %d", user_id)
        return UserResponse.from_orm(user)

    async def delete(self, user: User) -> None:
        logger.debug("deleting user: %s", user.email)
        await self.session.delete(user)
        await self.session.commit()
        logger.warning("user deleted: %s", user.email)

    async def delete_by_id(self, user_id: int) -> None:
        logger.debug("deleting user by id: %d", user_id)
        user: User = await self._get_by_id(user_id)
        await self.session.delete(user)
        await self.session.commit()
        logger.warning("user deleted: %d", user_id)

    async def _get_by_id(self, user_id: int) -> User:
        user: User | None = await self.session.get(User, user_id)
        if not user:
            logger.warning("user not found: %d", user_id)
            raise HTTPException(status_code=404, detail="user not found")
        return user

    async def _set_status(
        self, user: User, status: UserStatus, require_pending: bool = False
    ) -> None:
        if require_pending and user.status != UserStatus.PENDING:
            raise HTTPException(
                status_code=409, detail="user must be pending for this action"
            )
        user.status = status
        await self.session.commit()
