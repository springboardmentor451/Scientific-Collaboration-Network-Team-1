from app.models import User
from app.schemas import (
    EmailChangeRequest,
    MessageResponse,
    UserResponse,
    UserUpdateRequest,
)
from app.services import AuthService, TokenService, UserService, VerificationCodeService
from app.utils import ConsoleEmailNotifier
from pydantic import SecretStr
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import config, make_user, mock_verification_code


# Email
async def test_get_by_email_found(session: AsyncSession) -> None:
    EMAIL = "found@mit.edu"
    user: User = await make_user(session, email=EMAIL)
    user_service = UserService(session)
    result: User | None = await user_service.get_by_email(EMAIL)
    assert result is not None
    assert result.email == user.email


async def test_update_email(session: AsyncSession, mock_verification_code: str) -> None:
    CURRENT_EMAIL = "current_email@mit.edu"
    NEW_EMAIL = "new_email@ox.ac.uk"
    user: User = await make_user(session, email=CURRENT_EMAIL)
    notifier = ConsoleEmailNotifier()
    verification_code_service = VerificationCodeService(session, notifier)
    auth_service = AuthService(TokenService(config=config), verification_code_service)
    user_service = UserService(session)
    req = EmailChangeRequest(new_email=NEW_EMAIL)
    result: MessageResponse = await auth_service.request_email_change(
        req, user, user_service
    )

    assert isinstance(result, MessageResponse)
    assert "verification" in result.message.lower()
    assert user.pending_email == NEW_EMAIL
    assert user.email == CURRENT_EMAIL


# Update password
async def test_update_password(session: AsyncSession) -> None:
    NEW_PASSWORD = "newpassword123"
    user: User = await make_user(session, email="password_update@mit.edu")
    old_hash: str = user.password
    user_service = UserService(session)
    req = UserUpdateRequest(password=SecretStr(NEW_PASSWORD))
    result: UserResponse = await user_service.update(req, user)
    assert result.email == user.email
    assert user.password != old_hash
    assert user.password != NEW_PASSWORD


# Delete user
async def test_delete_user(session: AsyncSession) -> None:
    EMAIL = "todelete@mit.edu"
    user: User = await make_user(session, email=EMAIL)
    user_service = UserService(session)
    await user_service.delete(user)
    deleted: User | None = await user_service.get_by_email(EMAIL)
    assert deleted is None
