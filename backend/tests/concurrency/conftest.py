import os
from collections.abc import AsyncGenerator, Callable
from pathlib import Path

from app.core.config import Config
from app.core.security import hash_password
from pydantic import SecretStr
from sqlalchemy import event
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

config: Config = get_config()

TEST_DOMAINS: frozenset[str] = frozenset(
    {"mit.edu", "harvard.edu", "oxford.ac.uk", "iitd.ac.in", "stanford.edu"}
)
CONCURRENCY_DB_PATH: Path = Path(__file__).parent / "race_test.db"
TEST_DB_URL: str = f"sqlite+aiosqlite:///{CONCURRENCY_DB_PATH}"


@pytest.fixture(scope="session", autouse=True)
def inject_test_domains() -> None:
    domains_module.research_domains = set(TEST_DOMAINS)
    domains_module.domains_loaded = True


# Engine
@pytest.fixture(scope="session")
def engine() -> AsyncEngine:
    if CONCURRENCY_DB_PATH.exists():
        CONCURRENCY_DB_PATH.unlink()
    eng: AsyncEngine = create_async_engine(
        TEST_DB_URL,
        connect_args={"check_same_thread": False},
        pool_size=40,
        max_overflow=80,
        pool_timeout=60,
    )

    @event.listens_for(eng.sync_engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record) -> None:
        cursor = dbapi_connection.cursor()
        # allows concurrent readers + one writer
        cursor.execute("PRAGMA journal_mode=WAL")
        # queue instead of erroring on lock contention
        cursor.execute("PRAGMA busy_timeout=10000")
        cursor.close()

    return eng


@pytest.fixture(scope="session", autouse=True)
async def create_tables(engine: AsyncEngine) -> AsyncGenerator[None, None]:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()
    if CONCURRENCY_DB_PATH.exists():
        CONCURRENCY_DB_PATH.unlink()


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
        engine,
        expire_on_commit=False,
    )

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    def make_client() -> AsyncClient:
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
