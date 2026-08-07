from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import JSON, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core import Base

if TYPE_CHECKING:
    from app.models.institution import Institution
    from app.models.user import User


class Researcher(Base):
    __tablename__: str = "researchers"
    researcher_id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.user_id"), unique=True, nullable=False
    )
    institution_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("institutions.institution_id"), nullable=True, index=True
    )
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    department: Mapped[str | None] = mapped_column(String, nullable=True)
    orcid: Mapped[str | None] = mapped_column(String, unique=True, nullable=True)
    skills: Mapped[list[str]] = mapped_column(JSON, default=list)
    research_interests: Mapped[list[str]] = mapped_column(JSON, default=list)

    user: Mapped[User] = relationship("User", back_populates="researcher")
    institution: Mapped[Institution | None] = relationship(
        "Institution", back_populates="researchers"
    )

    def __repr__(self) -> str:
        return f"<Researcher(name={self.full_name}, department={self.department})>"
