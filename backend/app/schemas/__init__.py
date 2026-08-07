from app.schemas.base import ResponseBase
from app.schemas.citation import CitationRequest, CitationResponse
from app.schemas.conference import (
    ConferenceRequest,
    ConferenceResponse,
    ConferenceUpdateRequest,
)
from app.schemas.institution import (
    InstitutionRequest,
    InstitutionResponse,
    InstitutionUpdateRequest,
)
from app.schemas.project import ProjectRequest, ProjectResponse, ProjectUpdateRequest
from app.schemas.publication import (
    PublicationRequest,
    PublicationResponse,
    PublicationUpdateRequest,
)
from app.schemas.researcher import (
    ResearcherRequest,
    ResearcherResponse,
    ResearcherUpdateRequest,
)
from app.schemas.user import (
    EmailVerifyRequest,
    RefreshRequest,
    TokenPayload,
    TokenResponse,
    UserRequest,
    UserResponse,
    UserRoleUpdateRequest,
    UserStatusUpdateRequest,
    UserUpdateRequest,
)

from .collaboration import (
    CollaborationRequest,
    CollaborationResponse,
    CollaborationUpdateRequest,
)

__all__: list[str] = [
    "CitationRequest",
    "CitationResponse",
    "CollaborationRequest",
    "CollaborationResponse",
    "CollaborationUpdateRequest",
    "ConferenceRequest",
    "ConferenceResponse",
    "ConferenceUpdateRequest",
    "EmailVerifyRequest",
    "InstitutionRequest",
    "InstitutionResponse",
    "InstitutionUpdateRequest",
    "ProjectRequest",
    "ProjectResponse",
    "ProjectUpdateRequest",
    "PublicationRequest",
    "PublicationResponse",
    "PublicationUpdateRequest",
    "RefreshRequest",
    "ResearcherRequest",
    "ResearcherResponse",
    "ResearcherUpdateRequest",
    "ResponseBase",
    "TokenPayload",
    "TokenResponse",
    "UserRequest",
    "UserResponse",
    "UserRoleUpdateRequest",
    "UserStatusUpdateRequest",
    "UserUpdateRequest",
]
