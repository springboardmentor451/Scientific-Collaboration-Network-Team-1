from app.models import User
from httpx import AsyncClient, Response
from sqlalchemy.ext.asyncio.session import AsyncSession
from tests.conftest import auth_headers, make_user
from tests.integration.helpers import USER_URL


# Delete self (User Service)
async def test_delete_own_account_success(
    client: AsyncClient, session: AsyncSession
) -> None:
    user: User = await make_user(session)
    res: Response = await client.delete(f"{USER_URL}/me", headers=auth_headers(user))
    assert res.status_code == 204


async def test_delete_own_account_unauthenticated(client: AsyncClient) -> None:
    res: Response = await client.delete(f"{USER_URL}/me")
    assert res.status_code in (401, 403)
