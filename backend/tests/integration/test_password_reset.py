from app.core.constants import UserStatus
from app.models import User
from httpx import AsyncClient, Response
from sqlalchemy.ext.asyncio import AsyncSession
from tests.conftest import KNOWN_VERIFICATION_CODE, make_user, mock_verification_code

FORGOT_PASSWORD_URL = "/api/auth/forgot-password"
RESET_PASSWORD_URL = "/api/auth/reset-password"


async def test_forgot_password_known_email(
    client: AsyncClient, researcher_user: User, mock_verification_code: str
) -> None:
    res: Response = await client.post(
        FORGOT_PASSWORD_URL, json={"email": researcher_user.email}
    )
    assert res.status_code == 200
    assert "code has been sent" in res.json()["message"]


async def test_forgot_password_unknown_email_same_response(client: AsyncClient) -> None:
    # security - must return same message for unknown emails
    res: Response = await client.post(
        FORGOT_PASSWORD_URL, json={"email": "ghost@mit.edu"}
    )
    assert res.status_code == 200
    assert "code has been sent" in res.json()["message"]


async def test_forgot_password_invalid_email_format(client: AsyncClient) -> None:
    res: Response = await client.post(FORGOT_PASSWORD_URL, json={"email": "notanemail"})
    assert res.status_code == 422


async def test_reset_password_success(
    client: AsyncClient, researcher_user: User, mock_verification_code: str
) -> None:
    await client.post(FORGOT_PASSWORD_URL, json={"email": researcher_user.email})
    res: Response = await client.post(
        RESET_PASSWORD_URL,
        json={
            "email": researcher_user.email,
            "code": KNOWN_VERIFICATION_CODE,
            "new_password": "NewSecure99",
            "confirm_password": "NewSecure99",
        },
    )
    assert res.status_code == 200
    assert "updated" in res.json()["message"]


async def test_reset_password_mismatch(
    client: AsyncClient, researcher_user: User, mock_verification_code: str
) -> None:
    await client.post(FORGOT_PASSWORD_URL, json={"email": researcher_user.email})
    res: Response = await client.post(
        RESET_PASSWORD_URL,
        json={
            "email": researcher_user.email,
            "code": KNOWN_VERIFICATION_CODE,
            "new_password": "NewSecure99",
            "confirm_password": "DifferentPass99",
        },
    )
    assert res.status_code == 422


async def test_reset_password_wrong_code(
    client: AsyncClient, researcher_user: User, mock_verification_code: str
) -> None:
    await client.post(FORGOT_PASSWORD_URL, json={"email": researcher_user.email})
    res: Response = await client.post(
        RESET_PASSWORD_URL,
        json={
            "email": researcher_user.email,
            "code": "999999",
            "new_password": "NewSecure99",
            "confirm_password": "NewSecure99",
        },
    )
    assert res.status_code in (400, 404)


async def test_reset_password_weak_password(
    client: AsyncClient, researcher_user: User, mock_verification_code: str
) -> None:
    await client.post(FORGOT_PASSWORD_URL, json={"email": researcher_user.email})
    res: Response = await client.post(
        RESET_PASSWORD_URL,
        json={
            "email": researcher_user.email,
            "code": KNOWN_VERIFICATION_CODE,
            "new_password": "onlyletters",
            "confirm_password": "onlyletters",
        },
    )
    assert res.status_code == 422


async def test_reset_password_banned_user(
    client: AsyncClient, session: AsyncSession, mock_verification_code: str
) -> None:
    banned: User = await make_user(session, status=UserStatus.BANNED)
    res: Response = await client.post(FORGOT_PASSWORD_URL, json={"email": banned.email})
    assert res.status_code == 403
