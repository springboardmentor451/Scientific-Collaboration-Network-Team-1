from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.researcher import publication_author_association

class Publication(Base):
    __tablename__ = "publications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False, index=True)
    doi = Column(String(100), unique=True, index=True, nullable=True)
    abstract = Column(Text, nullable=True)
    publication_year = Column(Integer, nullable=False, index=True)
    journal_name = Column(String(255), nullable=True)
    citation_count = Column(Integer, default=0, nullable=False)
    
    conference_id = Column(Integer, ForeignKey("conferences.id", ondelete="SET NULL"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    conference = relationship("Conference", back_populates="publications")
    project = relationship("Project", back_populates="publications")
    authors = relationship("Researcher", secondary=publication_author_association, back_populates="publications")
    
    citations_made = relationship("Citation", foreign_keys="Citation.citing_publication_id", back_populates="citing_publication")
    citations_received = relationship("Citation", foreign_keys="Citation.cited_publication_id", back_populates="cited_publication")
