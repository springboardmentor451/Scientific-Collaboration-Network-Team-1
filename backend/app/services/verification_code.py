from collections.abc import Callable
from datetime import UTC, datetime, timedelta

import pyotp
from fastapi import HTTPException
from sqlalchemy import Insert, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import TOTP_INTERVAL, VerificationPurpose
from app.core.interfaces import EmailNotifier
from app.models import VerificationCode


class VerificationCodeService:
    def __init__(self, session: AsyncSession, email_notifier: EmailNotifier) -> None:
        self.session: AsyncSession = session
        self.email_notifier: EmailNotifier = email_notifier

    def generate_code(self) -> tuple[str, str]:
        secret: str = pyotp.random_base32()
        code: str = pyotp.TOTP(
            secret, interval=int(TOTP_INTERVAL.total_seconds())
        ).now()
        return secret, code

    def send_code(self, email: str, code: str) -> None:
        self.email_notifier.send_verification_email(email, code)

    async def create_code(
        self,
        user_id: int,
        secret: str,
        purpose: VerificationPurpose,
        expires_in: timedelta = TOTP_INTERVAL,
    ) -> None:
        dialect: str = self.session.bind.dialect.name
        insert_fn: Callable[..., Insert] = (
            pg_insert if dialect == "postgresql" else sqlite_insert
        )
        expires_at: datetime = datetime.now(UTC) + expires_in
        stmt: Insert = insert_fn(VerificationCode).values(
            user_id=user_id, secret=secret, purpose=purpose, expires_at=expires_at
        )
        stmt = stmt.on_conflict_do_update(
            index_elements=["user_id", "purpose"],
            set_={"secret": secret, "expires_at": expires_at},
        )
        await self.session.execute(stmt)
        await self.session.commit()

    async def verify_code(
        self, user_id: int, code: str, purpose: VerificationPurpose
    ) -> None:
        verification_code: VerificationCode | None = await self.session.scalar(
            select(VerificationCode).where(
                VerificationCode.user_id == user_id, VerificationCode.purpose == purpose
            )
        )
        if not verification_code:
            raise HTTPException(
                status_code=404, detail="no verification code was requested"
            )
        expires_at: datetime = verification_code.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=UTC)
        if expires_at <= datetime.now(UTC):
            raise HTTPException(
                status_code=400, detail="code expired, request a new one"
            )
        totp = pyotp.TOTP(
            verification_code.secret, interval=int(TOTP_INTERVAL.total_seconds())
        )
        if not totp.verify(code, valid_window=1):
            raise HTTPException(status_code=400, detail="incorrect code")

        await self.session.delete(verification_code)
        await self.session.commit()
