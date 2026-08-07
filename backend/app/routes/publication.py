# from fastapi import APIRouter, UploadFile
# from app.schemas import PublicationRequest, PublicationResponse

# from app.routes.deps import CurrentUser, UserServiceDeps

# publication_router = APIRouter(prefix="/publication", tags=["publication"])


# @publication_router.get("/", response_model=list[PublicationResponse])
# async def get_publications(
#     user_service: UserServiceDeps,
# ) -> list[PublicationResponse]:
#     return await user_service.get_all_publications()


# @publication_router.get("/{publication_id}", response_model=PublicationResponse)
# async def get_publication(
#     publication_id: int,
#     user_service: UserServiceDeps,
# ) -> PublicationResponse:
#     return await user_service.get_publication(publication_id)


# @publication_router.post("/", response_model=PublicationResponse, status_code=201)
# async def create_publication(
#     body: PublicationRequest,
#     current_user: CurrentUser,
#     user_service: UserServiceDeps,
# ) -> PublicationResponse:
#     return await user_service.create_publication(body, current_user)


# @publication_router.put("/{publication_id}", response_model=PublicationResponse)
# async def update_publication(
#     publication_id: int,
#     body: PublicationRequest,
#     current_user: CurrentUser,
#     user_service: UserServiceDeps,
# ) -> PublicationResponse:
#     return await user_service.update_publication(publication_id, body, current_user)


# @publication_router.delete("/{publication_id}", status_code=204)
# async def delete_publication(
#     publication_id: int,
#     current_user: CurrentUser,
#     user_service: UserServiceDeps,
# ) -> None:
#     await user_service.delete_publication(publication_id, current_user)


# @publication_router.post("/{publication_id}/upload", response_model=PublicationResponse)
# async def upload_file(
#     publication_id: int,
#     file: UploadFile,
#     current_user: CurrentUser,
#     user_service: UserServiceDeps,
# ) -> PublicationResponse:
#     return await user_service.upload_publication_file(
#         publication_id, file, current_user
#     )