from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Citation(Base):
    __tablename__ = "citations"

    id = Column(Integer, primary_key=True, index=True)
    citing_publication_id = Column(Integer, ForeignKey("publications.id", ondelete="CASCADE"), nullable=False, index=True)
    cited_publication_id = Column(Integer, ForeignKey("publications.id", ondelete="CASCADE"), nullable=False, index=True)
    
    citation_year = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("citing_publication_id", "cited_publication_id", name="uq_citation_pair"),
    )

    citing_publication = relationship("Publication", foreign_keys=[citing_publication_id], back_populates="citations_made")
    cited_publication = relationship("Publication", foreign_keys=[cited_publication_id], back_populates="citations_received")
