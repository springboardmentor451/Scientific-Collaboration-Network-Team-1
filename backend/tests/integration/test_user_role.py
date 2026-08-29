from app.models import User
from httpx import AsyncClient, Response
from tests.conftest import auth_headers
from tests.integration.helpers import USER_URL


# Role change
async def test_admin_changes_role(
    client: AsyncClient, admin_user: User, researcher_user: User
) -> None:
    res: Response = await client.patch(
        f"{USER_URL}/{researcher_user.user_id}/role",
        json={"role": "reviewer"},
        headers=auth_headers(admin_user),
    )
    assert res.status_code == 200
    assert res.json()["role"] == "reviewer"


async def test_user_requests_role_change(
    client: AsyncClient, researcher_user: User
) -> None:
    res: Response = await client.post(
        f"{USER_URL}/me/request-role-change",
        json={"requested_role": "reviewer"},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 200
    assert "submitted" in res.json()["message"]


async def test_user_cannot_request_system_admin(
    client: AsyncClient, researcher_user: User
) -> None:
    res: Response = await client.post(
        f"{USER_URL}/me/request-role-change",
        json={"requested_role": "system_admin"},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 422


# Role change approval
async def test_approve_role_change_request(
    client: AsyncClient, admin_user: User, researcher_user: User
) -> None:
    await client.post(
        f"{USER_URL}/me/request-role-change",
        json={"requested_role": "reviewer"},
        headers=auth_headers(researcher_user),
    )
    res: Response = await client.patch(
        f"{USER_URL}/{researcher_user.user_id}/approve-role-change",
        headers=auth_headers(admin_user),
    )
    assert res.status_code == 200
    assert res.json()["role"] == "reviewer"


async def test_approve_role_change_no_request(
    client: AsyncClient, admin_user: User, researcher_user: User
) -> None:
    res: Response = await client.patch(
        f"{USER_URL}/{researcher_user.user_id}/approve-role-change",
        headers=auth_headers(admin_user),
    )
    assert res.status_code == 400
    assert "no role change" in res.json()["detail"]


async def test_role_change_same_role_rejected(
    client: AsyncClient, researcher_user: User
) -> None:
    res: Response = await client.post(
        f"{USER_URL}/me/request-role-change",
        json={"requested_role": "researcher"},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 400
