import asyncio
from collections.abc import Callable

from app.models import Researcher, User
from httpx import AsyncClient, Response
from sqlalchemy.ext.asyncio import AsyncSession
from tests.concurrency.conftest import (
    auth_headers_for,
    make_active_user,
    make_researcher_for,
)


async def _add_member(
    client_factory: Callable[[], AsyncClient],
    email: str,
    project_id: int,
    researcher_id: int,
) -> int:
    async with client_factory() as client:
        res: Response = await client.post(
            f"/api/projects/{project_id}/members",
            json={"researcher_id": researcher_id, "role": "member"},
            headers=auth_headers_for(email),
        )
        return res.status_code


async def test_concurrent_add_same_member_only_one_succeeds(
    client_factory: Callable[[], AsyncClient], session: AsyncSession
) -> None:
    pi_user: User = await make_active_user(session)
    await make_researcher_for(session, pi_user)
    async with client_factory() as client:
        create_res: Response = await client.post(
            "/api/projects/",
            json={"name": "Race Test Project", "researcher_ids": []},
            headers=auth_headers_for(pi_user.email),
        )
    project_id = create_res.json()["project_id"]
    target_user: User = await make_active_user(session)
    target_researcher: Researcher = await make_researcher_for(session, target_user)
    results: list[int] = await asyncio.gather(
        *[
            _add_member(
                client_factory,
                pi_user.email,
                project_id,
                target_researcher.researcher_id,
            )
            for _ in range(4)
        ]
    )
    assert results.count(201) == 1, (
        f"expected exactly 1 add-member to succeed, got: {results}"
    )
    assert results.count(500) == 0, (
        f"duplicate member add must resolve as 409, not crash: {results}"
    )
