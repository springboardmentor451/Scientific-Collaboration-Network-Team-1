import logging

from fastapi import APIRouter

from app.routes.deps import AdminUser, ConferenceServiceDeps
from app.schemas import ConferenceRequest, ConferenceResponse, ConferenceUpdateRequest

logger: logging.Logger = logging.getLogger(__name__)
conference_router = APIRouter(prefix="/conferences", tags=["conferences"])


# Static routes
@conference_router.get("/", response_model=list[ConferenceResponse])
async def get_conferences(
    conference_service: ConferenceServiceDeps,
) -> list[ConferenceResponse]:
    return await conference_service.get_all()


@conference_router.post("/", response_model=ConferenceResponse, status_code=201)
async def create_conference(
    data: ConferenceRequest, _: AdminUser, conference_service: ConferenceServiceDeps
) -> ConferenceResponse:
    return await conference_service.create(data)


# Dynamic routes
@conference_router.get("/{conference_id:int}", response_model=ConferenceResponse)
async def get_conference(
    conference_id: int, conference_service: ConferenceServiceDeps
) -> ConferenceResponse:
    return await conference_service.get_by_id(conference_id)


@conference_router.patch("/{conference_id:int}", response_model=ConferenceResponse)
async def update_conference(
    conference_id: int,
    data: ConferenceUpdateRequest,
    _: AdminUser,
    conference_service: ConferenceServiceDeps,
) -> ConferenceResponse:
    return await conference_service.update(conference_id, data)


@conference_router.delete("/{conference_id:int}", status_code=204)
async def delete_conference(
    conference_id: int, _: AdminUser, conference_service: ConferenceServiceDeps
) -> None:
    await conference_service.delete(conference_id)
