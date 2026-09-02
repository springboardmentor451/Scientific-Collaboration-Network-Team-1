# tests/unit/test_user_admin_service.py
import pytest
from app.core.constants import UserRole, UserStatus
from app.core.validator import UserStatusValidator
from app.models.user import User
from fastapi import HTTPException


def make_test_user(
    status: UserStatus = UserStatus.PENDING,
    role: UserRole | None = None,
    requested_role: UserRole | None = UserRole.RESEARCHER,
) -> User:
    return User(
        user_id=1,
        email="test@mit.edu",
        role=role,
        status=status,
        requested_role=requested_role,
        is_verified=True,
    )


def test_validate_approval_passes_for_pending_with_role() -> None:
    user: User = make_test_user(
        status=UserStatus.PENDING, requested_role=UserRole.RESEARCHER
    )
    UserStatusValidator.ensure_approvable(user)


def test_validate_approval_already_active_raises() -> None:
    user: User = make_test_user(status=UserStatus.ACTIVE)
    with pytest.raises(HTTPException) as exc:
        UserStatusValidator.ensure_approvable(user)
    assert exc.value.status_code == 409
    assert "already active" in exc.value.detail


def test_validate_approval_banned_user_raises() -> None:
    user: User = make_test_user(status=UserStatus.BANNED)
    with pytest.raises(HTTPException) as exc:
        UserStatusValidator.ensure_approvable(user)
    assert exc.value.status_code == 409
    assert "banned" in exc.value.detail


def test_validate_approval_rejected_user_raises() -> None:
    user: User = make_test_user(status=UserStatus.REJECTED)
    with pytest.raises(HTTPException) as exc:
        UserStatusValidator.ensure_approvable(user)
    assert exc.value.status_code == 409
    assert "rejected" in exc.value.detail
