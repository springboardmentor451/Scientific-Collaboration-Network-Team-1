import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_code
from app.models import User
from app.schemas import UserResponse, UserUpdateRequest

logger: logging.Logger = logging.getLogger(__name__)


class UserService:
    def __init__(self, session: AsyncSession) -> None:
        self.session: AsyncSession = session

    async def get_by_email(self, email: str) -> User | None:
        return await self.session.scalar(select(User).where(User.email == email))

    async def update(self, credentials: UserUpdateRequest, user: User) -> UserResponse:
        updates = credentials.model_dump(exclude_none=True)
        if UserUpdateRequest.PASSWORD_FIELD in updates:
            user.password = hash_code(updates.pop(UserUpdateRequest.PASSWORD_FIELD))
        for key, val in updates.items():
            setattr(user, key, val)
        await self.session.commit()
        logger.info("user updated successfully: %d", user.user_id)
        return UserResponse.from_orm(user)

    """
    update credentials
    user can change his email and password, what else can he change?
    change email: new email address is sent as a request -> validate and verify that email -> if success then replace
    change password: send a code to email to confirm -> enter new password twice to confirm
    """

    async def delete(self, user: User) -> None:
        user_id: int = user.user_id
        await self.session.delete(user)
        await self.session.commit()
        logger.info("user deleted: %s", user_id)
