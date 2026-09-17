"""
Tests what happens when multiple identical registration requests arrive at the exact same time.
A real scenario when a user double-clicks submit, or a script/bot retries too fast.
"""

import asyncio
import uuid
from collections.abc import Callable

from httpx import AsyncClient, Response

PASSWORD = "TestPass123"


async def _register(client_factory: Callable[[], AsyncClient], email: str) -> int:
    async with client_factory() as client:
        res: Response = await client.post(
            "/api/auth/register", json={"email": email, "password": PASSWORD}
        )
        return res.status_code


async def test_concurrent_registration_same_email_only_one_succeeds(
    client_factory: Callable[[], AsyncClient],
) -> None:
    """
    Five requests, SAME email, fired at once.
    Exactly one must succeed (201). The rest must fail cleanly (409),
    never with an unhandled 500 from a raw IntegrityError.
    """
    email: str = f"race_{uuid.uuid4().hex[:8]}@mit.edu"
    results: list[int] = await asyncio.gather(
        *[_register(client_factory, email) for _ in range(5)]
    )
    success_count: int = results.count(201)
    conflict_count: int = results.count(409)
    server_error_count: int = results.count(500)
    assert server_error_count == 0, (
        f"race condition caused unhandled server errors: {results}"
    )
    assert success_count == 1, (
        f"expected exactly 1 successful registration, got {success_count}: {results}"
    )
    assert conflict_count == 4, f"expected 4 conflicts, got {conflict_count}: {results}"


async def test_concurrent_registration_different_emails_all_succeed(
    client_factory: Callable[[], AsyncClient],
) -> None:
    """Sanity check: concurrency itself is not the problem — only collisions are."""
    emails: list[str] = [f"race_{uuid.uuid4().hex[:8]}@mit.edu" for _ in range(10)]
    results: list[int] = await asyncio.gather(
        *[_register(client_factory, email) for email in emails]
    )
    assert all(status == 201 for status in results), (
        f"expected all 10 distinct registrations to succeed: {results}"
    )


async def test_concurrent_registration_stress_20_same_email(
    client_factory: Callable[[], AsyncClient],
) -> None:
    """Higher contention, 20 simultaneous identical requests."""
    email: str = f"race_{uuid.uuid4().hex[:8]}@mit.edu"
    results: list[int] = await asyncio.gather(
        *[_register(client_factory, email) for _ in range(20)]
    )
    assert results.count(201) == 1, (
        f"under high contention, still expected exactly 1 success: {results}"
    )
    assert results.count(500) == 0, (
        f"no request should ever produce an unhandled 500: {results}"
    )
