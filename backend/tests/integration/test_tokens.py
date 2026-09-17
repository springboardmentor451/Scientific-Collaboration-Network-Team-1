from app.models import User
from httpx import AsyncClient, Response
from tests.conftest import KNOWN_VERIFICATION_CODE, mock_verification_code
from tests.integration.helpers import LOGIN_URL, PASSWORD, VERIFY_LOGIN_URL


# Logout
async def test_logout_revokes_token(
    client: AsyncClient, researcher_user: User, mock_verification_code: str
) -> None:
    # complete login flow
    await client.post(
        LOGIN_URL, json={"email": researcher_user.email, "password": PASSWORD}
    )
    verify_res: Response = await client.post(
        VERIFY_LOGIN_URL,
        json={"email": researcher_user.email, "code": KNOWN_VERIFICATION_CODE},
    )
    assert verify_res.status_code == 200
    refresh_token = verify_res.json()["refresh_token"]
    access_token = verify_res.json()["access_token"]

    logout_res: Response = await client.post(
        "/api/auth/logout",
        json={"refresh_token": refresh_token},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert logout_res.status_code == 204

    # refresh with revoked token should fail
    refresh_res: Response = await client.post(
        "/api/auth/refresh", json={"refresh_token": refresh_token}
    )
    assert refresh_res.status_code == 401


# Use access_token where refresh_token is expected
async def test_refresh_with_access_token_fails(
    client: AsyncClient, researcher_user, mock_verification_code: str
) -> None:
    await client.post(
        LOGIN_URL, json={"email": researcher_user.email, "password": "TestPass123"}
    )
    verify_res: Response = await client.post(
        VERIFY_LOGIN_URL,
        json={"email": researcher_user.email, "code": KNOWN_VERIFICATION_CODE},
    )
    access_token = verify_res.json()["access_token"]
    res: Response = await client.post(
        "/api/auth/refresh", json={"refresh_token": access_token}
    )
    assert res.status_code == 400
    assert "invalid" in res.json()["detail"]


# Verification code reuse
async def test_verify_login_verification_code_reuse_fails(
    client: AsyncClient, researcher_user, mock_verification_code: str
) -> None:
    await client.post(
        LOGIN_URL, json={"email": researcher_user.email, "password": "TestPass123"}
    )
    # first use succeeds
    await client.post(
        VERIFY_LOGIN_URL,
        json={"email": researcher_user.email, "code": KNOWN_VERIFICATION_CODE},
    )
    # second use code was deleted after first use
    res: Response = await client.post(
        VERIFY_LOGIN_URL,
        json={"email": researcher_user.email, "code": KNOWN_VERIFICATION_CODE},
    )
    assert res.status_code in (400, 404)
