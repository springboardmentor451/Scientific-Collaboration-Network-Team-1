from datetime import date, datetime
from typing import Self

from pydantic import Field, model_validator

from app.schemas.base import ResponseBase
from app.schemas.common import CreateBase, UpdateBase


class ConferenceRequest(CreateBase):
    name: str = Field(min_length=1, max_length=255)
    location: str | None = Field(default=None, max_length=255)
    start_date: date | None = None
    end_date: date | None = None

    @model_validator(mode="after")
    def validate_dates(self) -> Self:
        if (
            self.start_date is not None
            and self.end_date is not None
            and self.end_date < self.start_date
        ):
            raise ValueError("end_date cannot be before start_date")

        return self


class ConferenceUpdateRequest(UpdateBase):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )
    location: str | None = Field(default=None, max_length=255)
    start_date: date | None = None
    end_date: date | None = None

    @model_validator(mode="after")
    def validate_dates(self) -> Self:
        if (
            self.start_date is not None
            and self.end_date is not None
            and self.end_date < self.start_date
        ):
            raise ValueError("end_date cannot be before start_date")

        return self


class ConferenceResponse(ResponseBase):
    conference_id: int
    name: str
    location: str | None
    start_date: date | None
    end_date: date | None
    created_at: datetime
