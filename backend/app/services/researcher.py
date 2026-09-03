import logging

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.engine.result import ScalarResult
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.orm_utils import apply_updates
from app.models import Institution, Researcher, User
from app.schemas import (
    ResearcherRequest,
    ResearcherResponse,
    ResearcherUpdateRequest,
)
from app.services.institution import InstitutionService

logger: logging.Logger = logging.getLogger(__name__)


class ResearcherService:
    def __init__(self, session: AsyncSession) -> None:
        self.session: AsyncSession = session

    async def get_by_id(self, researcher_id: int) -> ResearcherResponse:
        logger.debug("fetch researcher by id: %d", researcher_id)
        researcher: Researcher | None = await self.session.scalar(
            select(Researcher).where(Researcher.researcher_id == researcher_id)
        )
        if not researcher:
            raise HTTPException(status_code=404, detail="researcher not found")
        return ResearcherResponse.from_orm(researcher)

    async def get_by_user_id(self, user_id: int) -> Researcher | None:
        logger.debug("fetch researcher by user_id: %d", user_id)
        return await self.session.scalar(
            select(Researcher).where(Researcher.user_id == user_id)
        )

    async def get_by_institution(self, institution_id: int) -> list[ResearcherResponse]:
        logger.debug("fetch researchers for institution: %d", institution_id)
        result: ScalarResult[Researcher] = await self.session.scalars(
            select(Researcher).where(Researcher.institution_id == institution_id)
        )
        return [ResearcherResponse.from_orm(r) for r in result.all()]

    async def get_all(self) -> list[ResearcherResponse]:
        logger.debug("fetch all researchers")
        result: ScalarResult[Researcher] = await self.session.scalars(
            select(Researcher)
        )
        return [ResearcherResponse.from_orm(r) for r in result.all()]

    async def create(
        self,
        credentials: ResearcherRequest,
        user: User,
        institution_service: InstitutionService,
    ) -> ResearcherResponse:
        logger.debug("create researcher profile for user: user_id=%d", user.user_id)
        existing: Researcher | None = await self.get_by_user_id(user.user_id)
        if existing:
            raise HTTPException(
                status_code=409, detail="researcher profile already exists"
            )
        institution_id: int | None = credentials.institution_id
        if institution_id is None:
            institution_id = await self._resolve_institution_id(
                user, institution_service
            )
        new_researcher: Researcher = await self._persist_researcher(
            credentials, user, institution_id
        )
        return ResearcherResponse.from_orm(new_researcher)

    async def update(
        self, data: ResearcherUpdateRequest, user: User
    ) -> ResearcherResponse:
        logger.debug("update researcher profile for user: user_id=%d", user.user_id)
        researcher: Researcher | None = await self.get_by_user_id(user.user_id)
        if not researcher:
            raise HTTPException(status_code=404, detail="researcher profile not found")
        apply_updates(researcher, data)
        #  updates = data.model_dump(exclude_none=True)
        # for key, val in updates.items():
        #     setattr(researcher, key, val)
        await self.session.commit()
        logger.info("researcher profile updated for user: %d", user.user_id)
        return ResearcherResponse.from_orm(researcher)

    async def delete(self, user: User) -> None:
        logger.debug("delete researcher profile for user: user_id=%d", user.user_id)
        researcher: Researcher | None = await self.get_by_user_id(user.user_id)
        if not researcher:
            raise HTTPException(status_code=404, detail="researcher profile not found")
        await self.session.delete(researcher)
        await self.session.commit()
        logger.info("researcher profile deleted for user: %d", user.user_id)

    async def _persist_researcher(
        self, credentials: ResearcherRequest, user: User, institution_id: int | None
    ) -> Researcher:
        researcher = Researcher(
            user_id=user.user_id,
            name=credentials.name,
            bio=credentials.bio,
            department=credentials.department,
            orcid=credentials.orcid,
            skills=credentials.skills,
            research_interests=credentials.research_interests,
            institution_id=institution_id,
        )
        self.session.add(researcher)
        await self.session.commit()
        await self.session.refresh(researcher)
        logger.info("researcher profile created for user: %d", user.user_id)
        return researcher

    async def _resolve_institution_id(
        self, user: User, institution_service: InstitutionService
    ) -> int | None:
        domain: str = user.email.split("@")[-1].lower()
        matched: Institution | None = await institution_service.get_by_domain(domain)
        if matched:
            institution_id: int = matched.institution_id
            logger.info(
                "auto-linked institution: user_id=%d institution_id=%d",
                user.user_id,
                institution_id,
            )
            return institution_id
        return None
