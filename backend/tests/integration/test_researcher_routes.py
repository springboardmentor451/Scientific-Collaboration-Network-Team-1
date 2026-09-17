from app.models import User
from httpx import AsyncClient, Response
from sqlalchemy.ext.asyncio import AsyncSession
from tests.conftest import auth_headers, make_user

RESEARCHER_URL = "/api/researchers"


async def test_get_nonexistent_researcher(client: AsyncClient) -> None:
    res: Response = await client.get(f"{RESEARCHER_URL}/99999")
    assert res.status_code == 404


async def test_create_researcher_without_auth(client: AsyncClient) -> None:
    res: Response = await client.post(f"{RESEARCHER_URL}/", json={"name": "Test"})
    assert res.status_code in (401, 403)


async def test_update_researcher_no_profile(
    client: AsyncClient, session: AsyncSession
) -> None:
    user: User = await make_user(session, email="noprofile2@mit.edu")
    res: Response = await client.patch(
        f"{RESEARCHER_URL}/me", json={"bio": "test"}, headers=auth_headers(user)
    )
    assert res.status_code == 404
    assert "researcher profile" in res.json()["detail"]


# institution auto-link via email domain
async def test_create_researcher_auto_links_institution(
    client: AsyncClient,
    researcher_user: User,
    admin_user: User,
    session: AsyncSession,
) -> None:
    # create institution with matching domain
    await client.post(
        "/api/institutions/",
        json={
            "name": "MIT",
            "country": "USA",
            "city": "Cambridge",
            "domain": "mit.edu",
        },
        headers=auth_headers(admin_user),
    )
    res: Response = await client.post(
        "/api/researchers/",
        json={"name": "John Smith"},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 201
    assert res.json()["institution_id"] is not None


async def test_researcher_profile_auto_links_institution_by_domain(
    client: AsyncClient, admin_user: User, researcher_user: User
) -> None:
    await client.post(
        "/api/institutions/",
        json={
            "name": "MIT",
            "country": "USA",
            "city": "Cambridge",
            "domain": "mit.edu",
        },
        headers=auth_headers(admin_user),
    )
    res: Response = await client.post(
        "/api/researchers/",
        json={"name": "John Smith"},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 201
    assert res.json()["institution_id"] is not None


async def test_create_researcher_no_matching_domain(
    client: AsyncClient, researcher_user: User
) -> None:
    # no institution with mit.edu domain - institution_id stays None
    res: Response = await client.post(
        "/api/researchers/",
        json={"name": "John Smith"},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 201
    assert res.json()["institution_id"] is None


async def test_create_researcher_manual_institution_overrides_domain(
    client: AsyncClient,
    researcher_user: User,
    admin_user: User,
    session: AsyncSession,
) -> None:
    inst_res: Response = await client.post(
        "/api/institutions/",
        json={
            "name": "Oxford",
            "country": "UK",
            "city": "Oxford",
            "domain": "oxford.ac.uk",
        },
        headers=auth_headers(admin_user),
    )
    oxford_id = inst_res.json()["institution_id"]

    await client.post(
        "/api/institutions/",
        json={
            "name": "MIT",
            "country": "USA",
            "city": "Cambridge",
            "domain": "mit.edu",
        },
        headers=auth_headers(admin_user),
    )

    # researcher@mit.edu manually picks Oxford - override
    res: Response = await client.post(
        "/api/researchers/",
        json={"name": "John Smith", "institution_id": oxford_id},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 201
    assert res.json()["institution_id"] == oxford_id
