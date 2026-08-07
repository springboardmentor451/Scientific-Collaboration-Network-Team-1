# from fastapi import APIRouter
# from fastapi.responses import FileResponse
# from app.schemas import ReportRequest

# from app.routes.deps import CurrentUser, UserServiceDeps

# report_router = APIRouter(prefix="/report", tags=["report"])


# @report_router.post("/publications/pdf")
# async def export_publications_pdf(
#     body: ReportRequest,
#     current_user: CurrentUser,
#     user_service: UserServiceDeps,
# ) -> FileResponse:
#     return await user_service.export_publications_pdf(body, current_user)


# @report_router.post("/publications/excel")
# async def export_publications_excel(
#     body: ReportRequest,
#     current_user: CurrentUser,
#     user_service: UserServiceDeps,
# ) -> FileResponse:
#     return await user_service.export_publications_excel(body, current_user)


# @report_router.post("/collaborations/pdf")
# async def export_collaborations_pdf(
#     body: ReportRequest,
#     current_user: CurrentUser,
#     user_service: UserServiceDeps,
# ) -> FileResponse:
#     return await user_service.export_collaborations_pdf(body, current_user)