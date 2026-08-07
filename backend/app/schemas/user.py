from datetime import datetime
from typing import ClassVar

from pydantic import BaseModel, ConfigDict, EmailStr, Field, SecretStr, field_validator

from app.core.constants import (
    ACADEMIC_SUFFIXES,
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    UserRole,
    UserStatus,
)
from app.schemas.base import ResponseBase


class UserRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: EmailStr
    password: SecretStr = Field(
        min_length=PASSWORD_MIN_LENGTH, max_length=PASSWORD_MAX_LENGTH
    )

    @field_validator("email", mode="before")
    @classmethod
    def validate_email_domain(cls, email: str) -> str:
        domain: str = email.split("@")[-1].lower()
        if not any(domain.endswith(suffix) for suffix in ACADEMIC_SUFFIXES):
            raise ValueError("email must be from an academic institution")
        return email


class UserUpdateRequest(BaseModel):
    PASSWORD_FIELD: ClassVar[str] = "password"
    password: SecretStr | None = Field(
        default=None, min_length=PASSWORD_MIN_LENGTH, max_length=PASSWORD_MAX_LENGTH
    )


class UserStatusUpdateRequest(BaseModel):
    status: UserStatus


class UserRoleUpdateRequest(BaseModel):
    role: UserRole


class UserResponse(ResponseBase):
    user_id: int
    email: EmailStr
    role: str
    status: str


class EmailVerifyRequest(BaseModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6)


class TokenPayload(BaseModel):
    sub: str
    token_type: str = Field(alias="type")
    exp: datetime
    model_config = ConfigDict(populate_by_name=True)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str


class RefreshRequest(BaseModel):
    refresh_token: str
