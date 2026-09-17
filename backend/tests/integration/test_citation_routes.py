from app.models import Researcher, User
from app.models.publication import Publication
from app.models.publication_author import PublicationAuthor
from httpx import AsyncClient, Response
from sqlalchemy.ext.asyncio import AsyncSession
from tests.conftest import auth_headers, make_researcher, make_user

CITATION_URL = "/api/citations"


async def _create_publication(session: AsyncSession, researcher: Researcher) -> int:
    pub = Publication(
        title="Test Publication Title",
        publication_type="journal",
        status="published",
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
    return pub.publication_id


async def test_create_citation_success(
    client: AsyncClient,
    researcher_user: User,
    researcher: Researcher,
    session: AsyncSession,
) -> None:
    pub_a: int = await _create_publication(session, researcher)
    pub_b: int = await _create_publication(session, researcher)
    res: Response = await client.post(
        f"{CITATION_URL}/",
        json={"citing_publication_id": pub_a, "cited_publication_ids": [pub_b]},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 201
    assert isinstance(res.json(), list)
    assert len(res.json()) == 1


async def test_bulk_citation_success(
    client: AsyncClient,
    researcher_user: User,
    researcher: Researcher,
    session: AsyncSession,
) -> None:
    pub_a: int = await _create_publication(session, researcher)
    pub_b: int = await _create_publication(session, researcher)
    pub_c: int = await _create_publication(session, researcher)
    res: Response = await client.post(
        f"{CITATION_URL}/",
        json={"citing_publication_id": pub_a, "cited_publication_ids": [pub_b, pub_c]},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 201
    assert len(res.json()) == 2


async def test_self_citation_rejected(
    client: AsyncClient,
    researcher_user: User,
    researcher: Researcher,
    session: AsyncSession,
) -> None:
    pub: int = await _create_publication(session, researcher)
    res: Response = await client.post(
        f"{CITATION_URL}/",
        json={"citing_publication_id": pub, "cited_publication_ids": [pub]},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 422


async def test_duplicate_citation_rejected(
    client: AsyncClient,
    researcher_user: User,
    researcher: Researcher,
    session: AsyncSession,
) -> None:
    pub_a: int = await _create_publication(session, researcher)
    pub_b: int = await _create_publication(session, researcher)
    await client.post(
        f"{CITATION_URL}/",
        json={"citing_publication_id": pub_a, "cited_publication_ids": [pub_b]},
        headers=auth_headers(researcher_user),
    )
    res: Response = await client.post(
        f"{CITATION_URL}/",
        json={"citing_publication_id": pub_a, "cited_publication_ids": [pub_b]},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 409


async def test_citation_nonexistent_publication(
    client: AsyncClient, researcher_user: User
) -> None:
    res: Response = await client.post(
        f"{CITATION_URL}/",
        json={"citing_publication_id": 99999, "cited_publication_ids": [99998]},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 404


async def test_get_citations_by_publication(
    client: AsyncClient,
    researcher_user: User,
    researcher: Researcher,
    session: AsyncSession,
) -> None:
    pub_a: int = await _create_publication(session, researcher)
    pub_b: int = await _create_publication(session, researcher)
    await client.post(
        f"{CITATION_URL}/",
        json={"citing_publication_id": pub_a, "cited_publication_ids": [pub_b]},
        headers=auth_headers(researcher_user),
    )
    res: Response = await client.get(f"{CITATION_URL}/by-publication/{pub_a}")
    assert res.status_code == 200
    assert isinstance(res.json(), list)
    assert any(c["cited_publication_id"] == pub_b for c in res.json())


async def test_get_cited_by(
    client: AsyncClient,
    researcher_user: User,
    researcher: Researcher,
    session: AsyncSession,
) -> None:
    pub_a: int = await _create_publication(session, researcher)
    pub_b: int = await _create_publication(session, researcher)
    await client.post(
        f"{CITATION_URL}/",
        json={"citing_publication_id": pub_a, "cited_publication_ids": [pub_b]},
        headers=auth_headers(researcher_user),
    )
    res: Response = await client.get(f"{CITATION_URL}/cited-by/{pub_b}")
    assert res.status_code == 200
    assert any(c["citing_publication_id"] == pub_a for c in res.json())


async def test_delete_citation(
    client: AsyncClient,
    researcher_user: User,
    researcher: Researcher,
    session: AsyncSession,
) -> None:
    pub_a: int = await _create_publication(session, researcher)
    pub_b: int = await _create_publication(session, researcher)
    create_res: Response = await client.post(
        f"{CITATION_URL}/",
        json={"citing_publication_id": pub_a, "cited_publication_ids": [pub_b]},
        headers=auth_headers(researcher_user),
    )
    citation_id = create_res.json()[0]["citation_id"]
    res: Response = await client.delete(
        f"{CITATION_URL}/{citation_id}", headers=auth_headers(researcher_user)
    )
    assert res.status_code == 204


async def test_delete_nonexistent_citation(
    client: AsyncClient, researcher_user: User
) -> None:
    res: Response = await client.delete(
        f"{CITATION_URL}/99999", headers=auth_headers(researcher_user)
    )
    assert res.status_code == 404


async def test_citation_unauthenticated(client: AsyncClient) -> None:
    res: Response = await client.post(
        f"{CITATION_URL}/",
        json={"citing_publication_id": 1, "cited_publication_ids": [2]},
    )
    assert res.status_code in (401, 403)


async def test_non_author_cannot_create_citation(
    client: AsyncClient,
    researcher_user: User,
    researcher: Researcher,
    session: AsyncSession,
) -> None:
    pub_a: int = await _create_publication(session, researcher)
    pub_b: int = await _create_publication(session, researcher)

    outsider: User = await make_user(session)
    await make_researcher(session, outsider)

    res: Response = await client.post(
        f"{CITATION_URL}/",
        json={"citing_publication_id": pub_a, "cited_publication_ids": [pub_b]},
        headers=auth_headers(outsider),
    )
    assert res.status_code == 403


async def test_non_author_cannot_delete_citation(
    client: AsyncClient,
    researcher_user: User,
    researcher: Researcher,
    session: AsyncSession,
) -> None:
    pub_a: int = await _create_publication(session, researcher)
    pub_b: int = await _create_publication(session, researcher)

    create_res: Response = await client.post(
        f"{CITATION_URL}/",
        json={"citing_publication_id": pub_a, "cited_publication_ids": [pub_b]},
        headers=auth_headers(researcher_user),
    )
    citation_id = create_res.json()[0]["citation_id"]

    outsider: User = await make_user(session)
    await make_researcher(session, outsider)
    res: Response = await client.delete(
        f"{CITATION_URL}/{citation_id}", headers=auth_headers(outsider)
    )
    assert res.status_code == 403
