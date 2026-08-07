from datetime import datetime
from typing import Self

from pydantic import model_validator

from app.schemas.base import ResponseBase
from app.schemas.common import CreateBase


class CitationRequest(CreateBase):
    citing_publication_id: int
    cited_publication_id: int

    @model_validator(mode="after")
    def validate_different_publications(self) -> Self:
        if self.citing_publication_id == self.cited_publication_id:
            raise ValueError("A publication cannot cite itself")
        return self


class CitationResponse(ResponseBase):
    citation_id: int
    citing_publication_id: int
    cited_publication_id: int
    created_at: datetime
