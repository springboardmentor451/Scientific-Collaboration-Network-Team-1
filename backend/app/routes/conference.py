# from fastapi import APIRouter
# from app.schemas import ConferenceRequest, ConferenceResponse

# from app.routes.deps import CurrentUser, UserServiceDeps

# conference_router = APIRouter(prefix="/conference", tags=["conference"])


# @conference_router.get("/", response_model=list[ConferenceResponse])
# async def get_conferences(user_service: UserServiceDeps) -> list[ConferenceResponse]:
#     return await user_service.get_all_conferences()


# @conference_router.get("/{conference_id}", response_model=ConferenceResponse)
# async def get_conference(
#     conference_id: int,
#     user_service: UserServiceDeps,
# ) -> ConferenceResponse:
#     return await user_service.get_conference(conference_id)


# @conference_router.post("/", response_model=ConferenceResponse, status_code=201)
# async def create_conference(
#     body: ConferenceRequest,
#     current_user: CurrentUser,
#     user_service: UserServiceDeps,
# ) -> ConferenceResponse:
#     return await user_service.create_conference(body, current_user)


# @conference_router.put("/{conference_id}", response_model=ConferenceResponse)
# async def update_conference(
#     conference_id: int,
#     body: ConferenceRequest,
#     current_user: CurrentUser,
#     user_service: UserServiceDeps,
# ) -> ConferenceResponse:
#     return await user_service.update_conference(conference_id, body, current_user)


# @conference_router.delete("/{conference_id}", status_code=204)
# async def delete_conference(
#     conference_id: int,
#     current_user: CurrentUser,
#     user_service: UserServiceDeps,
# ) -> None:
#     await user_service.delete_conference(conference_id, current_user)