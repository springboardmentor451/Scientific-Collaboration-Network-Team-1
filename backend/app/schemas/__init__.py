from app.schemas.base import MessageResponse, ResponseBase
from app.schemas.citation import CitationRequest, CitationResponse
from app.schemas.collaboration import (
    CollaborationRequest,
    CollaborationResponse,
    CollaborationUpdateRequest,
)
from app.schemas.conference import (
    ConferenceRequest,
    ConferenceResponse,
    ConferenceUpdateRequest,
)
from app.schemas.dashboard import (
    InstitutionStats,
    ProjectStats,
    PublicationStats,
    PublicStats,
    ResearcherDashboard,
    SystemStats,
)
from app.schemas.institution import (
    InstitutionRequest,
    InstitutionResponse,
    InstitutionUpdateRequest,
)
from app.schemas.project import (
    ProjectMemberRequest,
    ProjectMemberResponse,
    ProjectMemberUpdateRequest,
    ProjectRequest,
    ProjectResponse,
    ProjectUpdateRequest,
)
from app.schemas.publication import (
    PublicationRequest,
    PublicationResponse,
    PublicationUpdateRequest,
)
from app.schemas.report import CollaborationReportFilter, PublicationReportFilter
from app.schemas.researcher import (
    ResearcherRequest,
    ResearcherResponse,
    ResearcherUpdateRequest,
)
from app.schemas.user import (
    EmailChangeRequest,
    ForgotPasswordRequest,
    PasswordResetRequest,
    RefreshRequest,
    RoleChangeRequest,
    TokenPayload,
    TokenResponse,
    UserRequest,
    UserResponse,
    UserRoleUpdateRequest,
    UserUpdateRequest,
    VerificationCodeRequest,
)

__all__: list[str] = [
    "CitationRequest",
    "CitationResponse",
    "CollaborationReportFilter",
    "CollaborationRequest",
    "CollaborationResponse",
    "CollaborationUpdateRequest",
    "ConferenceRequest",
    "ConferenceResponse",
    "ConferenceUpdateRequest",
    "EmailChangeRequest",
    "ForgotPasswordRequest",
    "InstitutionRequest",
    "InstitutionResponse",
    "InstitutionStats",
    "InstitutionUpdateRequest",
    "MessageResponse",
    "PasswordResetRequest",
    "ProjectMemberRequest",
    "ProjectMemberResponse",
    "ProjectMemberUpdateRequest",
    "ProjectRequest",
    "ProjectResponse",
    "ProjectStats",
    "ProjectUpdateRequest",
    "PublicStats",
    "PublicationReportFilter",
    "PublicationRequest",
    "PublicationResponse",
    "PublicationStats",
    "PublicationUpdateRequest",
    "RefreshRequest",
    "ResearcherDashboard",
    "ResearcherRequest",
    "ResearcherResponse",
    "ResearcherUpdateRequest",
    "ResponseBase",
    "RoleChangeRequest",
    "SystemStats",
    "TokenPayload",
    "TokenResponse",
    "UserRequest",
    "UserResponse",
    "UserRoleUpdateRequest",
    "UserUpdateRequest",
    "VerificationCodeRequest",
]  # type: ignore
