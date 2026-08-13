import re
from datetime import datetime
from typing import ClassVar

from pydantic import BaseModel, ConfigDict, EmailStr, Field, SecretStr, field_validator

from app.core.constants import (
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    VERIFICATION_CODE_LENGTH,
    UserRole,
    UserStatus,
)
from app.core.domains import is_research_email
from app.schemas.base import ResponseBase


def validate_research_email(email: str) -> str:
    if not is_research_email(email):
        raise ValueError("email must be from a recognised institution")
    return email


def validate_password_strength(password: SecretStr) -> SecretStr:
    raw: str = password.get_secret_value()
    if not re.search(r"[A-Za-z]", raw):
        raise ValueError("password must contain atleast one letter")
    if not re.search(r"\d", raw):
        raise ValueError("password must contain atleast one number")
    return password


# -- Core Models --
class UserBase(BaseModel):
    email: EmailStr

    @field_validator("email", mode="before")
    @classmethod
    def check_domain(cls, email: str) -> str:
        return validate_research_email(email)


class PasswordValidatorMixin(BaseModel):
    @field_validator("password", mode="after")
    @classmethod
    def check_strength(cls, password: SecretStr)  -> SecretStr:
        return validate_password_strength(password)


class RequiredPasswordMixin(PasswordValidatorMixin):
    password: SecretStr = Field(
        min_length=PASSWORD_MIN_LENGTH, max_length=PASSWORD_MAX_LENGTH
    )


class OptionalPasswordMixin(PasswordValidatorMixin):
    password: SecretStr | None = Field(
        default=None, min_length=PASSWORD_MIN_LENGTH, max_length=PASSWORD_MAX_LENGTH
    )


# -- Requests --
class UserRequest(UserBase, RequiredPasswordMixin):
    model_config = ConfigDict(extra="forbid")


class UserUpdateRequest(OptionalPasswordMixin):
    PASSWORD_FIELD: ClassVar[str] = "password"


class UserStatusUpdateRequest(BaseModel):
    status: UserStatus


class UserRoleUpdateRequest(BaseModel):
    role: UserRole


class VerificationCodeRequest(UserBase):
    code: str = Field(
        min_length=VERIFICATION_CODE_LENGTH, max_length=VERIFICATION_CODE_LENGTH
    )


class RefreshRequest(BaseModel):
    refresh_token: str


# -- Responses --
class UserResponse(ResponseBase):
    user_id: int
    email: EmailStr
    role: UserRole
    status: UserStatus


class TokenPayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    sub: str
    token_type: str = Field(alias="type")
    exp: datetime


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str
