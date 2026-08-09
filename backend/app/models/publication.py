from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core import Base
from app.core.constants import PublicationStatus, PublicationType

if TYPE_CHECKING:
    from app.models.citation import Citation
    from app.models.conference import Conference
    from app.models.researcher import Researcher


class Publication(Base):
    __tablename__: str = "publications"

    publication_id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    title: Mapped[str] = mapped_column(String, nullable=False)
    abstract: Mapped[str | None] = mapped_column(Text, nullable=True)
    doi: Mapped[str | None] = mapped_column(
        String, unique=True, nullable=True, index=True
    )
    publication_type: Mapped[PublicationType] = mapped_column(
        Enum(PublicationType), nullable=False, default=PublicationType
    )
    status: Mapped[PublicationStatus] = mapped_column(
        Enum(PublicationStatus),
        nullable=False,
        default=PublicationStatus.DRAFT,
        index=True,
    )
    file_path: Mapped[str] = mapped_column(String, nullable=True)
    publication_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    conference_id: Mapped[int | None] = mapped_column(
        ForeignKey("conferences.conference_id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    conference: Mapped[Conference | None] = relationship(
        "Conference", back_populates="publications"
    )
    authors: Mapped[list[Researcher]] = relationship(
        "Researcher", secondary="publication_authors", back_populates="publications"
    )
    citations_made: Mapped[list[Citation]] = relationship(
        "Citation",
        foreign_keys="Citation.citing_publication_id",
        back_populates="citing_publication",
    )
    citations_received: Mapped[list[Citation]] = relationship(
        "Citation",
        foreign_keys="Citation.cited_publication_id",
        back_populates="cited_publication",
    )

    def __repr__(self) -> str:
        return f"<Publication(title={self.title}, status={self.status})>"
