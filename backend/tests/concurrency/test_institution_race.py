import asyncio
from collections.abc import Callable

from app.core.constants import UserRole
from app.models import User
from httpx import AsyncClient, Response
from sqlalchemy.ext.asyncio import AsyncSession
from tests.concurrency.conftest import auth_headers_for, make_active_user


async def _create_institution(
    client_factory: Callable[[], AsyncClient], admin_email: str, domain: str
) -> int:
    async with client_factory() as client:
        res: Response = await client.post(
            "/api/institutions/",
            json={
                "name": "Race U",
                "country": "USA",
                "city": "Boston",
                "domain": domain,
            },
            headers=auth_headers_for(admin_email),
        )
        return res.status_code


async def test_concurrent_duplicate_domain_only_one_succeeds(
    client_factory: Callable[[], AsyncClient],
    session: AsyncSession,
) -> None:
    admin: User = await make_active_user(session)
    admin.role = UserRole.SYSTEM_ADMIN
    await session.commit()
    results: list[int] = await asyncio.gather(
        *[
            _create_institution(client_factory, admin.email, "raceuniv.edu")
            for _ in range(4)
        ]
    )
    assert results.count(201) == 1, (
        f"expected exactly 1 institution created, got: {results}"
    )
    assert results.count(500) == 0, (
        f"duplicate domain must resolve as 409, not crash: {results}"
    )
