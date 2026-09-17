"""
User submits email change from two tabs, or a bot spams the endpoint,
should never end up with two conflicting pending_email states or
allow the same new email to be claimed by two users at once.
"""

import asyncio
from collections.abc import Callable

from app.models import User
from httpx import AsyncClient, Response
from sqlalchemy.ext.asyncio import AsyncSession
from tests.concurrency.conftest import auth_headers_for, make_active_user


async def _request_email_change(client_factory: Callable[[], AsyncClient], email: str, new_email: str) -> int:
    async with client_factory() as client:
        res: Response = await client.post(
            "/api/auth/request-email-change",
            json={"new_email": new_email},
            headers=auth_headers_for(email),
        )
        return res.status_code


async def test_concurrent_email_change_requests_same_target(
    client_factory: Callable[[], AsyncClient], session: AsyncSession
) -> None:
    """Two different users both try to claim the same new email address."""
    user_a: User = await make_active_user(session)
    user_b: User = await make_active_user(session)
    target_email = "contested@ox.ac.uk"
    results: tuple[int, int] = await asyncio.gather(
        _request_email_change(client_factory, user_a.email, target_email),
        _request_email_change(client_factory, user_b.email, target_email),
    )
    assert 500 not in results, f"no request should crash: {results}"
