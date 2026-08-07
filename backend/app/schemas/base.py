from typing import Any, Self

from pydantic import BaseModel, ConfigDict


class ResponseBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm(cls, obj: Any) -> Self:
        return cls.model_validate(obj)
