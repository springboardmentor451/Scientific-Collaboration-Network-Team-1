from sqlalchemy import Column, Integer, String, ForeignKey, Table, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

# Association Table: Researcher <-> Project (Many-to-Many)
project_researcher_association = Table(
    "project_researchers",
    Base.metadata,
    Column("researcher_id", Integer, ForeignKey("researchers.id", ondelete="CASCADE"), primary_key=True),
    Column("project_id", Integer, ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("role", String(100), default="Co-Investigator")
)

# Association Table: Publication <-> Author (Researcher) (Many-to-Many with authorship metadata)
publication_author_association = Table(
    "publication_authors",
    Base.metadata,
    Column("publication_id", Integer, ForeignKey("publications.id", ondelete="CASCADE"), primary_key=True),
    Column("researcher_id", Integer, ForeignKey("researchers.id", ondelete="CASCADE"), primary_key=True),
    Column("author_order", Integer, default=1),
    Column("is_corresponding", String(10), default="False")
)

class Researcher(Base):
    __tablename__ = "researchers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    email = Column(String(255), unique=True, index=True, nullable=True)
    orcid = Column(String(50), unique=True, index=True, nullable=True)
    department = Column(String(150), nullable=True)
    h_index = Column(Integer, default=0, nullable=False)
    citation_count = Column(Integer, default=0, nullable=False)
    
    institution_id = Column(Integer, ForeignKey("institutions.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    institution = relationship("Institution", back_populates="researchers")
    user_account = relationship("User", back_populates="researcher", uselist=False)
    
    projects = relationship("Project", secondary=project_researcher_association, back_populates="researchers")
    publications = relationship("Publication", secondary=publication_author_association, back_populates="authors")
    
    collaborations_as_a = relationship("Collaboration", foreign_keys="Collaboration.researcher_a_id", back_populates="researcher_a")
    collaborations_as_b = relationship("Collaboration", foreign_keys="Collaboration.researcher_b_id", back_populates="researcher_b")
