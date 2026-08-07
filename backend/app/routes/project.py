# from fastapi import APIRouter
# from app.schemas import ProjectRequest, ProjectResponse

# from app.routes.deps import CurrentUser, UserServiceDeps

# project_router = APIRouter(prefix="/project", tags=["project"])


# @project_router.get("/", response_model=list[ProjectResponse])
# async def get_projects(user_service: UserServiceDeps) -> list[ProjectResponse]:
#     return await user_service.get_all_projects()


# @project_router.get("/{project_id}", response_model=ProjectResponse)
# async def get_project(
#     project_id: int,
#     user_service: UserServiceDeps,
# ) -> ProjectResponse:
#     return await user_service.get_project(project_id)


# @project_router.post("/", response_model=ProjectResponse, status_code=201)
# async def create_project(
#     body: ProjectRequest,
#     current_user: CurrentUser,
#     user_service: UserServiceDeps,
# ) -> ProjectResponse:
#     return await user_service.create_project(body, current_user)


# @project_router.put("/{project_id}", response_model=ProjectResponse)
# async def update_project(
#     project_id: int,
#     body: ProjectRequest,
#     current_user: CurrentUser,
#     user_service: UserServiceDeps,
# ) -> ProjectResponse:
#     return await user_service.update_project(project_id, body, current_user)


# @project_router.delete("/{project_id}", status_code=204)
# async def delete_project(
#     project_id: int,
#     current_user: CurrentUser,
#     user_service: UserServiceDeps,
# ) -> None:
#     await user_service.delete_project(project_id, current_user)
