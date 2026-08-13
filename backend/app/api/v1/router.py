from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, researchers, publications, networks, analytics

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(researchers.router, prefix="/researchers", tags=["Researchers"])
api_router.include_router(publications.router, prefix="/publications", tags=["Publications"])
api_router.include_router(networks.router, prefix="/networks", tags=["Networks"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
