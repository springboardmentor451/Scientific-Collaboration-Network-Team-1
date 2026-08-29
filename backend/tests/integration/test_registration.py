from app.core.constants import UserRole, UserStatus
from app.models import User
from httpx import AsyncClient, Response
from sqlalchemy.ext.asyncio import AsyncSession
from tests.conftest import KNOWN_VERIFICATION_CODE, make_user, mock_verification_code
from tests.integration.helpers import AUTH_URL, PASSWORD

REGISTER_URL = f"{AUTH_URL}/register"
VERIFY_EMAIL_URL = f"{AUTH_URL}/verify-email"


# Registration
async def test_register_success(client: AsyncClient) -> None:
    res: Response = await client.post(
        REGISTER_URL, json={"email": "newuser@mit.edu", "password": PASSWORD}
    )
    assert res.status_code == 201
    assert "message" in res.json()


async def test_register_success_with_role(client: AsyncClient) -> None:
    res: Response = await client.post(
        REGISTER_URL,
        json={
            "email": "newuser@mit.edu",
            "password": PASSWORD,
            "requested_role": UserRole.RESEARCHER,
        },
    )
    assert res.status_code == 201
    assert "message" in res.json()


async def test_register_invalid_domain(client: AsyncClient) -> None:
    res: Response = await client.post(
        REGISTER_URL, json={"email": "user@gmail.com", "password": PASSWORD}
    )
    assert res.status_code == 422
    assert "recognised institution" in str(res.json())


async def test_register_password_no_letter(client: AsyncClient) -> None:
    res: Response = await client.post(
        REGISTER_URL, json={"email": "user@mit.edu", "password": "12345678"}
    )
    assert res.status_code == 422
    assert "letter" in str(res.json())


async def test_register_password_no_number(client: AsyncClient) -> None:
    res: Response = await client.post(
        REGISTER_URL, json={"email": "user@mit.edu", "password": "onlyletters"}
    )
    assert res.status_code == 422
    assert "number" in str(res.json())


async def test_register_extra_fields_rejected(client: AsyncClient) -> None:
    res: Response = await client.post(
        REGISTER_URL,
        json={
            "email": "user@mit.edu",
            "password": PASSWORD,
            "requested_role": UserRole.RESEARCHER,
            "extra_field": "bad",
        },
    )
    assert res.status_code == 422


async def test_register_system_admin_role_rejected(client: AsyncClient) -> None:
    res: Response = await client.post(
        REGISTER_URL,
        json={
            "email": "user2@mit.edu",
            "password": PASSWORD,
            "requested_role": "system_admin",
        },
    )
    assert res.status_code == 422
    assert "system admin" in str(res.json())


async def test_register_reviewer_role_accepted(client: AsyncClient) -> None:
    res: Response = await client.post(
        REGISTER_URL,
        json={
            "email": "reviewer@ox.ac.uk",
            "password": PASSWORD,
            "requested_role": UserRole.REVIEWER,
        },
    )
    assert res.status_code == 201


async def test_register_institution_role_accepted(client: AsyncClient) -> None:
    res: Response = await client.post(
        REGISTER_URL,
        json={
            "email": "institution_admin@ox.ac.uk",
            "password": PASSWORD,
            "requested_role": UserRole.INSTITUTION_ADMIN,
        },
    )
    assert res.status_code == 201


async def test_register_duplicate_active_user(
    client: AsyncClient, researcher_user: User
) -> None:
    res: Response = await client.post(
        REGISTER_URL, json={"email": researcher_user.email, "password": PASSWORD}
    )
    assert res.status_code == 409
    assert "already exists" in res.json()["detail"]


async def test_register_unverified_resends_verification_code(
    client: AsyncClient, session: AsyncSession
) -> None:
    unverified: User = await make_user(
        session,
        email="unverified@stanford.edu",
        status=UserStatus.PENDING,
        is_verified=False,
    )
    res: Response = await client.post(
        REGISTER_URL, json={"email": unverified.email, "password": PASSWORD}
    )
    assert res.status_code == 201
    assert "unverified" in res.json()["message"].lower()


# Email verification
async def test_verify_email_success(
    client: AsyncClient, mock_verification_code: str
) -> None:
    # register first
    EMAIL_ADDRESS = "verifytest@mit.edu"
    res = await client.post(
        REGISTER_URL, json={"email": EMAIL_ADDRESS, "password": PASSWORD}
    )
    assert res.status_code == 201
    # verify with known verification code
    res: Response = await client.post(
        VERIFY_EMAIL_URL,
        json={"email": "verifytest@mit.edu", "code": KNOWN_VERIFICATION_CODE},
    )
    assert res.status_code == 200
    assert "verified" in res.json()["message"].lower()


async def test_verify_wrong_code(client: AsyncClient, session: AsyncSession) -> None:
    user: User = await make_user(
        session,
        email="wrongcode@harvard.edu",
        status=UserStatus.PENDING,
        is_verified=False,
    )
    res: Response = await client.post(
        VERIFY_EMAIL_URL, json={"email": user.email, "code": KNOWN_VERIFICATION_CODE}
    )
    assert res.status_code in (400, 404)


async def test_verify_already_verified(
    client: AsyncClient, researcher_user: User
) -> None:
    res: Response = await client.post(
        VERIFY_EMAIL_URL,
        json={"email": researcher_user.email, "code": KNOWN_VERIFICATION_CODE},
    )
    assert res.status_code == 400
    assert "already verified" in res.json()["detail"]


async def test_verify_banned_user_rejected(
    client: AsyncClient, session: AsyncSession
) -> None:
    banned: User = await make_user(
        session,
        email="banned@ox.ac.uk",
        status=UserStatus.BANNED,
        is_verified=False,
    )
    res: Response = await client.post(
        VERIFY_EMAIL_URL, json={"email": banned.email, "code": "000000"}
    )
    assert res.status_code == 403


# Missing fields
async def test_register_missing_password(client: AsyncClient) -> None:
    res: Response = await client.post(REGISTER_URL, json={"email": "user@mit.edu"})
    assert res.status_code == 422


async def test_register_missing_email(client: AsyncClient) -> None:
    res: Response = await client.post(REGISTER_URL, json={"password": "TestPass123"})
    assert res.status_code == 422
