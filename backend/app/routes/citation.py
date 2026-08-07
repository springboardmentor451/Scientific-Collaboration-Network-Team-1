# from fastapi import APIRouter
# from app.schemas import CitationRequest, CitationResponse

# from app.routes.deps import CurrentUser, UserServiceDeps

# citation_router = APIRouter(prefix="/citation", tags=["citation"])


# @citation_router.get("/", response_model=list[CitationResponse])
# async def get_citations(user_service: UserServiceDeps) -> list[CitationResponse]:
#     return await user_service.get_all_citations()


# @citation_router.get("/{citation_id}", response_model=CitationResponse)
# async def get_citation(
#     citation_id: int,
#     user_service: UserServiceDeps,
# ) -> CitationResponse:
#     return await user_service.get_citation(citation_id)


# @citation_router.post("/", response_model=CitationResponse, status_code=201)
# async def create_citation(
#     body: CitationRequest,
#     current_user: CurrentUser,
#     user_service: UserServiceDeps,
# ) -> CitationResponse:
#     return await user_service.create_citation(body, current_user)


# @citation_router.delete("/{citation_id}", status_code=204)
# async def delete_citation(
#     citation_id: int,
#     current_user: CurrentUser,
#     user_service: UserServiceDeps,
# ) -> None:
#     await user_service.delete_citation(citation_id, current_user)