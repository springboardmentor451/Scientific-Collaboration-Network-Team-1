from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core import Base


class PublicationAuthor(Base):
    __tablename__: str = "publication_authors"

    publication_id: Mapped[int] = mapped_column(
        ForeignKey("publications.publication_id", ondelete="CASCADE"), primary_key=True
    )
    researcher_id: Mapped[int] = mapped_column(
        ForeignKey("researchers.researcher_id", ondelete="CASCADE"), primary_key=True
    )
