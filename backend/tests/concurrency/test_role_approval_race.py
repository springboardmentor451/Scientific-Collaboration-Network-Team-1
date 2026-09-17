"""
Admin double-clicking 'approve' rapidly, or two admin tabs racing to approve/reject the same pending user simultaneously.
"""

import asyncio
from collections.abc import Callable

from app.core.constants import UserRole, UserStatus
from app.core.security import hash_password
from app.models import User
from httpx import AsyncClient, Response
from pydantic import SecretStr
from sqlalchemy.ext.asyncio import AsyncSession
from tests.concurrency.conftest import auth_headers_for


async def _approve(
    client_factory: Callable[[], AsyncClient], admin_email: str, user_id: int
) -> int:
    async with client_factory() as client:
        res: Response = await client.patch(
            f"/api/users/{user_id}/approve", headers=auth_headers_for(admin_email)
        )
        return res.status_code


async def test_concurrent_approve_same_user_only_one_succeeds(
    client_factory: Callable[[], AsyncClient], session: AsyncSession
) -> None:
    admin = User(
        email="raceadmin@mit.edu", password=hash_password(SecretStr("AdminPass123"))
    )
    admin.role = UserRole.SYSTEM_ADMIN
    admin.status = UserStatus.ACTIVE
    admin.is_verified = True
    session.add(admin)
    pending = User(
        email="pendingrace@mit.edu", password=hash_password(SecretStr("TestPass123"))
    )
    pending.role = None
    pending.status = UserStatus.PENDING
    pending.is_verified = True
    pending.requested_role = UserRole.RESEARCHER
    session.add(pending)
    await session.commit()
    results: list[int] = await asyncio.gather(
        *[_approve(client_factory, admin.email, pending.user_id) for _ in range(4)]
    )
    assert results.count(200) == 1, (
        f"expected exactly 1 approval to succeed, got: {results}"
    )
    assert results.count(409) == 3, (
        f"expected 3 conflicts for already-active user, got: {results}"
    )
