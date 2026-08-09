import logging

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models import User
from app.schemas import UserResponse, UserUpdateRequest

logger: logging.Logger = logging.getLogger(__name__)


class UserService:
    def __init__(self, session: AsyncSession) -> None:
        self.session: AsyncSession = session

    async def get_by_email(self, email: str) -> User | None:
        return await self.session.scalar(select(User).where(User.email == email))

    async def get_by_id(self, user_id: int) -> User:
        user: User | None = await self.session.get(User, user_id)
        if not user:
            logger.warning("user not found: %d", user_id)
            raise HTTPException(status_code=404, detail="user not found")
        return user

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

    async def delete(self, user: User) -> None:
        logger.debug("deleting user: %s", user.email)
        await self.session.delete(user)
        await self.session.commit()
        logger.warning("user deleted: %s", user.email)

    async def delete_by_id(self, user_id: int) -> None:
        logger.debug("deleting user by id: %d", user_id)
        user: User = await self.get_by_id(user_id)
        await self.session.delete(user)
        await self.session.commit()
        logger.warning("user deleted: %d", user_id)
