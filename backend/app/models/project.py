from sqlalchemy import Column, Integer, String, Text, Numeric, Date, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.researcher import project_researcher_association

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    grant_number = Column(String(100), unique=True, index=True, nullable=True)
    funding_agency = Column(String(200), nullable=True)
    budget = Column(Numeric(12, 2), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    status = Column(String(50), default="Active", nullable=False) # Active, Completed, Proposed
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    researchers = relationship("Researcher", secondary=project_researcher_association, back_populates="projects")
    publications = relationship("Publication", back_populates="project")
