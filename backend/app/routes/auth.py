from fastapi import APIRouter

from app.routes.deps import AuthServiceDeps, DBSession, UserServiceDeps
from app.schemas import (
    EmailVerifyRequest,
    LoginCodeRequest,
    MessageResponse,
    RefreshRequest,
    TokenResponse,
    UserRequest,
)

auth_router = APIRouter(prefix="/auth", tags=["auth"])


@auth_router.post("/register", status_code=201, response_model=MessageResponse)
async def register(
    credentials: UserRequest,
    auth_service: AuthServiceDeps,
    user_service: UserServiceDeps,
) -> MessageResponse:
    return await auth_service.register(credentials, user_service)


@auth_router.post("/verify-email", response_model=MessageResponse)
async def verify_email(
    body: EmailVerifyRequest,
    auth_service: AuthServiceDeps,
    user_service: UserServiceDeps,
) -> MessageResponse:
    return await auth_service.verify_email(body, user_service)


@auth_router.post("/login", response_model=MessageResponse)
async def login(
    credentials: UserRequest,
    auth_service: AuthServiceDeps,
    user_service: UserServiceDeps,
) -> MessageResponse:
    return await auth_service.login(credentials, user_service)


@auth_router.post("/verify-login-code", response_model=TokenResponse)
async def verify_login_code(
    body: LoginCodeRequest, auth_service: AuthServiceDeps, user_service: UserServiceDeps
) -> TokenResponse:
    return await auth_service.verify_login_code(body, user_service)


@auth_router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    body: RefreshRequest,
    user_service: UserServiceDeps,
    auth_service: AuthServiceDeps,
    session: DBSession,
) -> TokenResponse:
    return await auth_service.refresh(body.refresh_token, user_service, session)


@auth_router.post("/logout", status_code=204)
async def logout(
    body: RefreshRequest,
    auth_service: AuthServiceDeps,
    session: DBSession,
) -> None:
    return await auth_service.logout(body.refresh_token, session)
