from enum import StrEnum
from typing import Final

PASSWORD_MIN_LENGTH: Final[int] = 8
PASSWORD_MAX_LENGTH: Final[int] = 128
USERNAME_MAX_LENGTH: Final[int] = 100
COUNTRY_MAX_LENGTH: Final[int] = 100
CITY_MAX_LENGTH: Final[int] = 100

ACADEMIC_SUFFIXES: Final[frozenset[str]] = frozenset(
    {".edu", ".ac.uk", ".ac.in", ".edu.au"}
)


class TokenFields:
    SUBJECT: Final[str] = "sub"
    TYPE: Final[str] = "type"
    EXPIRY: Final[str] = "exp"


class TokenType:
    ACCESS: Final[str] = "access"
    REFRESH: Final[str] = "refresh"
    BEARER: Final[str] = "bearer"


class UserRole(StrEnum):
    RESEARCHER = "researcher"
    INSTITUTION_ADMIN = "institution_admin"
    REVIEWER = "reviewer"
    SYSTEM_ADMIN = "system_admin"


class UserStatus(StrEnum):
    PENDING = "pending"
    ACTIVE = "active"
    REJECTED = "rejected"
    BANNED = "banned"


class InstitutionType(StrEnum):
    UNIVERSITY = "university"
