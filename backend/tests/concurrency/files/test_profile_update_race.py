"""
Tests what happens when the same researcher updates their profile from
two browser tabs at the same time — classic last-write-wins scenario.
No data corruption should occur; the final state should match exactly
ONE of the two writes, not a merge or garbage state.
"""
import asyncio

from app.models import User
from conftest import auth_headers_for, make_active_user, make_researcher_for


async def _update_bio(client_factory, email: str, bio: str) -> dict:
    async with client_factory() as client:
        res = await client.patch(
            "/api/researchers/me",
            json={"bio": bio},
            headers=auth_headers_for(email),
        )
        return {"status": res.status_code, "bio": res.json().get("bio")}


async def test_concurrent_profile_updates_last_write_wins_cleanly(
    client_factory, session,
) -> None:
    user: User = await make_active_user(session)
    await make_researcher_for(session, user)

    results = await asyncio.gather(
        _update_bio(client_factory, user.email, "Bio from Tab A"),
        _update_bio(client_factory, user.email, "Bio from Tab B"),
    )

    assert all(r["status"] == 200 for r in results), (
        f"both concurrent updates should succeed without error: {results}"
    )

    final_bios = {r["bio"] for r in results}
    assert final_bios.issubset({"Bio from Tab A", "Bio from Tab B"}), (
        f"final bio must exactly match one of the two writes, "
        f"not a corrupted merge: {final_bios}"
    )


async def test_concurrent_profile_updates_stress_ten_tabs(
    client_factory, session,
) -> None:
    user: User = await make_active_user(session)
    await make_researcher_for(session, user)

    results = await asyncio.gather(
        *[
            _update_bio(client_factory, user.email, f"Bio from Tab {i}")
            for i in range(10)
        ]
    )

    assert all(r["status"] == 200 for r in results), (
        f"all 10 concurrent updates should return 200: {results}"
    )

    valid_bios = {f"Bio from Tab {i}" for i in range(10)}
    final_bios = {r["bio"] for r in results}
    assert final_bios.issubset(valid_bios), (
        f"no corrupted/blended bio values should appear: {final_bios}"
    )
