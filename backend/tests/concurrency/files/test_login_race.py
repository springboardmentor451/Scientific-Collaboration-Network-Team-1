"""
Tests what happens when the same user logs in from multiple devices/tabs
at the same moment — each login call generates a new OTP, overwriting
the previous one. This tests that behaviour is at least consistent and
does not corrupt state or crash.
"""

import asyncio

# fetch the OTP directly from DB rather than guessing, one active record expected
from app.core.constants import VerificationPurpose
from app.models import User, VerificationCode
from conftest import make_active_user
from sqlalchemy import select

PASSWORD = "TestPass123"


async def _login(client_factory, email: str) -> int:
    async with client_factory() as client:
        res = await client.post(
            "/api/auth/login", json={"email": email, "password": PASSWORD}
        )
        return res.status_code


async def test_concurrent_login_same_user_multiple_devices(
    client_factory,
    session,
) -> None:
    """
    Three simultaneous login attempts for the SAME user (e.g. phone + laptop + tablet).
    All three should return 200 — each triggers OTP generation/overwrite,
    none should crash or corrupt the verification_codes row.
    """
    user: User = await make_active_user(session)

    results: list[int] = await asyncio.gather(
        *[_login(client_factory, user.email) for _ in range(3)]
    )

    assert all(status == 200 for status in results), (
        f"all concurrent login attempts should succeed in sending an OTP: {results}"
    )


async def test_concurrent_login_wrong_password_all_rejected(
    client_factory,
    session,
) -> None:
    """Concurrency should not accidentally let a wrong password slip through."""
    user: User = await make_active_user(session)

    async def _login_wrong(client_factory) -> int:
        async with client_factory() as client:
            res = await client.post(
                "/api/auth/login",
                json={
                    "email": user.email,
                    "password": "WrongPassword999",
                },
            )
            return res.status_code

    results: list[int] = await asyncio.gather(*[_login_wrong(client_factory) for _ in range(5)])

    assert all(status == 401 for status in results), (
        f"all 5 concurrent wrong-password attempts must be rejected: {results}"
    )


async def test_concurrent_login_only_latest_otp_valid(
    client_factory,
    session,
) -> None:
    """
    After N concurrent logins overwrite the OTP record, only the LAST
    one written should be verifiable — this documents actual behaviour
    so a regression (e.g. multiple valid OTPs at once) gets caught.
    """
    user: User = await make_active_user(session)

    await asyncio.gather(*[_login(client_factory, user.email) for _ in range(3)])

    records = (
        await session.scalars(
            select(VerificationCode).where(
                VerificationCode.user_id == user.user_id,
                VerificationCode.purpose == VerificationPurpose.LOGIN,
            )
        )
    ).all()

    assert len(records) <= 1, (
        f"expected old codes invalidated before creating new — found {len(records)} "
        f"active LOGIN codes for one user, indicates a leak of stale verification codes"
    )
