from app.models import Researcher, User
from httpx import AsyncClient, Response
from sqlalchemy.ext.asyncio import AsyncSession
from tests.conftest import auth_headers, make_researcher, make_user

PROJECT_URL = "/api/projects"
VALID_PROJECT: dict[str, str] = {"name": "Member Test Project", "description": "Test"}


async def test_add_member_as_pi(
    client: AsyncClient,
    researcher_user: User,
    researcher: Researcher,
    session: AsyncSession,
) -> None:
    create_res: Response = await client.post(
        f"{PROJECT_URL}/", json=VALID_PROJECT, headers=auth_headers(researcher_user)
    )
    project_id = create_res.json()["project_id"]
    other_user: User = await make_user(session)
    other: Researcher = await make_researcher(session, other_user)

    res: Response = await client.post(
        f"{PROJECT_URL}/{project_id}/members",
        json={"researcher_id": other.researcher_id, "role": "member"},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 201
    assert res.json()["role"] == "member"


async def test_add_duplicate_member_rejected(
    client: AsyncClient,
    researcher_user: User,
    researcher: Researcher,
    session: AsyncSession,
) -> None:
    create_res: Response = await client.post(
        f"{PROJECT_URL}/", json=VALID_PROJECT, headers=auth_headers(researcher_user)
    )
    project_id = create_res.json()["project_id"]
    other_user: User = await make_user(session)
    other: Researcher = await make_researcher(session, other_user)

    await client.post(
        f"{PROJECT_URL}/{project_id}/members",
        json={"researcher_id": other.researcher_id, "role": "member"},
        headers=auth_headers(researcher_user),
    )
    res: Response = await client.post(
        f"{PROJECT_URL}/{project_id}/members",
        json={"researcher_id": other.researcher_id, "role": "member"},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 409


async def test_non_pi_cannot_add_member(
    client: AsyncClient,
    researcher_user: User,
    researcher: Researcher,
    session: AsyncSession,
) -> None:
    create_res: Response = await client.post(
        f"{PROJECT_URL}/", json=VALID_PROJECT, headers=auth_headers(researcher_user)
    )
    project_id = create_res.json()["project_id"]

    member_user: User = await make_user(session)
    member: Researcher = await make_researcher(session, member_user)
    outsider_user: User = await make_user(session)
    await make_researcher(session, outsider_user)

    await client.post(
        f"{PROJECT_URL}/{project_id}/members",
        json={"researcher_id": member.researcher_id, "role": "member"},
        headers=auth_headers(researcher_user),
    )
    another_user: User = await make_user(session)
    another: Researcher = await make_researcher(session, another_user)
    res: Response = await client.post(
        f"{PROJECT_URL}/{project_id}/members",
        json={"researcher_id": another.researcher_id, "role": "member"},
        headers=auth_headers(member_user),
    )
    assert res.status_code == 403


async def test_remove_member_as_pi(
    client: AsyncClient,
    researcher_user: User,
    researcher: Researcher,
    session: AsyncSession,
) -> None:
    create_res: Response = await client.post(
        f"{PROJECT_URL}/", json=VALID_PROJECT, headers=auth_headers(researcher_user)
    )
    project_id = create_res.json()["project_id"]
    other_user: User = await make_user(session)
    other: Researcher = await make_researcher(session, other_user)

    await client.post(
        f"{PROJECT_URL}/{project_id}/members",
        json={"researcher_id": other.researcher_id, "role": "member"},
        headers=auth_headers(researcher_user),
    )
    res: Response = await client.delete(
        f"{PROJECT_URL}/{project_id}/members/{other.researcher_id}",
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 204


async def test_pi_cannot_remove_themselves(
    client: AsyncClient, researcher_user: User, researcher: Researcher
) -> None:
    create_res: Response = await client.post(
        f"{PROJECT_URL}/", json=VALID_PROJECT, headers=auth_headers(researcher_user)
    )
    project_id = create_res.json()["project_id"]

    res: Response = await client.delete(
        f"{PROJECT_URL}/{project_id}/members/{researcher.researcher_id}",
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 400
    assert "PI cannot remove themselves" in res.json()["detail"]


async def test_update_member_role(
    client: AsyncClient,
    researcher_user: User,
    researcher: Researcher,
    session: AsyncSession,
) -> None:
    create_res: Response = await client.post(
        f"{PROJECT_URL}/", json=VALID_PROJECT, headers=auth_headers(researcher_user)
    )
    project_id = create_res.json()["project_id"]
    other_user: User = await make_user(session)
    other: Researcher = await make_researcher(session, other_user)

    await client.post(
        f"{PROJECT_URL}/{project_id}/members",
        json={"researcher_id": other.researcher_id, "role": "member"},
        headers=auth_headers(researcher_user),
    )
    res: Response = await client.patch(
        f"{PROJECT_URL}/{project_id}/members/{other.researcher_id}",
        json={"role": "co_investigator"},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 200
    assert res.json()["role"] == "co_investigator"
