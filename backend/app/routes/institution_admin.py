import logging

from fastapi import APIRouter

from app.routes.deps import (
    DashboardServiceDeps,
    InstitutionServiceDeps,
    ManagedInstitutionId,
    ResearcherServiceDeps,
)
from app.schemas.dashboard import InstitutionStats
from app.schemas.institution import InstitutionResponse
from app.schemas.researcher import ResearcherResponse

logger: logging.Logger = logging.getLogger(__name__)
institution_admin_router = APIRouter(
    prefix="/institution-admin", tags=["institution admin"]
)


@institution_admin_router.get("/my-institution", response_model=InstitutionResponse)
async def get_my_institution(
    institution_id: ManagedInstitutionId,
    institution_service: InstitutionServiceDeps,
) -> InstitutionResponse:
    return await institution_service.get_institution(institution_id)


@institution_admin_router.get(
    "/my-researchers", response_model=list[ResearcherResponse]
)
async def get_my_researchers(
    institution_id: ManagedInstitutionId,
    researcher_service: ResearcherServiceDeps,
) -> list[ResearcherResponse]:
    return await researcher_service.get_by_institution(institution_id)


@institution_admin_router.get("/my-stats", response_model=InstitutionStats)
async def get_my_stats(
    institution_id: ManagedInstitutionId,
    dashboard_service: DashboardServiceDeps,
) -> InstitutionStats:
    return await dashboard_service.get_institution_stats(institution_id)
