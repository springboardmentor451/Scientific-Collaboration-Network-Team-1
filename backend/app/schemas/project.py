from datetime import date, datetime
from typing import Self

from pydantic import Field, model_validator

from app.schemas.base import ResponseBase
from app.schemas.common import CreateBase, UpdateBase


class ProjectRequest(CreateBase):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    researcher_ids: list[int] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_dates(self) -> Self:
        if (
            self.start_date is not None
            and self.end_date is not None
            and self.end_date < self.start_date
        ):
            raise ValueError("end_date cannot be before start_date")
        return self


class ProjectUpdateRequest(UpdateBase):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )
    description: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    researcher_ids: list[int] | None = None

    @model_validator(mode="after")
    def validate_dates(self) -> Self:
        if (
            self.start_date is not None
            and self.end_date is not None
            and self.end_date < self.start_date
        ):
            raise ValueError("end_date cannot be before start_date")
        return self


class ProjectResponse(ResponseBase):
    project_id: int
    name: str
    description: str | None
    start_date: date | None
    end_date: date | None
    created_at: datetime
