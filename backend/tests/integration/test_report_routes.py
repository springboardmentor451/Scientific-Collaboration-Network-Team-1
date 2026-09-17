from app.models import User
from httpx import AsyncClient, Response
from tests.conftest import auth_headers

REPORT_URL = "/api/reports"


async def test_publication_csv_report_success(
    client: AsyncClient, researcher_user: User
) -> None:
    res: Response = await client.post(
        f"{REPORT_URL}/publications/csv", json={}, headers=auth_headers(researcher_user)
    )
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    assert "publications.csv" in res.headers.get("content-disposition", "")


async def test_publication_json_report_success(
    client: AsyncClient, researcher_user: User
) -> None:
    res: Response = await client.post(
        f"{REPORT_URL}/publications/json",
        json={},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 200
    assert "application/json" in res.headers["content-type"]


async def test_publication_csv_with_filters(
    client: AsyncClient, researcher_user: User
) -> None:
    res: Response = await client.post(
        f"{REPORT_URL}/publications/csv",
        json={"status": "published", "from_date": "2024-01-01"},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 200


async def test_publication_report_invalid_status(
    client: AsyncClient, researcher_user: User
) -> None:
    res: Response = await client.post(
        f"{REPORT_URL}/publications/csv",
        json={"status": "invalid_status"},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 422


async def test_collaboration_csv_report_success(
    client: AsyncClient, researcher_user: User
) -> None:
    res: Response = await client.post(
        f"{REPORT_URL}/collaborations/csv",
        json={},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]


async def test_report_unauthenticated(client: AsyncClient) -> None:
    res: Response = await client.post(f"{REPORT_URL}/publications/csv", json={})
    assert res.status_code in (401, 403)


async def test_publication_report_date_filter(
    client: AsyncClient, researcher_user: User
) -> None:
    res: Response = await client.post(
        f"{REPORT_URL}/publications/csv",
        json={"from_date": "2024-01-01", "to_date": "2024-12-31"},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 200
