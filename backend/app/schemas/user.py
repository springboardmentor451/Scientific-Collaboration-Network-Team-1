from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class UserRoleEnum(str, Enum):
    RESEARCHER = "Researcher"
    REVIEWER = "Reviewer"
    INSTITUTION_ADMIN = "Institution Admin"
    SYSTEM_ADMIN = "System Admin"

class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None
    role: UserRoleEnum = UserRoleEnum.RESEARCHER

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str] = None
    role: str
    is_active: bool
    is_superuser: bool
    created_at: datetime

    class Config:
        from_attributes = True
