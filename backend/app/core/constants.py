from enum import StrEnum
from typing import Final

PASSWORD_MIN_LENGTH: Final[int] = 8
PASSWORD_MAX_LENGTH: Final[int] = 128
USERNAME_MAX_LENGTH: Final[int] = 100
VERIFICATION_CODE_LENGTH: Final[int] = 6
COUNTRY_MAX_LENGTH: Final[int] = 100
CITY_MAX_LENGTH: Final[int] = 100
TITLE_MAX_LENGTH: Final[int] = 500
DOI_MAX_LENGTH: Final[int] = 255
TOTP_INTERVAL: Final[int] = 300  # in seconds


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


class PublicationType(StrEnum):
    JOURNAL = "journal"
    CONFERENCE = "conference"
    BOOK = "book"
    PATENT = "patent"
    REPORT = "report"


class PublicationStatus(StrEnum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class PublicationFile:
    ALLOWED_EXTENSIONS: Final[set[str]] ={".docx", ".pdf"} 
    MAX_FILE_SIZE: Final[int]= 10 * 1024 * 1024


class ProjectStatus(StrEnum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ProjectRole(StrEnum):
    PI = "principal_investigator"
    CO_PI = "co_investigator"
    MEMBER = "member"
