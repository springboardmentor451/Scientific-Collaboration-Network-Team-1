from app.core.constants import UserRole, UserStatus
from app.models import User
from httpx import AsyncClient, Response
from sqlalchemy.ext.asyncio import AsyncSession
from tests.conftest import auth_headers, make_user


async def test_logged_in_user_can_update_password(
    client: AsyncClient, session: AsyncSession
) -> None:
    user: User = await make_user(session, role=UserRole.RESEARCHER)
    res: Response = await client.patch(
        "/api/users/me", json={"password": "NewPass456"}, headers=auth_headers(user)
    )
    assert res.status_code == 200


async def test_logged_in_user_can_request_role_change(
    client: AsyncClient, session: AsyncSession
) -> None:
    user: User = await make_user(session, role=UserRole.RESEARCHER)
    res: Response = await client.post(
        "/api/users/me/request-role-change",
        json={"requested_role": "reviewer"},
        headers=auth_headers(user),
    )
    assert res.status_code == 200


async def test_logged_in_user_without_profile_cannot_create_publication(
    client: AsyncClient, session: AsyncSession
) -> None:
    user: User = await make_user(session, role=UserRole.RESEARCHER)
    res: Response = await client.post(
        "/api/publications/",
        json={
            "title": "Test Title Here",
            "publication_type": "journal",
            "status": "draft",
        },
        headers=auth_headers(user),
    )
    assert res.status_code == 404
    assert "researcher profile" in res.json()["detail"]


async def test_logged_in_user_without_profile_cannot_create_project(
    client: AsyncClient, session: AsyncSession
) -> None:
    user: User = await make_user(session, role=UserRole.RESEARCHER)
    res: Response = await client.post(
        "/api/projects/", json={"name": "Test Project"}, headers=auth_headers(user)
    )
    assert res.status_code == 404


async def test_logged_in_user_without_profile_cannot_create_collaboration(
    client: AsyncClient, session: AsyncSession
) -> None:
    user: User = await make_user(session, role=UserRole.RESEARCHER)
    res: Response = await client.post(
        "/api/collaborations/",
        json={"researcher_ids": [1, 2]},
        headers=auth_headers(user),
    )
    assert res.status_code == 404


async def test_pending_user_cannot_login(
    client: AsyncClient, session: AsyncSession
) -> None:
    pending: User = await make_user(session, status=UserStatus.PENDING, role=None)
    res: Response = await client.post(
        "/api/auth/login",
        json={"email": pending.email, "password": "TestPass123"},
    )
    assert res.status_code == 403


async def test_logged_in_user_can_delete_own_account(
    client: AsyncClient, session: AsyncSession
) -> None:
    user: User = await make_user(session)
    res: Response = await client.delete("/api/users/me", headers=auth_headers(user))
    assert res.status_code == 204
