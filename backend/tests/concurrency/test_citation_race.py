import asyncio
from collections.abc import Callable

from app.models import Publication, PublicationAuthor, Researcher, User
from httpx import AsyncClient, Response
from sqlalchemy.ext.asyncio import AsyncSession
from tests.concurrency.conftest import (
    auth_headers_for,
    make_active_user,
    make_researcher_for,
)


async def _create_publication(
    session: AsyncSession, researcher_id: int, title: str
) -> int:
    pub = Publication(
        title=title,
        publication_type="journal",
        status="published",
        is_open_access=True,
        external_authors=[],
    )
    session.add(pub)
    await session.flush()
    session.add(
        PublicationAuthor(
            publication_id=pub.publication_id,
            researcher_id=researcher_id,
            author_order=1,
            is_corresponding=True,
        )
    )
    await session.commit()
    return pub.publication_id


async def _create_citation(
    client_factory: Callable[[], AsyncClient], email: str, citing_id: int, cited_id: int
) -> int:
    async with client_factory() as client:
        res: Response = await client.post(
            "/api/citations/",
            json={
                "citing_publication_id": citing_id,
                "cited_publication_ids": [cited_id],
            },
            headers=auth_headers_for(email),
        )
        return res.status_code


async def test_concurrent_duplicate_citation_only_one_succeeds(
    client_factory: Callable[[], AsyncClient], session: AsyncSession
) -> None:
    """Two tabs both submit the same citation pair at once."""
    user: User = await make_active_user(session)
    researcher: Researcher = await make_researcher_for(session, user)
    pub_a: int = await _create_publication(
        session, researcher.researcher_id, "Citing Paper"
    )
    pub_b: int = await _create_publication(
        session, researcher.researcher_id, "Cited Paper"
    )
    results: list[int] = await asyncio.gather(
        *[_create_citation(client_factory, user.email, pub_a, pub_b) for _ in range(4)]
    )
    assert results.count(201) == 1, (
        f"expected exactly 1 citation created, got: {results}"
    )
    assert results.count(500) == 0, (
        f"duplicate citation must resolve as 409, not crash: {results}"
    )
