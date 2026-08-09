from __future__ import annotations

from typing import TYPE_CHECKING

from pydantic import SecretStr
from sqlalchemy import Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core import Base
from app.core.constants import PASSWORD_MAX_LENGTH, UserRole, UserStatus
from app.core.security import hash_password, verify_password

if TYPE_CHECKING:
    from app.models.researcher import Researcher


class User(Base):
    __tablename__: str = "users"

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    password: Mapped[str] = mapped_column(String(PASSWORD_MAX_LENGTH), nullable=False)
    verification_code: Mapped[str | None] = mapped_column(String, nullable=True)
    is_verified: Mapped[bool] = mapped_column(default=False, nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole), default=UserRole.RESEARCHER, nullable=False
    )
    status: Mapped[UserStatus] = mapped_column(
        Enum(UserStatus), default=UserStatus.PENDING, nullable=False, index=True
    )
    researcher: Mapped[Researcher | None] = relationship(
        "Researcher", back_populates="user", uselist=False
    )
    login_code: Mapped[str | None] = mapped_column(String, nullable=True)

    def __init__(
        self,
        email: str,
        password: SecretStr,
        role: UserRole = UserRole.RESEARCHER,
        status: UserStatus = UserStatus.PENDING,
    ) -> None:
        self.email = email
        self.password = hash_password(password)
        self.role = role
        self.status = status

    def check_password(self, plain_password: SecretStr) -> bool:
        return verify_password(plain_password, self.password)

    def __repr__(self) -> str:
        return f"<User(email={self.email}, role={self.role}, status={self.status})>"
