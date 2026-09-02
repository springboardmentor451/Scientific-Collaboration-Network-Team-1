from app.core.constants import UserRole, UserStatus
from app.models import Institution, User
from httpx import AsyncClient, Response
from sqlalchemy.ext.asyncio import AsyncSession
from tests.conftest import auth_headers, make_institution, make_user


async def make_institution_admin(
    session: AsyncSession, institution: Institution
) -> User:
    user: User = await make_user(session, role=UserRole.INSTITUTION_ADMIN)
    user.managed_institution_id = institution.institution_id
    await session.commit()
    return user


async def test_institution_admin_can_view_their_institution(
    client: AsyncClient, session: AsyncSession, institution: Institution
) -> None:
    admin: User = await make_institution_admin(session, institution)
    res: Response = await client.get(
        "/api/institution-admin/my-institution", headers=auth_headers(admin)
    )
    assert res.status_code == 200
    assert res.json()["institution_id"] == institution.institution_id


async def test_institution_admin_can_view_their_researchers(
    client: AsyncClient, session: AsyncSession, institution: Institution
) -> None:
    admin: User = await make_institution_admin(session, institution)
    res: Response = await client.get(
        "/api/institution-admin/my-researchers", headers=auth_headers(admin)
    )
    assert res.status_code == 200
    assert isinstance(res.json(), list)


async def test_institution_admin_can_view_their_stats(
    client: AsyncClient, session: AsyncSession, institution: Institution
) -> None:
    admin: User = await make_institution_admin(session, institution)
    res: Response = await client.get(
        "/api/institution-admin/my-stats", headers=auth_headers(admin)
    )
    assert res.status_code == 200
    assert "total_researchers" in res.json()
    assert "total_publications" in res.json()


async def test_institution_admin_cannot_access_system_admin_routes(
    client: AsyncClient, session: AsyncSession, institution: Institution
) -> None:
    admin: User = await make_institution_admin(session, institution)
    res: Response = await client.get(
        "/api/users/all-users", headers=auth_headers(admin)
    )
    assert res.status_code == 403


async def test_institution_admin_cannot_create_institution(
    client: AsyncClient, session: AsyncSession, institution: Institution
) -> None:
    admin: User = await make_institution_admin(session, institution)
    res: Response = await client.post(
        "/api/institutions/",
        json={"name": "New Inst", "country": "USA", "city": "NYC"},
        headers=auth_headers(admin),
    )
    assert res.status_code == 403


async def test_institution_admin_cannot_approve_users(
    client: AsyncClient,
    session: AsyncSession,
    institution: Institution,
) -> None:
    admin: User = await make_institution_admin(session, institution)
    pending: User = await make_user(session, status=UserStatus.PENDING, role=None)
    res: Response = await client.patch(
        f"/api/users/{pending.user_id}/approve",
        headers=auth_headers(admin),
    )
    assert res.status_code == 403


async def test_researcher_cannot_access_institution_admin_routes(
    client: AsyncClient, researcher_user: User
) -> None:
    res: Response = await client.get(
        "/api/institution-admin/my-institution",
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 403


async def test_institution_admin_without_managed_institution_blocked(
    client: AsyncClient,
    session: AsyncSession,
) -> None:
    admin: User = await make_user(session, role=UserRole.INSTITUTION_ADMIN)
    # no managed_institution_id set
    res: Response = await client.get(
        "/api/institution-admin/my-institution", headers=auth_headers(admin)
    )
    assert res.status_code == 400
