from datetime import date, datetime

from pydantic import Field

from app.schemas.base import ResponseBase
from app.schemas.common import CreateBase, UpdateBase


class PublicationRequest(CreateBase):
    title: str = Field(min_length=1, max_length=500)
    abstract: str | None = None
    doi: str | None = Field(default=None, max_length=255)
    publication_date: date | None = None
    conference_id: int | None = None
    researcher_ids: list[int] = Field(default_factory=list)


class PublicationUpdateRequest(UpdateBase):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=500,
    )
    abstract: str | None = None
    doi: str | None = Field(default=None, max_length=255)
    publication_date: date | None = None
    conference_id: int | None = None
    researcher_ids: list[int] | None = None


class PublicationResponse(ResponseBase):
    publication_id: int
    title: str
    abstract: str | None
    doi: str | None
    publication_date: date | None
    conference_id: int | None
    created_at: datetime
