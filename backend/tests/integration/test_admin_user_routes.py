from app.core.constants import UserRole, UserStatus
from app.models import User
from httpx import AsyncClient, Response
from sqlalchemy.ext.asyncio.session import AsyncSession
from tests.conftest import auth_headers, make_user
from tests.integration.helpers import USER_URL


# Pending users
async def test_get_pending_users_as_admin(
    client: AsyncClient, admin_user: User, session: AsyncSession
) -> None:
    await make_user(session, email="pending1@mit.edu", status=UserStatus.PENDING)
    res: Response = await client.get(
        str(f"{USER_URL}/pending"), headers=auth_headers(admin_user)
    )
    assert res.status_code == 200
    assert isinstance(res.json(), list)
    assert all(u["status"] == "pending" for u in res.json())


async def test_get_pending_users_as_researcher_forbidden(
    client: AsyncClient, researcher_user: User
) -> None:
    res: Response = await client.get(
        str(f"{USER_URL}/pending"), headers=auth_headers(researcher_user)
    )
    assert res.status_code == 403


# Approve
async def test_approve_pending_user(
    client: AsyncClient, admin_user: User, session: AsyncSession
) -> None:
    pending: User = await make_user(
        session,
        email="toapprove@mit.edu",
        status=UserStatus.PENDING,
        requested_role=UserRole.RESEARCHER,
    )
    res: Response = await client.patch(
        f"{USER_URL}/{pending.user_id}/approve", headers=auth_headers(admin_user)
    )
    assert res.status_code == 200
    assert res.json()["status"] == UserStatus.ACTIVE


async def test_approve_active_user_rejected(
    client: AsyncClient, admin_user: User, researcher_user: User
) -> None:
    res: Response = await client.patch(
        f"{USER_URL}/{researcher_user.user_id}/approve",
        headers=auth_headers(admin_user),
    )
    assert res.status_code == 409


# Reject
async def test_reject_pending_user(
    client: AsyncClient, admin_user: User, session: AsyncSession
) -> None:
    pending: User = await make_user(
        session, email="toreject@mit.edu", status=UserStatus.PENDING
    )
    res: Response = await client.patch(
        f"{USER_URL}/{pending.user_id}/reject", headers=auth_headers(admin_user)
    )
    assert res.status_code == 200
    assert res.json()["status"] == UserStatus.REJECTED


# Ban
async def test_ban_user(
    client: AsyncClient, admin_user: User, researcher_user: User
) -> None:
    res: Response = await client.patch(
        f"{USER_URL}/{researcher_user.user_id}/ban", headers=auth_headers(admin_user)
    )
    assert res.status_code == 200
    assert res.json()["status"] == UserStatus.BANNED


async def test_ban_already_banned_rejected(
    client: AsyncClient, admin_user: User, session: AsyncSession
) -> None:
    banned: User = await make_user(
        session, email="alreadybanned@mit.edu", status=UserStatus.BANNED
    )
    res: Response = await client.patch(
        f"{USER_URL}/{banned.user_id}/ban", headers=auth_headers(admin_user)
    )
    assert res.status_code == 409


# Non-existent user
async def test_approve_nonexistent_user(client: AsyncClient, admin_user: User) -> None:
    res: Response = await client.patch(
        f"{USER_URL}/99999/approve", headers=auth_headers(admin_user)
    )
    assert res.status_code == 404


async def test_ban_nonexistent_user(client: AsyncClient, admin_user: User) -> None:
    res: Response = await client.patch(
        f"{USER_URL}/99999/ban", headers=auth_headers(admin_user)
    )
    assert res.status_code == 404


# Delete
async def test_deleted_user_cannot_access_protected_routes(
    client: AsyncClient, session: AsyncSession
) -> None:
    user: User = await make_user(session)
    headers = auth_headers(user)
    await client.delete(f"{USER_URL}/me", headers=headers)
    # token is still valid but user no longer exists in DB
    res: Response = await client.get(f"{USER_URL}/pending", headers=headers)
    assert res.status_code in (401, 403)


async def test_admin_delete_user_by_id(
    client: AsyncClient, admin_user: User, session: AsyncSession
) -> None:
    target: User = await make_user(session)
    res: Response = await client.delete(
        f"{USER_URL}/{target.user_id}", headers=auth_headers(admin_user)
    )
    assert res.status_code == 204


async def test_admin_delete_nonexistent_user(
    client: AsyncClient, admin_user: User
) -> None:
    res: Response = await client.delete(
        f"{USER_URL}/99999", headers=auth_headers(admin_user)
    )
    assert res.status_code == 404


async def test_researcher_cannot_delete_other_user(
    client: AsyncClient, researcher_user: User, session: AsyncSession
) -> None:
    other: User = await make_user(session)
    res: Response = await client.delete(
        f"{USER_URL}/{other.user_id}", headers=auth_headers(researcher_user)
    )
    assert res.status_code == 403


async def test_admin_delete_own_account_via_by_id(
    client: AsyncClient, session: AsyncSession
) -> None:
    # admin can delete any user including themselves via the admin route
    admin: User = await make_user(session, role=UserRole.SYSTEM_ADMIN)
    res: Response = await client.delete(
        f"{USER_URL}/{admin.user_id}", headers=auth_headers(admin)
    )
    assert res.status_code == 204
