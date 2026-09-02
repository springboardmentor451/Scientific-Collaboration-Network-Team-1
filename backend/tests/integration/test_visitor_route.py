from httpx import AsyncClient, Response


async def test_visitor_can_browse_publications(client: AsyncClient) -> None:
    res: Response = await client.get("/api/publications/")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


async def test_visitor_can_browse_institutions(client: AsyncClient) -> None:
    res: Response = await client.get("/api/institutions/")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


async def test_visitor_can_browse_conferences(client: AsyncClient) -> None:
    res: Response = await client.get("/api/conferences/")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


async def test_visitor_can_view_public_stats(client: AsyncClient) -> None:
    res: Response = await client.get("/api/dashboard/public")
    assert res.status_code == 200
    assert "total_researchers" in res.json()
    assert "total_publications" in res.json()
    assert "total_institutions" in res.json()


async def test_visitor_cannot_access_dashboard(client: AsyncClient) -> None:
    res: Response = await client.get("/api/dashboard/me")
    assert res.status_code in (401, 403)


async def test_visitor_cannot_create_publication(client: AsyncClient) -> None:
    res: Response = await client.post(
        "/api/publications/",
        json={"title": "Test", "publication_type": "journal", "status": "draft"},
    )
    assert res.status_code in (401, 403)


async def test_visitor_cannot_access_pending_users(client: AsyncClient) -> None:
    res: Response = await client.get("/api/users/pending")
    assert res.status_code in (401, 403)


async def test_visitor_cannot_create_researcher(client: AsyncClient) -> None:
    res: Response = await client.post(
        "/api/researchers/",
        json={"full_name": "Test"},
    )
    assert res.status_code in (401, 403)
