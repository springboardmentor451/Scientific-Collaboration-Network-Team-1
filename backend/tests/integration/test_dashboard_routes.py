from app.models import Institution, Researcher, User
from httpx import AsyncClient, Response
from sqlalchemy.ext.asyncio import AsyncSession
from tests.conftest import auth_headers, make_user

DASHBOARD_URL = "/api/dashboard"


async def test_my_dashboard_with_profile(
    client: AsyncClient, researcher_user: User, researcher: Researcher
) -> None:
    res: Response = await client.get(
        f"{DASHBOARD_URL}/me", headers=auth_headers(researcher_user)
    )
    assert res.status_code == 200
    data = res.json()
    assert "researcher_id" in data
    assert "publication_stats" in data
    assert "project_stats" in data
    assert "collaboration_count" in data
    assert "citation_count" in data


async def test_my_dashboard_without_profile(
    client: AsyncClient, session: AsyncSession
) -> None:
    user: User = await make_user(session)
    res: Response = await client.get(f"{DASHBOARD_URL}/me", headers=auth_headers(user))
    assert res.status_code == 404


async def test_my_dashboard_unauthenticated(client: AsyncClient) -> None:
    res: Response = await client.get(f"{DASHBOARD_URL}/me")
    assert res.status_code in (401, 403)


async def test_system_stats_as_admin(client: AsyncClient, admin_user: User) -> None:
    res: Response = await client.get(
        f"{DASHBOARD_URL}/system", headers=auth_headers(admin_user)
    )
    assert res.status_code == 200
    data = res.json()
    assert "total_users" in data
    assert "total_researchers" in data
    assert "total_publications" in data
    assert "total_projects" in data
    assert "total_collaborations" in data
    assert "total_citations" in data
    assert data["total_users"] >= 0


async def test_system_stats_as_researcher_forbidden(
    client: AsyncClient, researcher_user: User
) -> None:
    res: Response = await client.get(
        f"{DASHBOARD_URL}/system", headers=auth_headers(researcher_user)
    )
    assert res.status_code == 403


async def test_institution_stats_as_admin(
    client: AsyncClient, admin_user: User, institution: Institution
) -> None:
    res: Response = await client.get(
        f"{DASHBOARD_URL}/institution/{institution.institution_id}",
        headers=auth_headers(admin_user),
    )
    assert res.status_code == 200
    data = res.json()
    assert data["institution_id"] == institution.institution_id
    assert "total_researchers" in data
    assert "total_publications" in data
    assert "active_projects" in data


async def test_institution_stats_not_found(
    client: AsyncClient, admin_user: User
) -> None:
    res: Response = await client.get(
        f"{DASHBOARD_URL}/institution/99999", headers=auth_headers(admin_user)
    )
    assert res.status_code == 404


async def test_institution_stats_as_researcher_forbidden(
    client: AsyncClient, researcher_user: User, institution: Institution
) -> None:
    res: Response = await client.get(
        f"{DASHBOARD_URL}/institution/{institution.institution_id}",
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 403
