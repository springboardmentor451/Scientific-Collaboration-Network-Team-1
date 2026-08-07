from __future__ import annotations

from datetime import UTC, date, datetime
from typing import TYPE_CHECKING

from app.core import Base
from sqlalchemy import Date, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.models.researcher import Researcher


class Project(Base):
    __tablename__: str = "projects"

    project_id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(UTC), nullable=False
    )
    researchers: Mapped[list[Researcher]] = relationship(
        "Researcher", secondary="project_researchers", back_populates="projects"
    )

    def __repr__(self) -> str:
        return f"<Project(id={self.project_id}, name={self.name})>"
