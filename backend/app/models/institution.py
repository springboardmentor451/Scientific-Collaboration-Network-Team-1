from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core import Base
from app.core.constants import CITY_MAX_LENGTH, COUNTRY_MAX_LENGTH, InstitutionType

if TYPE_CHECKING:
    from app.models.researcher import Researcher


class Institution(Base):
    __tablename__: str = "institutions"

    institution_id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    city: Mapped[str] = mapped_column(String(CITY_MAX_LENGTH), nullable=False)
    country: Mapped[str | None] = mapped_column(
        String(COUNTRY_MAX_LENGTH), nullable=False
    )
    type: Mapped[InstitutionType] = mapped_column(
        Enum(InstitutionType),
        default=InstitutionType.UNIVERSITY,
        nullable=False,
    )
    website: Mapped[str | None] = mapped_column(String, nullable=True)
    researchers: Mapped[list[Researcher]] = relationship(
        "Researcher", back_populates="institution"
    )

    def __repr__(self) -> str:
        return f"<Institution(name={self.name}, country={self.country})>"
