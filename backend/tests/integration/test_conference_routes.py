from app.models import User
from httpx import AsyncClient, Response
from tests.conftest import auth_headers

CONF_URL = "/api/conferences"

VALID_CONF: dict[str, str] = {
    "name": "NeurIPS 2024",
    "location": "Vancouver, Canada",
    "start_date": "2024-12-10",
    "end_date": "2024-12-15",
    "website": "https://neurips.cc",
}


async def test_get_all_conferences_public(client: AsyncClient) -> None:
    res: Response = await client.get(f"{CONF_URL}/")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


async def test_create_conference_as_admin(
    client: AsyncClient, admin_user: User
) -> None:
    res: Response = await client.post(
        f"{CONF_URL}/", json=VALID_CONF, headers=auth_headers(admin_user)
    )
    assert res.status_code == 201
    assert res.json()["name"] == VALID_CONF["name"]


async def test_create_conference_as_researcher_forbidden(
    client: AsyncClient, researcher_user: User
) -> None:
    res: Response = await client.post(
        f"{CONF_URL}/", json=VALID_CONF, headers=auth_headers(researcher_user)
    )
    assert res.status_code == 403


async def test_create_conference_unauthenticated(client: AsyncClient) -> None:
    res: Response = await client.post(f"{CONF_URL}/", json=VALID_CONF)
    assert res.status_code in (401, 403)


async def test_get_conference_by_id(client: AsyncClient, admin_user: User) -> None:
    create_res: Response = await client.post(
        f"{CONF_URL}/", json=VALID_CONF, headers=auth_headers(admin_user)
    )
    conf_id = create_res.json()["conference_id"]
    res: Response = await client.get(f"{CONF_URL}/{conf_id}")
    assert res.status_code == 200
    assert res.json()["name"] == VALID_CONF["name"]


async def test_get_conference_not_found(client: AsyncClient) -> None:
    res: Response = await client.get(f"{CONF_URL}/99999")
    assert res.status_code == 404


async def test_update_conference_as_admin(
    client: AsyncClient, admin_user: User
) -> None:
    create_res: Response = await client.post(
        f"{CONF_URL}/", json=VALID_CONF, headers=auth_headers(admin_user)
    )
    conf_id = create_res.json()["conference_id"]
    res: Response = await client.patch(
        f"{CONF_URL}/{conf_id}",
        json={"location": "Montreal, Canada"},
        headers=auth_headers(admin_user),
    )
    assert res.status_code == 200
    assert res.json()["location"] == "Montreal, Canada"


async def test_update_conference_as_researcher_forbidden(
    client: AsyncClient, admin_user: User, researcher_user: User
) -> None:
    create_res: Response = await client.post(
        f"{CONF_URL}/", json=VALID_CONF, headers=auth_headers(admin_user)
    )
    conf_id = create_res.json()["conference_id"]
    res: Response = await client.patch(
        f"{CONF_URL}/{conf_id}",
        json={"location": "London"},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 403


async def test_delete_conference_as_admin(
    client: AsyncClient, admin_user: User
) -> None:
    create_res: Response = await client.post(
        f"{CONF_URL}/", json=VALID_CONF, headers=auth_headers(admin_user)
    )
    conf_id = create_res.json()["conference_id"]
    res: Response = await client.delete(
        f"{CONF_URL}/{conf_id}", headers=auth_headers(admin_user)
    )
    assert res.status_code == 204


async def test_delete_conference_as_researcher_forbidden(
    client: AsyncClient, admin_user: User, researcher_user: User
) -> None:
    create_res: Response = await client.post(
        f"{CONF_URL}/", json=VALID_CONF, headers=auth_headers(admin_user)
    )
    conf_id = create_res.json()["conference_id"]
    res: Response = await client.delete(
        f"{CONF_URL}/{conf_id}", headers=auth_headers(researcher_user)
    )
    assert res.status_code == 403


async def test_conference_end_before_start_rejected(
    client: AsyncClient, admin_user: User
) -> None:
    res: Response = await client.post(
        f"{CONF_URL}/",
        json={**VALID_CONF, "start_date": "2024-12-15", "end_date": "2024-12-10"},
        headers=auth_headers(admin_user),
    )
    assert res.status_code == 422
