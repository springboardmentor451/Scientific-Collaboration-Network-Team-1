import logging

from fastapi import APIRouter

from app.routes.deps import AdminUser, CurrentUser, DashboardServiceDeps
from app.schemas import InstitutionStats, PublicStats, ResearcherDashboard, SystemStats

logger: logging.Logger = logging.getLogger(__name__)
dashboard_router = APIRouter(prefix="/dashboard", tags=["dashboard"])


# Static routes
@dashboard_router.get("/me", response_model=ResearcherDashboard)
async def my_dashboard(
    current_user: CurrentUser, dashboard_service: DashboardServiceDeps
) -> ResearcherDashboard:
    return await dashboard_service.get_researcher_dashboard(current_user.user_id)


@dashboard_router.get("/system", response_model=SystemStats)
async def system_dashboard(
    _: AdminUser, dashboard_service: DashboardServiceDeps
) -> SystemStats:
    return await dashboard_service.get_system_stats()


@dashboard_router.get("/public", response_model=PublicStats)
async def public_stats(dashboard_service: DashboardServiceDeps) -> PublicStats:
    return await dashboard_service.get_public_stats()


# Dynamic route
@dashboard_router.get(
    "/institution/{institution_id:int}", response_model=InstitutionStats
)
async def institution_dashboard(
    institution_id: int, _: AdminUser, dashboard_service: DashboardServiceDeps
) -> InstitutionStats:
    return await dashboard_service.get_institution_stats(institution_id)
