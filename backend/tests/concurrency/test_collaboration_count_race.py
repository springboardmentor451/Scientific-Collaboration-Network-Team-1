"""
The critical concurrency test in this suite.

This is a classic read-modify-write race. If N requests read the same starting count simultaneously,
all N compute count+1 independently andvthe final stored value is count+1,
not count+N. Updates are silently lost.
"""

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


async def _create_collaboration(
    client_factory: Callable[[], AsyncClient], email: str, researcher_ids: list[int]
) -> dict:
    async with client_factory() as client:
        res: Response = await client.post(
            "/api/collaborations/",
            json={"researcher_ids": researcher_ids},
            headers=auth_headers_for(email),
        )
        return {
            "status": res.status_code,
            "body": res.json() if res.status_code < 500 else None,
        }


async def test_collaboration_count_survives_concurrent_increments(
    client_factory: Callable[[], AsyncClient], session: AsyncSession
) -> None:
    """
    Two researchers collaborate 5 times "simultaneously"
    (e.g. both submit a joint paper form at once, or a batch import runs in parallel).
    Final collaboration_count MUST equal 5, not less.
    """
    user_a: User = await make_active_user(session)
    researcher_a: Researcher = await make_researcher_for(session, user_a)
    user_b: User = await make_active_user(session)
    researcher_b: Researcher = await make_researcher_for(session, user_b)
    ids: list[int] = [researcher_a.researcher_id, researcher_b.researcher_id]
    results = await asyncio.gather(
        *[_create_collaboration(client_factory, user_a.email, ids) for _ in range(5)]
    )
    statuses = [r["status"] for r in results]
    assert all(s == 201 for s in statuses), (
        f"all 5 concurrent collaboration calls should succeed: {statuses}"
    )
    counts_seen = [r["body"]["collaboration_count"] for r in results if r["body"]]
    max_count_seen = max(counts_seen) if counts_seen else 0
    assert max_count_seen == 5, (
        f"RACE CONDITION DETECTED: expected final collaboration_count=5 after "
        f"5 concurrent increments, but highest count observed was {max_count_seen}. "
        f"Counts seen across all 5 responses: {counts_seen}. "
        f"This means updates were lost due to a non-atomic read-modify-write. "
        f"Fix: use SQLAlchemy update(Collaboration).values("
        f"collaboration_count=Collaboration.collaboration_count + 1) "
        f"instead of 'existing.collaboration_count += 1' in Python."
    )


async def test_collaboration_count_stress_twenty_increments(
    client_factory: Callable[[], AsyncClient], session: AsyncSession
) -> None:
    """Higher contention version, 20 simultaneous increments on the same pair."""
    user_a: User = await make_active_user(session)
    researcher_a: Researcher = await make_researcher_for(session, user_a)
    user_b: User = await make_active_user(session)
    researcher_b: Researcher = await make_researcher_for(session, user_b)
    ids: list[int] = [researcher_a.researcher_id, researcher_b.researcher_id]
    results = await asyncio.gather(
        *[_create_collaboration(client_factory, user_a.email, ids) for _ in range(20)]
    )
    counts_seen = [r["body"]["collaboration_count"] for r in results if r["body"]]
    max_count_seen = max(counts_seen) if counts_seen else 0
    assert max_count_seen == 20, (
        f"under 20x concurrent load, expected final count=20, "
        f"got max observed count={max_count_seen}. Lost updates: "
        f"{20, max_count_seen} increments were silently dropped."
    )
