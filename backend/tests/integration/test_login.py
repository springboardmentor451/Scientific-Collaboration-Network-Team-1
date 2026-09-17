from app.core.constants import UserStatus
from app.models import User
from httpx import AsyncClient, Response
from sqlalchemy.ext.asyncio import AsyncSession
from tests.conftest import KNOWN_VERIFICATION_CODE, make_user, mock_verification_code
from tests.integration.helpers import LOGIN_URL, PASSWORD, VERIFY_LOGIN_URL


# Login
async def test_login_sends_verification_code(
    client: AsyncClient, researcher_user: User
) -> None:
    res: Response = await client.post(
        LOGIN_URL, json={"email": researcher_user.email, "password": PASSWORD}
    )
    assert res.status_code == 200
    assert "message" in res.json()


async def test_login_wrong_password(client: AsyncClient, researcher_user: User) -> None:
    res: Response = await client.post(
        LOGIN_URL, json={"email": researcher_user.email, "password": "WrongPass999"}
    )
    assert res.status_code == 401


async def test_login_pending_blocked(
    client: AsyncClient, session: AsyncSession
) -> None:
    pending: User = await make_user(
        session, email="pending@mit.edu", status=UserStatus.PENDING
    )
    res: Response = await client.post(
        LOGIN_URL, json={"email": pending.email, "password": PASSWORD}
    )
    assert res.status_code == 403
    assert "pending" in res.json()["detail"]


async def test_login_banned_blocked(client: AsyncClient, session: AsyncSession) -> None:
    banned: User = await make_user(
        session, email="banned2@mit.edu", status=UserStatus.BANNED
    )
    res: Response = await client.post(
        LOGIN_URL, json={"email": banned.email, "password": PASSWORD}
    )
    assert res.status_code == 403
    assert "banned" in res.json()["detail"]


async def test_login_unverified_blocked(
    client: AsyncClient, session: AsyncSession
) -> None:
    unverified: User = await make_user(
        session, email="notverified@cern.ch", is_verified=False
    )
    res: Response = await client.post(
        LOGIN_URL, json={"email": unverified.email, "password": PASSWORD}
    )
    assert res.status_code == 403
    assert "verified" in res.json()["detail"]


async def test_login_rejected_blocked(
    client: AsyncClient, session: AsyncSession
) -> None:
    rejected: User = await make_user(
        session, email="rejected@ox.ac.uk", status=UserStatus.REJECTED
    )
    res: Response = await client.post(
        LOGIN_URL, json={"email": rejected.email, "password": PASSWORD}
    )
    assert res.status_code == 403
    assert "rejected" in res.json()["detail"]


# Verify login verification code, returns tokens
async def test_verify_login_verification_code_returns_tokens(
    client: AsyncClient, researcher_user: User, mock_verification_code: str
) -> None:
    # trigger login to generate verification code record
    await client.post(
        LOGIN_URL, json={"email": researcher_user.email, "password": PASSWORD}
    )
    # verify with known verification code
    res: Response = await client.post(
        VERIFY_LOGIN_URL,
        json={"email": researcher_user.email, "code": KNOWN_VERIFICATION_CODE},
    )
    assert res.status_code == 200
    assert "access_token" in res.json()
    assert "refresh_token" in res.json()
    assert res.json()["token_type"] == "bearer"


async def test_verify_login_wrong_verification_code(
    client: AsyncClient, researcher_user: User
) -> None:
    await client.post(
        LOGIN_URL, json={"email": researcher_user.email, "password": PASSWORD}
    )
    res: Response = await client.post(
        VERIFY_LOGIN_URL,
        json={"email": researcher_user.email, "code": "000000"},
    )
    assert res.status_code in (400, 404)


# Login using non-existent email
async def test_login_nonexistent_email(client: AsyncClient) -> None:
    res: Response = await client.post(
        LOGIN_URL, json={"email": "ghost@mit.edu", "password": "TestPass123"}
    )
    assert res.status_code == 401
