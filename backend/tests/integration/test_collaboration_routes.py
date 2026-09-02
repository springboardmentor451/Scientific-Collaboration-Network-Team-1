from app.models import Researcher, User
from httpx import AsyncClient, Response
from sqlalchemy.ext.asyncio import AsyncSession
from tests.conftest import auth_headers, make_researcher, make_user

COLLAB_URL = "/api/collaborations"


async def test_create_collaboration_success(
    client: AsyncClient,
    researcher_user: User,
    researcher: Researcher,
    session: AsyncSession,
) -> None:
    other_user: User = await make_user(session)
    other_researcher: Researcher = await make_researcher(session, other_user)
    res: Response = await client.post(
        f"{COLLAB_URL}/",
        json={
            "researcher_ids": [researcher.researcher_id, other_researcher.researcher_id]
        },
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 201
    assert res.json()["collaboration_count"] == 1


async def test_create_collaboration_increments_count(
    client: AsyncClient,
    researcher_user: User,
    researcher: Researcher,
    session: AsyncSession,
) -> None:
    other_user: User = await make_user(session)
    other_researcher: Researcher = await make_researcher(session, other_user)
    payload: dict[str, list[int]] = {
        "researcher_ids": [researcher.researcher_id, other_researcher.researcher_id]
    }
    await client.post(
        f"{COLLAB_URL}/", json=payload, headers=auth_headers(researcher_user)
    )
    res: Response = await client.post(
        f"{COLLAB_URL}/", json=payload, headers=auth_headers(researcher_user)
    )
    assert res.status_code == 201
    assert res.json()["collaboration_count"] == 2


async def test_self_collaboration_rejected(
    client: AsyncClient, researcher_user: User, researcher: Researcher
) -> None:
    res: Response = await client.post(
        f"{COLLAB_URL}/",
        json={"researcher_ids": [researcher.researcher_id, researcher.researcher_id]},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 422


async def test_single_researcher_rejected(
    client: AsyncClient, researcher_user: User, researcher: Researcher
) -> None:
    res: Response = await client.post(
        f"{COLLAB_URL}/",
        json={"researcher_ids": [researcher.researcher_id]},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 422


async def test_nonexistent_researcher_rejected(
    client: AsyncClient, researcher_user: User, researcher: Researcher
) -> None:
    res: Response = await client.post(
        f"{COLLAB_URL}/",
        json={"researcher_ids": [researcher.researcher_id, 99999]},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 404


async def test_get_all_collaborations(client: AsyncClient) -> None:
    res: Response = await client.get(f"{COLLAB_URL}/")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


async def test_get_my_collaborations(
    client: AsyncClient,
    researcher_user: User,
    researcher: Researcher,
    session: AsyncSession,
) -> None:
    other_user: User = await make_user(session)
    other_researcher: Researcher = await make_researcher(session, other_user)
    await client.post(
        f"{COLLAB_URL}/",
        json={
            "researcher_ids": [researcher.researcher_id, other_researcher.researcher_id]
        },
        headers=auth_headers(researcher_user),
    )
    res: Response = await client.get(
        f"{COLLAB_URL}/my", headers=auth_headers(researcher_user)
    )
    assert res.status_code == 200
    assert len(res.json()) >= 1


async def test_delete_collaboration(
    client: AsyncClient,
    researcher_user: User,
    researcher: Researcher,
    session: AsyncSession,
) -> None:
    other_user: User = await make_user(session)
    other_researcher: Researcher = await make_researcher(session, other_user)
    create_res: Response = await client.post(
        f"{COLLAB_URL}/",
        json={
            "researcher_ids": [researcher.researcher_id, other_researcher.researcher_id]
        },
        headers=auth_headers(researcher_user),
    )
    collab_id = create_res.json()["collaboration_id"]
    res: Response = await client.delete(
        f"{COLLAB_URL}/{collab_id}", headers=auth_headers(researcher_user)
    )
    assert res.status_code == 204


async def test_delete_nonexistent_collaboration(
    client: AsyncClient, researcher_user: User
) -> None:
    res: Response = await client.delete(
        f"{COLLAB_URL}/99999", headers=auth_headers(researcher_user)
    )
    assert res.status_code == 404


async def test_create_collaboration_unauthenticated(client: AsyncClient) -> None:
    res: Response = await client.post(f"{COLLAB_URL}/", json={"researcher_ids": [1, 2]})
    assert res.status_code in (401, 403)


async def test_create_collaboration_without_self_rejected(
    client: AsyncClient,
    researcher_user: User,
    researcher: Researcher,
    session: AsyncSession,
) -> None:
    other_user: User = await make_user(session)
    other_researcher: Researcher = await make_researcher(session, other_user)
    other_user2: User = await make_user(session)
    other_researcher2: Researcher = await make_researcher(session, other_user2)

    res: Response = await client.post(
        f"{COLLAB_URL}/",
        json={
            "researcher_ids": [
                other_researcher.researcher_id,
                other_researcher2.researcher_id,
            ]
        },
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 403


async def test_non_participant_cannot_delete_collaboration(
    client: AsyncClient,
    researcher_user: User,
    researcher: Researcher,
    session: AsyncSession,
) -> None:
    other_user: User = await make_user(session)
    other_researcher: Researcher = await make_researcher(session, other_user)
    create_res: Response = await client.post(
        f"{COLLAB_URL}/",
        json={
            "researcher_ids": [researcher.researcher_id, other_researcher.researcher_id]
        },
        headers=auth_headers(researcher_user),
    )
    collab_id = create_res.json()["collaboration_id"]

    outsider: User = await make_user(session)
    await make_researcher(session, outsider)
    res: Response = await client.delete(
        f"{COLLAB_URL}/{collab_id}",
        headers=auth_headers(outsider),
    )
    assert res.status_code == 403
