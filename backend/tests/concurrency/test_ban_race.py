import asyncio
from collections.abc import Callable

from app.core.constants import UserRole
from app.models import User
from httpx import AsyncClient, Response
from sqlalchemy.ext.asyncio import AsyncSession
from tests.concurrency.conftest import auth_headers_for, make_active_user


async def _ban(
    client_factory: Callable[[], AsyncClient], admin_email: str, target_user_id: int
) -> int:
    async with client_factory() as client:
        res: Response = await client.patch(
            f"/api/users/{target_user_id}/ban", headers=auth_headers_for(admin_email)
        )
        return res.status_code


async def test_concurrent_ban_same_user_only_one_succeeds(
    client_factory: Callable[[], AsyncClient], session: AsyncSession
) -> None:
    admin: User = await make_active_user(session)
    admin.role = UserRole.SYSTEM_ADMIN
    await session.commit()
    target: User = await make_active_user(session)
    results: list[int] = await asyncio.gather(
        *[_ban(client_factory, admin.email, target.user_id) for _ in range(4)]
    )
    assert results.count(200) == 1, f"expected exactly 1 ban to succeed, got: {results}"
    assert results.count(409) == 3, (
        f"expected 3 already-banned conflicts, got: {results}"
    )
