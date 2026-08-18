from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Collaboration(Base):
    __tablename__ = "collaborations"

    id = Column(Integer, primary_key=True, index=True)
    researcher_a_id = Column(Integer, ForeignKey("researchers.id", ondelete="CASCADE"), nullable=False, index=True)
    researcher_b_id = Column(Integer, ForeignKey("researchers.id", ondelete="CASCADE"), nullable=False, index=True)
    
    coauthored_papers_count = Column(Integer, default=1, nullable=False)
    weight = Column(Float, default=1.0, nullable=False)
    last_collaboration_year = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("researcher_a_id", "researcher_b_id", name="uq_researcher_pair"),
    )

    researcher_a = relationship("Researcher", foreign_keys=[researcher_a_id], back_populates="collaborations_as_a")
    researcher_b = relationship("Researcher", foreign_keys=[researcher_b_id], back_populates="collaborations_as_b")
