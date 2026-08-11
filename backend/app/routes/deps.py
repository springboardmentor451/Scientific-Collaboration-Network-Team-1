from typing import Annotated

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import Config, get_config, get_db
from app.core.constants import UserRole
from app.core.interfaces import IEmailNotifier
from app.models import User
from app.schemas import TokenPayload
from app.services import (
    AuthService,
    InstitutionService,
    ResearcherService,
    TokenService,
    UserAdminService,
    UserService,
)
from app.utils import EmailNotifier

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
config: type[Config] = get_config()

# Type aliases
DBSession = Annotated[AsyncSession, Depends(get_db)]
Token = Annotated[str, Depends(oauth2_scheme)]


# Dependency providers
def get_email_notifier() -> IEmailNotifier:
    return EmailNotifier()


def get_user_service(session: DBSession) -> UserService:
    return UserService(session)


def get_user_admin_serive(session: DBSession) -> UserAdminService:
    return UserAdminService(session, get_email_notifier())


def get_token_service() -> TokenService:
    return TokenService(config)


def get_auth_service() -> AuthService:
    return AuthService(get_token_service(), get_email_notifier())


def get_researcher_service(session: DBSession) -> ResearcherService:
    return ResearcherService(session)


def get_institution_service(session: DBSession) -> InstitutionService:
    return InstitutionService(session)


# Auth guard
async def get_current_user(token: Token, session: DBSession) -> User:
    token_service: TokenService = get_token_service()
    payload: TokenPayload = token_service.decode_token(token)
    if not payload.sub:
        raise HTTPException(status_code=401, detail="invalid token payload")

    user: User | None = await UserService(session).get_by_email(payload.sub)
    if not user:
        raise HTTPException(status_code=401, detail="user not found")
    return user


def require_role(*roles: UserRole):
    async def checker(current_user: CurrentUser) -> User:
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="insufficient permissions")
        return current_user

    return checker


# Annotated shortcuts for routes
AuthServiceDeps = Annotated[AuthService, Depends(get_auth_service)]
UserServiceDeps = Annotated[UserService, Depends(get_user_service)]
UserAdminServiceDeps = Annotated[UserAdminService, Depends(get_user_admin_serive)]
CurrentUser = Annotated[User, Depends(get_current_user)]
ResearcherServiceDeps = Annotated[ResearcherService, Depends(get_researcher_service)]
AdminUser = Annotated[User, Depends(require_role(UserRole.SYSTEM_ADMIN))]
InstitutionAdminUser = Annotated[
    User, Depends(require_role(UserRole.SYSTEM_ADMIN, UserRole.INSTITUTION_ADMIN))
]
ReviewerUser = Annotated[
    User, Depends(require_role(UserRole.REVIEWER, UserRole.SYSTEM_ADMIN))
]
InstitutionServiceDeps = Annotated[InstitutionService, Depends(get_institution_service)]
