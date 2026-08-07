# from fastapi import APIRouter
# from app.schemas import DashboardResponse

# from app.routes.deps import CurrentUser, UserServiceDeps

# dashboard_router = APIRouter(prefix="/dashboard", tags=["dashboard"])


# @dashboard_router.get("/", response_model=DashboardResponse)
# async def get_dashboard(
#     current_user: CurrentUser,
#     user_service: UserServiceDeps,
# ) -> DashboardResponse:
#     return await user_service.get_dashboard(current_user)
