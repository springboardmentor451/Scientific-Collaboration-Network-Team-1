import asyncio
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.constants import UserRole, UserStatus
from app.core.database import session
from app.models import User
from dotenv import load_dotenv
from pydantic import SecretStr
from sqlalchemy import select

load_dotenv()


async def create_superuser() -> None:
    email: str = os.environ.get("ADMIN_EMAIL", "")
    password = SecretStr(os.environ.get("ADMIN_PASSWORD", ""))
    if not email or not password:
        raise SystemExit(
            "[superuser] ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env"
        )
    async with session() as db:
        existing: User | None = await db.scalar(select(User).where(User.email == email))
        if existing:
            raise SystemExit(f"[superuser] user already exists: {email}")
        admin = User(
            email=email,
            password=password,
            role=UserRole.SYSTEM_ADMIN,
            status=UserStatus.ACITVE,
        )
        db.add(admin)
        await db.commit()
        print(f"superuser created: {email}")


if __name__ == "__main__":
    asyncio.run(create_superuser())
