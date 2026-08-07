from pydantic import BaseModel, ConfigDict


class CreateBase(BaseModel):
    model_config = ConfigDict(extra="forbid")


class UpdateBase(BaseModel):
    model_config = ConfigDict(extra="forbid")