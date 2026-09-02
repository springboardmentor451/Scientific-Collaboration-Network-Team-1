from app.core.constants import UserRole, UserStatus
from app.models import User
from httpx import AsyncClient, Response
from sqlalchemy.ext.asyncio import AsyncSession
from tests.conftest import auth_headers, make_user


async def make_reviewer(session: AsyncSession) -> User:
    return await make_user(session, role=UserRole.REVIEWER)


async def test_reviewer_can_browse_publications(
    client: AsyncClient, session: AsyncSession
) -> None:
    reviewer: User = await make_reviewer(session)
    res: Response = await client.get(
        "/api/publications/", headers=auth_headers(reviewer)
    )
    assert res.status_code == 200


async def test_reviewer_can_browse_researchers(
    client: AsyncClient, session: AsyncSession
) -> None:
    reviewer: User = await make_reviewer(session)
    res: Response = await client.get(
        "/api/researchers/", headers=auth_headers(reviewer)
    )
    assert res.status_code == 200


async def test_reviewer_cannot_access_admin_routes(
    client: AsyncClient, session: AsyncSession
) -> None:
    reviewer: User = await make_reviewer(session)
    res: Response = await client.get(
        "/api/users/all-users", headers=auth_headers(reviewer)
    )
    assert res.status_code == 403


async def test_reviewer_cannot_approve_users(
    client: AsyncClient, session: AsyncSession
) -> None:
    reviewer: User = await make_reviewer(session)
    pending: User = await make_user(session, status=UserStatus.PENDING, role=None)
    res: Response = await client.patch(
        f"/api/users/{pending.user_id}/approve", headers=auth_headers(reviewer)
    )
    assert res.status_code == 403


async def test_reviewer_cannot_create_institution(
    client: AsyncClient, session: AsyncSession
) -> None:
    reviewer: User = await make_reviewer(session)
    res: Response = await client.post(
        "/api/institutions/",
        json={"name": "Test", "country": "USA", "city": "NYC"},
        headers=auth_headers(reviewer),
    )
    assert res.status_code == 403


async def test_reviewer_can_request_role_change(
    client: AsyncClient, session: AsyncSession
) -> None:
    reviewer: User = await make_reviewer(session)
    res: Response = await client.post(
        "/api/users/me/request-role-change",
        json={"requested_role": "researcher"},
        headers=auth_headers(reviewer),
    )
    assert res.status_code == 200


async def test_reviewer_can_update_password(
    client: AsyncClient, session: AsyncSession
) -> None:
    reviewer: User = await make_reviewer(session)
    res: Response = await client.patch(
        "/api/users/me", json={"password": "NewPass789"}, headers=auth_headers(reviewer)
    )
    assert res.status_code == 200
