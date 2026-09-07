"""
Concurrent publication operations: duplicate DOI race, and simultaneous
status transitions on the same publication.
"""

import asyncio

from app.models import Publication, PublicationAuthor, Researcher, User
from tests.concurrency.conftest import (
    auth_headers_for,
    make_active_user,
    make_researcher_for,
)


async def _create_publication(client_factory, email: str, doi: str) -> dict:
    async with client_factory() as client:
        res = await client.post(
            "/api/publications/",
            json={
                "title": "Race Condition Test Paper Title",
                "publication_type": "journal",
                "status": "draft",
                "doi": doi,
            },
            headers=auth_headers_for(email),
        )
        return {"status": res.status_code}


async def test_concurrent_duplicate_doi_only_one_succeeds(
    client_factory,
    session,
) -> None:
    """
    Two researchers race to claim the same DOI
    (e.g. both importing the same paper from an external source at the same time).
    """
    user_a: User = await make_active_user(session)
    await make_researcher_for(session, user_a)
    user_b: User = await make_active_user(session)
    await make_researcher_for(session, user_b)
    doi = "10.1234/race-condition-test"
    results = await asyncio.gather(
        _create_publication(client_factory, user_a.email, doi),
        _create_publication(client_factory, user_b.email, doi),
        _create_publication(client_factory, user_a.email, doi),
    )
    statuses = [r["status"] for r in results]
    assert statuses.count(201) == 1, (
        f"expected exactly 1 successful publication with this DOI, got: {statuses}"
    )
    assert statuses.count(500) == 0, (
        f"duplicate DOI conflicts must resolve as 409, never crash as 500: {statuses}"
    )


async def _transition_status(
    client_factory, email: str, pub_id: int, status: str
) -> int:
    async with client_factory() as client:
        res = await client.patch(
            f"/api/publications/{pub_id}",
            json={"status": status},
            headers=auth_headers_for(email),
        )
        return res.status_code


async def test_concurrent_status_transitions_no_corruption(
    client_factory, session
) -> None:
    """
    Author clicks 'submit' twice rapidly (double-click), or two tabs race to change status.
    Final state must be consistent, not corrupted.
    """
    user: User = await make_active_user(session)
    researcher: Researcher = await make_researcher_for(session, user)
    pub = Publication(
        title="Concurrent Status Test",
        publication_type="journal",
        status="draft",
        is_open_access=True,
        external_authors=[],
    )
    session.add(pub)
    await session.flush()
    session.add(
        PublicationAuthor(
            publication_id=pub.publication_id,
            researcher_id=researcher.researcher_id,
            author_order=1,
            is_corresponding=True,
        )
    )
    await session.commit()
    results: list[int] = await asyncio.gather(
        *[
            _transition_status(
                client_factory, user.email, pub.publication_id, "archived"
            )
            for _ in range(5)
        ]
    )
    assert all(s in (200, 400) for s in results), (
        f"concurrent status transitions must resolve cleanly, never 500: {results}"
    )
