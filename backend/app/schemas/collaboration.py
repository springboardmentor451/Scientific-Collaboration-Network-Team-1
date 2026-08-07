from datetime import datetime
from typing import Self

from pydantic import Field, model_validator

from app.schemas.base import ResponseBase
from app.schemas.common import CreateBase, UpdateBase


class CollaborationRequest(CreateBase):
    researcher_id_1: int
    researcher_id_2: int
    collaboration_type: str | None = Field(
        default=None,
        max_length=100,
    )
    collaboration_count: int = Field(
        default=1,
        ge=1,
    )

    @model_validator(mode="after")
    def validate_researchers(self) -> Self:
        if self.researcher_id_1 == self.researcher_id_2:
            raise ValueError("A researcher cannot collaborate with themselves")

        return self


class CollaborationUpdateRequest(UpdateBase):
    collaboration_type: str | None = Field(
        default=None,
        max_length=100,
    )
    collaboration_count: int | None = Field(
        default=None,
        ge=1,
    )


class CollaborationResponse(ResponseBase):
    collaboration_id: int
    researcher_id_1: int
    researcher_id_2: int
    collaboration_type: str | None
    collaboration_count: int
    created_at: datetime
