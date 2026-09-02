import logging

from fastapi import APIRouter, HTTPException

from app.routes.deps import (
    CurrentInstitutionAdmin,
    DashboardServiceDeps,
    InstitutionServiceDeps,
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
    current_admin: CurrentInstitutionAdmin,
    institution_service: InstitutionServiceDeps,
) -> InstitutionResponse:
    institution_id: int | None = current_admin.managed_institution_id
    if institution_id is None:
        raise HTTPException(status_code=400, detail="no institution assigned")
    return await institution_service.get_institution(institution_id)


@institution_admin_router.get(
    "/my-researchers", response_model=list[ResearcherResponse]
)
async def get_my_researchers(
    current_admin: CurrentInstitutionAdmin,
    researcher_service: ResearcherServiceDeps,
) -> list[ResearcherResponse]:
    institution_id: int | None = current_admin.managed_institution_id
    if institution_id is None:
        raise HTTPException(status_code=400, detail="no institution assigned")
    return await researcher_service.get_by_institution(institution_id)


@institution_admin_router.get("/my-stats", response_model=InstitutionStats)
async def get_my_stats(
    current_admin: CurrentInstitutionAdmin,
    dashboard_service: DashboardServiceDeps,
) -> InstitutionStats:
    institution_id: int | None = current_admin.managed_institution_id
    if institution_id is None:
        raise HTTPException(status_code=400, detail="no institution assigned")
    return await dashboard_service.get_institution_stats(institution_id)
