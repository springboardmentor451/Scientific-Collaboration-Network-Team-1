from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    action = Column(String(100), nullable=False) # e.g. "CREATE_PUBLICATION", "ANALYZE_NETWORK", "UPDATE_RESEARCHER"
    entity_type = Column(String(100), nullable=True) # e.g. "Researcher", "Publication", "Project"
    entity_id = Column(Integer, nullable=True)
    
    ip_address = Column(String(45), nullable=True)
    details = Column(Text, nullable=True) # JSON or descriptive string
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    user = relationship("User", back_populates="audit_logs")
