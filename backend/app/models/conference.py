from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Conference(Base):
    __tablename__ = "conferences"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    acronym = Column(String(50), index=True, nullable=True)
    location = Column(String(200), nullable=True)
    year = Column(Integer, nullable=False, index=True)
    publisher = Column(String(150), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    publications = relationship("Publication", back_populates="conference")
