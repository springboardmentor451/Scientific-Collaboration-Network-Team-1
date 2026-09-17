from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core import Base
from app.core.constants import VerificationPurpose


class VerificationCode(Base):
    __tablename__: str = "verification_codes"
    __table_args__ = (
        UniqueConstraint("user_id", "purpose", name="uq_verification_user_purpose"),
    )

    code_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"), nullable=False, index=True
    )
    secret: Mapped[str] = mapped_column(String(32), nullable=False)
    purpose: Mapped[VerificationPurpose] = mapped_column(
        Enum(VerificationPurpose), nullable=False, index=True
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
