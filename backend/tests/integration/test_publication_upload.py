from io import BytesIO

from app.models import Researcher, User
from httpx import AsyncClient, Response
from tests.conftest import auth_headers, make_researcher, make_user

PUB_URL = "/api/publications"
VALID_PUB: dict[str, str] = {
    "title": "Test Publication Title Here",
    "publication_type": "journal",
    "status": "draft",
}


async def test_upload_valid_pdf(
    client: AsyncClient, researcher_user: User, researcher: Researcher
) -> None:
    create_res: Response = await client.post(
        f"{PUB_URL}/", json=VALID_PUB, headers=auth_headers(researcher_user)
    )
    pub_id = create_res.json()["publication_id"]

    fake_pdf = b"%PDF-1.4 fake pdf content"
    res: Response = await client.post(
        f"{PUB_URL}/{pub_id}/upload",
        files={"file": ("paper.pdf", BytesIO(fake_pdf), "application/pdf")},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 200
    assert res.json()["file_path"] is not None


async def test_upload_invalid_extension_rejected(
    client: AsyncClient, researcher_user: User, researcher: Researcher
) -> None:
    create_res: Response = await client.post(
        f"{PUB_URL}/", json=VALID_PUB, headers=auth_headers(researcher_user)
    )
    pub_id = create_res.json()["publication_id"]

    res: Response = await client.post(
        f"{PUB_URL}/{pub_id}/upload",
        files={"file": ("virus.exe", BytesIO(b"fake"), "application/octet-stream")},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 400
    assert "not allowed" in res.json()["detail"]


async def test_submit_without_file_rejected(
    client: AsyncClient, researcher_user: User, researcher: Researcher
) -> None:
    create_res: Response = await client.post(
        f"{PUB_URL}/", json=VALID_PUB, headers=auth_headers(researcher_user)
    )
    pub_id = create_res.json()["publication_id"]

    res: Response = await client.patch(
        f"{PUB_URL}/{pub_id}",
        json={"status": "submitted"},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 400
    assert "file" in res.json()["detail"]


async def test_publish_without_doi_rejected(
    client: AsyncClient, researcher_user: User, researcher: Researcher
) -> None:
    create_res: Response = await client.post(
        f"{PUB_URL}/", json=VALID_PUB, headers=auth_headers(researcher_user)
    )
    pub_id = create_res.json()["publication_id"]

    fake_pdf = b"%PDF-1.4 fake pdf content"
    await client.post(
        f"{PUB_URL}/{pub_id}/upload",
        files={"file": ("paper.pdf", BytesIO(fake_pdf), "application/pdf")},
        headers=auth_headers(researcher_user),
    )
    res: Response = await client.patch(
        f"{PUB_URL}/{pub_id}",
        json={"status": "published"},
        headers=auth_headers(researcher_user),
    )
    assert res.status_code == 400
    assert "DOI" in res.json()["detail"]


async def test_non_author_cannot_upload(
    client: AsyncClient, researcher_user: User, researcher: Researcher, session
) -> None:

    create_res: Response = await client.post(
        f"{PUB_URL}/", json=VALID_PUB, headers=auth_headers(researcher_user)
    )
    pub_id = create_res.json()["publication_id"]

    outsider: User = await make_user(session)
    await make_researcher(session, outsider)
    res: Response = await client.post(
        f"{PUB_URL}/{pub_id}/upload",
        files={"file": ("paper.pdf", BytesIO(b"%PDF"), "application/pdf")},
        headers=auth_headers(outsider),
    )
    assert res.status_code == 403
