"""
Tests what happens when logout and an authenticated request race each other,
e.g. a user closes their laptop (triggering logout) at the same instant
a background request from another tab is mid-flight using the same token.
"""

import asyncio
from collections.abc import Callable

from app.core import Config, get_config
from app.models import User
from app.services import TokenService
from conftest import make_active_user
from httpx import AsyncClient, Response
from sqlalchemy.ext.asyncio import AsyncSession


async def _double_logout(
    client_factory: Callable[[], AsyncClient], refresh_token: str, access_token: str
) -> int:
    async with client_factory() as client:
        res: Response = await client.post(
            "/api/auth/logout",
            json={"refresh_token": refresh_token},
            headers={"Authorization": f"Bearer {access_token}"},
        )
        return res.status_code


async def test_concurrent_logout_calls_same_token_idempotent(
    client_factory: Callable[[], AsyncClient], session: AsyncSession
) -> None:
    """
    Double-clicking a logout button, or a flaky network causing a retry,
    should not crash the server on the second call even though the refresh token is already revoked.
    """
    user: User = await make_active_user(session)
    config: Config = get_config()
    token_service = TokenService(config)
    access_token: str = token_service.create_access_token(user.email)
    refresh_token: str = token_service.create_refresh_token(user.email)
    results: tuple[int, int, int] = await asyncio.gather(
        _double_logout(client_factory, refresh_token, access_token),
        _double_logout(client_factory, refresh_token, access_token),
        _double_logout(client_factory, refresh_token, access_token),
    )
    assert all(status in (204, 400) for status in results), (
        f"concurrent duplicate logout calls should resolve cleanly "
        f"(204 success or 400 already-invalid), never a 500: {results}"
    )
    assert 500 not in results, (
        f"a 500 indicates unhandled concurrent revocation: {results}"
    )
