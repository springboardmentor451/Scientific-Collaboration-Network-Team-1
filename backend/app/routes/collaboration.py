# from fastapi import APIRouter
# from app.schemas import CollaborationRequest, CollaborationResponse

# from app.routes.deps import CurrentUser, UserServiceDeps

# collaboration_router = APIRouter(prefix="/collaboration", tags=["collaboration"])


# @collaboration_router.get("/", response_model=list[CollaborationResponse])
# async def get_collaborations(
#     user_service: UserServiceDeps,
# ) -> list[CollaborationResponse]:
#     return await user_service.get_all_collaborations()


# @collaboration_router.get("/{collaboration_id}", response_model=CollaborationResponse)
# async def get_collaboration(
#     collaboration_id: int,
#     user_service: UserServiceDeps,
# ) -> CollaborationResponse:
#     return await user_service.get_collaboration(collaboration_id)


# @collaboration_router.post("/", response_model=CollaborationResponse, status_code=201)
# async def create_collaboration(
#     body: CollaborationRequest,
#     current_user: CurrentUser,
#     user_service: UserServiceDeps,
# ) -> CollaborationResponse:
#     return await user_service.create_collaboration(body, current_user)


# @collaboration_router.delete("/{collaboration_id}", status_code=204)
# async def delete_collaboration(
#     collaboration_id: int,
#     current_user: CurrentUser,
#     user_service: UserServiceDeps,
# ) -> None:
#     await user_service.delete_collaboration(collaboration_id, current_user)