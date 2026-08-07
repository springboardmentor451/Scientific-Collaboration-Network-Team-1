from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import USERNAME_MAX_LENGTH
from app.schemas.base import ResponseBase


class ResearcherRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    full_name: str = Field(min_length=1, max_length=USERNAME_MAX_LENGTH)
    bio: str | None = None
    department: str | None = None
    orcid_id: str | None = None
    skills: list[str] = Field(default_factory=list)
    research_interests: list[str] = Field(default_factory=list)
    institution_id: int | None = None


class ResearcherUpdateRequest(BaseModel):
    full_name: str | None = Field(default=None, max_length=USERNAME_MAX_LENGTH)
    bio: str | None = None
    department: str | None = None
    orcid_id: str | None = None
    skills: list[str] | None = None
    research_interests: list[str] | None = None
    institution_id: int | None = None


class ResearcherResponse(ResponseBase):
    researcher_id: int
    user_id: int
    full_name: str
    bio: str | None
    department: str | None
    orcid: str | None
    skills: list[str]
    research_interests: list[str]
    institution_id: int | None
