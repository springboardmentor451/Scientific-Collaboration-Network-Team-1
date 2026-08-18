from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    expires_in_seconds: int

class TokenData(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    type: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str
