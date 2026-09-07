import os
from collections.abc import AsyncGenerator, Callable
from typing import Any

from app.core.config import Config
from app.core.security import hash_password
from pydantic import SecretStr
from sqlalchemy.ext.asyncio.engine import AsyncEngine

os.environ["FASTAPI_ENV"] = "testing"

import uuid

import pytest
from app.core import Base, get_config, get_db
from app.core import domains as domains_module
from app.core.constants import UserRole, UserStatus
from app.models.researcher import Researcher
from app.models.user import User
from app.services.token import TokenService
from httpx import ASGITransport, AsyncClient
from main import app
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

config: Config = get_config()

TEST_DOMAINS: frozenset[str] = frozenset(
    {"mit.edu", "harvard.edu", "oxford.ac.uk", "iitd.ac.in", "stanford.edu"}
)
TEST_DB_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session", autouse=True)
def inject_test_domains() -> None:
    domains_module.research_domains = set(TEST_DOMAINS)
    domains_module.domains_loaded = True


@pytest.fixture(scope="session")
def engine() -> AsyncEngine:
    return create_async_engine(
        TEST_DB_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool
    )


@pytest.fixture(scope="session", autouse=True)
async def create_tables(engine: AsyncEngine) -> AsyncGenerator[None, Any]:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def session(engine: AsyncEngine) -> AsyncGenerator:
    factory: async_sessionmaker[AsyncSession] = async_sessionmaker(
        engine, expire_on_commit=False
    )
    async with factory() as sess:
        yield sess
        await sess.rollback()


@pytest.fixture
async def client_factory(
    engine: AsyncEngine,
) -> AsyncGenerator[Callable[[], AsyncClient]]:
    """
    Concurrency tests need multiple independent client+session pairs firing at once, 
    a single shared 'client' fixture would serialize everything through one session, 
    defeating the purpose of the test.
    """
    factory: async_sessionmaker[AsyncSession] = async_sessionmaker(
        engine, expire_on_commit=False
    )

    def make_client() -> AsyncClient:
        session_for_this_client: AsyncSession = factory()

        async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
            yield session_for_this_client

        app.dependency_overrides[get_db] = override_get_db
        return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")

    yield make_client
    app.dependency_overrides.clear()


def auth_headers_for(email: str) -> dict:
    token: str = TokenService(config).create_access_token(email)
    return {"Authorization": f"Bearer {token}"}


async def make_active_user(session: AsyncSession, email: str | None = None) -> User:
    if email is None:
        email = f"race_{uuid.uuid4().hex[:8]}@mit.edu"
    user = User(email=email, password=hash_password(SecretStr("TestPass123")))
    user.role = UserRole.RESEARCHER
    user.status = UserStatus.ACTIVE
    user.is_verified = True
    session.add(user)
    await session.commit()
    return user


async def make_researcher_for(session: AsyncSession, user: User) -> Researcher:
    researcher = Researcher(
        user_id=user.user_id,
        name="Race Condition Tester",
        department="Computer Science",
        skills=[],
        research_interests=[],
    )
    session.add(researcher)
    await session.commit()
    return researcher
