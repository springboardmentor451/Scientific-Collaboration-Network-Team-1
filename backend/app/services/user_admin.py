import logging

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.engine.result import ScalarResult
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import UserStatus
from app.core.interfaces import IEmailNotifier
from app.models import User
from app.schemas import UserResponse, UserRoleUpdateRequest

logger: logging.Logger = logging.getLogger(__name__)


class UserAdminService:
    def __init__(self, session: AsyncSession, email_notifier: IEmailNotifier) -> None:
        self.session: AsyncSession = session
        self.email_notifier: IEmailNotifier = email_notifier

    async def get_user(self, user_id: int) -> UserResponse:
        user: User = await self._get_by_id(user_id)
        return UserResponse.from_orm(user)

    async def get_all_users(self) -> list[UserResponse]:
        logger.debug("fetching all users")
        result: ScalarResult[User] = await self.session.scalars(select(User))
        return [UserResponse.from_orm(user) for user in result.all()]

    async def get_pending_users(self) -> list[UserResponse]:
        logger.debug("fetching pending users")
        result: ScalarResult[User] = await self.session.scalars(
            select(User).where(User.status == UserStatus.PENDING)
        )
        return [UserResponse.from_orm(user) for user in result.all()]

    async def approve(self, user_id: int) -> UserResponse:
        logger.debug("approving user %d", user_id)
        user: User = await self._get_by_id(user_id)
        await self._set_status(user, UserStatus.ACTIVE, require_pending=True)
        self.email_notifier.send_approval_notification(user.email)
        logger.info("user approved: %s", user.email)
        return UserResponse.from_orm(user)

    async def reject(self, user_id: int) -> UserResponse:
        logger.debug("rejecting user %d", user_id)
        user: User = await self._get_by_id(user_id)
        await self._set_status(user, UserStatus.REJECTED, require_pending=True)
        self.email_notifier.send_rejection_notification(user.email)
        logger.warning("user rejected: %s", user.email)
        return UserResponse.from_orm(user)

    async def ban(self, user_id: int) -> UserResponse:
        logger.debug("banning user: %d", user_id)
        user: User = await self._get_by_id(user_id)
        await self._set_status(user, UserStatus.BANNED)
        self.email_notifier.send_ban_notification(user.email)
        logger.warning("user banned: %s", user.email)
        return UserResponse.from_orm(user)

    async def change_role(
        self, user_id: int, data: UserRoleUpdateRequest
    ) -> UserResponse:
        logger.debug("changing role for user: %d to %s", user_id, data.role)
        user: User = await self._get_by_id(user_id)
        user.role = data.role
        await self.session.commit()
        logger.info("role changed for user: %d", user_id)
        return UserResponse.from_orm(user)

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
