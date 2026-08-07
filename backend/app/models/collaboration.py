from __future__ import annotations

from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core import Base

if TYPE_CHECKING:
    from app.models.researcher import Researcher


class Collaboration(Base):
    __tablename__: str = "collaborations"

    collaboration_id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    researcher_id_1: Mapped[int] = mapped_column(
        ForeignKey("researchers.researcher_id", ondelete="CASCADE"), nullable=False
    )
    researcher_id_2: Mapped[int] = mapped_column(
        ForeignKey("researchers.researcher_id", ondelete="CASCADE"), nullable=False
    )
    collaboration_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    collaboration_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(UTC), nullable=False
    )
    researcher_1: Mapped[Researcher] = relationship(
        "Researcher",
        foreign_keys=[researcher_id_1],
        back_populates="collaborations_as_researcher_1",
    )
    researcher_2: Mapped[Researcher] = relationship(
        "Researcher",
        foreign_keys=[researcher_id_2],
        back_populates="collaborations_as_researcher_2",
    )
    __table_args__ = (
        UniqueConstraint(
            "researcher_id_1", "researcher_id_2", name="uq_researcher_collaboration"
        ),
    )

    def __repr__(self) -> str:
        return (
            f"<Collaboration("
            f"id={self.collaboration_id}, "
            f"researcher_1={self.researcher_id_1}, "
            f"researcher_2={self.researcher_id_2}"
            f")>"
        )
