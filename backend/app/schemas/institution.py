from pydantic import BaseModel, ConfigDict, Field, HttpUrl

from app.core.constants import CITY_MAX_LENGTH, COUNTRY_MAX_LENGTH, InstitutionType
from app.schemas.base import ResponseBase


class InstitutionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str
    city: str | None = Field(max_length=CITY_MAX_LENGTH)
    country: str = Field(max_length=COUNTRY_MAX_LENGTH)
    type: InstitutionType = Field(default=InstitutionType.UNIVERSITY)
    website: HttpUrl | None = Field(default=None)


class InstitutionUpdateRequest(BaseModel):
    name: str | None = Field(default=None)
    city: str | None = Field(default=None, max_length=CITY_MAX_LENGTH)
    country: str | None = Field(default=None, max_length=COUNTRY_MAX_LENGTH)
    type: str | None = Field(default=None)
    website: HttpUrl | None = Field(default=None)


class InstitutionResponse(ResponseBase):
    institution_id: int
    name: str
    city: str
    country: str
    type: str
    website: HttpUrl | None
