import logging

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.engine.result import ScalarResult
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Researcher, User
from app.schemas import (
    ResearcherRequest,
    ResearcherResponse,
    ResearcherUpdateRequest,
)

logger: logging.Logger = logging.getLogger(__name__)


class ResearcherService:
    def __init__(self, session: AsyncSession) -> None:
        self.session: AsyncSession = session

    async def get_by_id(self, researcher_id: int) -> ResearcherResponse:
        logger.debug("fetching researcher by id: %d", researcher_id)
        researcher: Researcher | None = await self.session.scalar(
            select(Researcher).where(Researcher.researcher_id == researcher_id)
        )
        if not researcher:
            logger.warning("researcher not found: %d", researcher_id)
            raise HTTPException(status_code=404, detail="researcher not found")
        return ResearcherResponse.from_orm(researcher)

    async def get_by_user_id(self, user_id: int) -> Researcher | None:
        logger.debug("fetching researcher by user_id: %d", user_id)
        return await self.session.scalar(
            select(Researcher).where(Researcher.user_id == user_id)
        )

    async def get_all(self) -> list[ResearcherResponse]:
        logger.debug("fetching all researchers")
        result: ScalarResult[Researcher] = await self.session.scalars(
            select(Researcher)
        )
        return [ResearcherResponse.from_orm(r) for r in result.all()]

    async def create(self, data: ResearcherRequest, user: User) -> ResearcherResponse:
        logger.debug("creating researcher profile for user: %s", user.email)
        existing: Researcher | None = await self.get_by_user_id(user.user_id)
        if existing:
            logger.warning("researcher profile already exists for user: %s", user.email)
            raise HTTPException(
                status_code=409,
                detail="researcher profile already exists",
            )
        researcher = Researcher(
            user_id=user.user_id,
            full_name=data.full_name,
            bio=data.bio,
            department=data.department,
            orcid_id=data.orcid_id,
            skills=data.skills,
            research_interests=data.research_interests,
            institution_id=data.institution_id,
        )
        self.session.add(researcher)
        await self.session.commit()
        logger.info("researcher profile created for user: %s", user.email)
        return ResearcherResponse.from_orm(researcher)

    async def update(
        self, data: ResearcherUpdateRequest, user: User
    ) -> ResearcherResponse:
        logger.debug("updating researcher profile for user: %s", user.email)
        researcher: Researcher | None = await self.get_by_user_id(user.user_id)
        if not researcher:
            logger.warning("researcher profile not found for user: %s", user.email)
            raise HTTPException(status_code=404, detail="researcher profile not found")
        updates = data.model_dump(exclude_none=True)
        for key, val in updates.items():
            setattr(researcher, key, val)
        await self.session.commit()
        logger.info("researcher profile updated for user: %s", user.email)
        return ResearcherResponse.from_orm(researcher)

    async def delete(self, user: User) -> None:
        logger.debug("deleting researcher profile for user: %s", user.email)
        researcher: Researcher | None = await self.get_by_user_id(user.user_id)
        if not researcher:
            logger.warning("researcher profile not found for user: %s", user.email)
            raise HTTPException(status_code=404, detail="researcher profile not found")
        await self.session.delete(researcher)
        await self.session.commit()
        logger.warning("researcher profile deleted for user: %s", user.email)
