import logging

from fastapi import APIRouter

from app.routes.deps import CollaborationServiceDeps, CurrentResearcher
from app.schemas import CollaborationRequest, CollaborationResponse

logger: logging.Logger = logging.getLogger(__name__)
collaboration_router = APIRouter(prefix="/collaborations", tags=["collaborations"])


# Static routes
@collaboration_router.get("/", response_model=list[CollaborationResponse])
async def get_collaborations(
    collaboration_service: CollaborationServiceDeps,
) -> list[CollaborationResponse]:
    return await collaboration_service.get_all()


@collaboration_router.post("/", response_model=CollaborationResponse, status_code=201)
async def create_collaboration(
    data: CollaborationRequest,
    collaboration_service: CollaborationServiceDeps,
    current_researcher: CurrentResearcher,
) -> CollaborationResponse:
    return await collaboration_service.create(data, current_researcher)


@collaboration_router.get("/my", response_model=list[CollaborationResponse])
async def get_my_collaborations(
    current_researcher: CurrentResearcher,
    collaboration_service: CollaborationServiceDeps,
) -> list[CollaborationResponse]:
    return await collaboration_service.get_by_researcher(
        current_researcher.researcher_id
    )


# Dynamic route
@collaboration_router.delete("/{collaboration_id:int}", status_code=204)
async def delete_collaboration(
    collaboration_id: int,
    collaboration_service: CollaborationServiceDeps,
    current_researcher: CurrentResearcher,
) -> None:
    await collaboration_service.delete(collaboration_id, current_researcher)
