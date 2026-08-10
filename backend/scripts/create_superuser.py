import asyncio
import logging
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).parent.parent))
load_dotenv()

from app.core import logging_config  # noqa: F401
from app.core.constants import UserRole, UserStatus
from app.core.database import session
from app.core.security import hash_password, verify_password
from app.models import User
from pydantic import SecretStr
from sqlalchemy import select

logger: logging.Logger = logging.getLogger(__name__)


async def create_superuser() -> None:
    """Bootstrap the very first system admin."""
    email: str = os.environ.get("ADMIN_EMAIL", "")
    password = SecretStr(os.environ.get("ADMIN_PASSWORD", ""))

    if not email or not password:
        raise SystemExit(
            "[superuser] ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env"
        )

    async with session() as db:
        # Guard - only one system admin allowed
        existing_admin: User | None = await db.scalar(
            select(User).where(User.role == UserRole.SYSTEM_ADMIN)
        )
        if existing_admin:
            raise SystemExit("[superuser] A system admin already exists")

        # Guard - prevent duplicate email
        existing: User | None = await db.scalar(select(User).where(User.email == email))
        if existing:
            raise SystemExit(f"[superuser] user already exists: {email}")

        admin = User(
            email=email,
            password=password,
            role=UserRole.SYSTEM_ADMIN,
            status=UserStatus.ACTIVE,
        )
        admin.is_verified = True
        db.add(admin)
        await db.commit()
        logger.info("[superuser] created: %s", email)


async def replace_superuser() -> None:
    """Replace the current system admin with new credentials."""
    current_email: str = os.environ.get("CURRENT_ADMIN_EMAIL", "")
    current_password = SecretStr(os.environ.get("CURRENT_ADMIN_PASSWORD", ""))
    new_email: str = os.environ.get("NEW_ADMIN_EMAIL", "")
    new_password = SecretStr(os.environ.get("NEW_ADMIN_PASSWORD", ""))

    if not current_email or not current_password or not new_email or not new_password:
        raise SystemExit(
            "[replace_admin] CURRENT/NEW admin credentials must be set in .env"
        )

    async with session() as db:
        admin: User | None = await db.scalar(
            select(User).where(User.role == UserRole.SYSTEM_ADMIN)
        )
        if not admin:
            raise SystemExit("[replace_admin] No system admin found")

        # Verify current credentials (email and password hash check)
        if admin.email != current_email or not verify_password(
            current_password, admin.password
        ):
            raise SystemExit("[replace_admin] Invalid current admin credentials")

        # Update to new credentials
        admin.email = new_email
        admin.password = hash_password(new_password)
        admin.is_verified = True
        await db.commit()
        logger.info("[replace_admin] System admin replaced with %s", new_email)


if __name__ == "__main__":
    # Simple CLI - choose action via ENV variable
    action: str = os.environ.get("ADMIN_ACTION", "create").lower()
    if action == "create":
        asyncio.run(create_superuser())
    elif action == "replace":
        asyncio.run(replace_superuser())
    else:
        raise SystemExit("[admin] ADMIN_ACTION must be 'create' or 'replace'")
