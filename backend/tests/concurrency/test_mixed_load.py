import asyncio
from collections.abc import Callable

from app.models import User
from httpx import AsyncClient, Response
from sqlalchemy.ext.asyncio import AsyncSession
from tests.concurrency.conftest import (
    auth_headers_for,
    make_active_user,
    make_researcher_for,
)


async def test_mixed_concurrent_operations_no_crashes(
    client_factory: Callable[[], AsyncClient], session: AsyncSession
) -> None:
    """
    Simulates realistic simultaneous traffic: one user reading, another
    writing, another logging in, all at once,
    none of these should ever return 500.
    """
    user_a: User = await make_active_user(session)
    await make_researcher_for(session, user_a)
    user_b: User = await make_active_user(session)
    await make_researcher_for(session, user_b)

    async def browse_publications() -> int:
        async with client_factory() as client:
            res: Response = await client.get("/api/publications/")
            return res.status_code

    async def update_profile() -> int:
        async with client_factory() as client:
            res: Response = await client.patch(
                "/api/researchers/me",
                json={"bio": "concurrent update"},
                headers=auth_headers_for(user_a.email),
            )
            return res.status_code

    async def create_publication() -> int:
        async with client_factory() as client:
            res: Response = await client.post(
                "/api/publications/",
                json={
                    "title": "Mixed Load Test Paper",
                    "publication_type": "journal",
                    "status": "draft",
                },
                headers=auth_headers_for(user_b.email),
            )
            return res.status_code

    async def check_dashboard() -> int:
        async with client_factory() as client:
            res: Response = await client.get(
                "/api/dashboard/me", headers=auth_headers_for(user_a.email)
            )
            return res.status_code

    results: tuple[int, int, int, int, int, int] = await asyncio.gather(
        browse_publications(),
        update_profile(),
        create_publication(),
        check_dashboard(),
        browse_publications(),
        update_profile(),
    )
    assert 500 not in results, f"mixed concurrent load caused a crash: {results}"
