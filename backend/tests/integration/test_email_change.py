from app.models import User
from httpx import AsyncClient, Response
from sqlalchemy.ext.asyncio import AsyncSession
from tests.conftest import (
    KNOWN_VERIFICATION_CODE,
    auth_headers,
    make_user,
    mock_verification_code,
)

AUTH_URL = "/api/auth"
VERIFY_EMAIL_URL = f"{AUTH_URL}/verify-email"
REQUEST_EMAIL_CHANGE_URL = f"{AUTH_URL}/request-email-change"
VERIFY_EMAIL_CHANGE_URL = f"{AUTH_URL}/verify-email-change"


# Email change flow
async def test_request_email_change_success(
    client: AsyncClient, researcher_user: User, mock_verification_code: str
) -> None:
    res: Response = await client.post(
        REQUEST_EMAIL_CHANGE_URL,
        json={"new_email": "newemail@ox.ac.uk"},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 200
    assert "verification" in res.json()["message"].lower()


async def test_request_email_change_invalid_domain(
    client: AsyncClient, researcher_user: User
) -> None:
    res: Response = await client.post(
        REQUEST_EMAIL_CHANGE_URL,
        json={"new_email": "newemail@gmail.com"},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 422


async def test_request_email_change_already_in_use(
    client: AsyncClient,
    researcher_user: User,
    session: AsyncSession,
    mock_verification_code: str,
) -> None:
    other: User = await make_user(session, email="taken@ox.ac.uk")
    res: Response = await client.post(
        REQUEST_EMAIL_CHANGE_URL,
        json={"new_email": other.email},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 409


async def test_verify_email_change_success(
    client: AsyncClient, researcher_user: User, mock_verification_code: str
) -> None:
    await client.post(
        REQUEST_EMAIL_CHANGE_URL,
        json={"new_email": "changed@ox.ac.uk"},
        headers=auth_headers(researcher_user),
    )
    res: Response = await client.post(
        VERIFY_EMAIL_CHANGE_URL,
        json={"email": researcher_user.email, "code": KNOWN_VERIFICATION_CODE},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 200
    assert "updated" in res.json()["message"].lower()


async def test_verify_email_change_not_pending(
    client: AsyncClient, researcher_user: User
) -> None:
    res: Response = await client.post(
        VERIFY_EMAIL_CHANGE_URL,
        json={"email": researcher_user.email, "code": KNOWN_VERIFICATION_CODE},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 400
    assert "no email change" in res.json()["detail"]


# Verify using invalid email format
async def test_verify_email_invalid_format(client: AsyncClient) -> None:
    res: Response = await client.post(
        VERIFY_EMAIL_URL, json={"email": "notanemail", "code": "123456"}
    )
    assert res.status_code == 422
