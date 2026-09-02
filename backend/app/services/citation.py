import logging

from fastapi import HTTPException
from sqlalchemy import ScalarResult, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Citation, Publication, PublicationAuthor, Researcher
from app.schemas import CitationRequest, CitationResponse

logger: logging.Logger = logging.getLogger(__name__)


class CitationService:
    def __init__(self, session: AsyncSession) -> None:
        self.session: AsyncSession = session

    async def get_by_publication(self, publication_id: int) -> list[CitationResponse]:
        result: ScalarResult[Citation] = await self.session.scalars(
            select(Citation).where(Citation.citing_publication_id == publication_id)
        )
        return [CitationResponse.from_orm(c) for c in result.all()]

    async def get_cited_by(self, publication_id: int) -> list[CitationResponse]:
        result: ScalarResult[Citation] = await self.session.scalars(
            select(Citation).where(Citation.cited_publication_id == publication_id)
        )
        return [CitationResponse.from_orm(c) for c in result.all()]

    async def create(
        self, data: CitationRequest, researcher: Researcher
    ) -> list[CitationResponse]:
        logger.debug(
            "create %d citations from publication %d",
            len(data.cited_publication_ids),
            data.citing_publication_id,
        )
        self._ensure_no_self_citation(data)
        if len(set(data.cited_publication_ids)) != len(data.cited_publication_ids):
            raise HTTPException(
                status_code=400, detail="duplicate cited publication IDs not allowed"
            )
        await self._get_publication(data.citing_publication_id)
        await self._check_is_author(
            data.citing_publication_id, researcher.researcher_id
        )
        created: list[Citation] = [
            await self._create_single_citation(data.citing_publication_id, cited_id)
            for cited_id in data.cited_publication_ids
        ]
        await self.session.commit()
        for c in created:
            await self.session.refresh(c)
        logger.info(
            "citations created: %d, %s",
            data.citing_publication_id,
            data.cited_publication_ids,
        )
        return [CitationResponse.from_orm(c) for c in created]

    async def delete(self, citation_id: int, researcher: Researcher) -> None:
        logger.debug("delete citation: %d", citation_id)
        citation: Citation | None = await self.session.get(Citation, citation_id)
        if not citation:
            logger.warning("citation not found: %d", citation_id)
            raise HTTPException(status_code=404, detail="citation not found")
        # only authors of the citing publication can delete
        await self._check_is_author(
            citation.citing_publication_id, researcher.researcher_id
        )
        await self.session.delete(citation)
        await self.session.commit()
        logger.info("citation deleted: %d", citation_id)

    async def _get_publication(self, publication_id: int) -> Publication:
        pub: Publication | None = await self.session.get(Publication, publication_id)
        if not pub:
            raise HTTPException(
                status_code=404, detail=f"publication {publication_id} not found"
            )
        return pub

    async def _check_is_author(self, publication_id: int, researcher_id: int) -> None:
        author: PublicationAuthor | None = await self.session.scalar(
            select(PublicationAuthor).where(
                PublicationAuthor.publication_id == publication_id,
                PublicationAuthor.researcher_id == researcher_id,
            )
        )
        if not author:
            logger.warning(
                "citation auth failed: researcher_id=%d publication_id=%d",
                researcher_id,
                publication_id,
            )
            raise HTTPException(
                status_code=403,
                detail="you must be an author of the citing publication",
            )

    def _ensure_no_self_citation(self, data: CitationRequest) -> None:
        if data.citing_publication_id in data.cited_publication_ids:
            raise HTTPException(
                status_code=400, detail="a publication cannot cite itself"
            )

    async def _create_single_citation(
        self, citing_publication_id: int, cited_publication_id: int
    ) -> Citation:
        await self._get_publication(cited_publication_id)
        existing: Citation | None = await self.session.scalar(
            select(Citation).where(
                Citation.citing_publication_id == citing_publication_id,
                Citation.cited_publication_id == cited_publication_id,
            )
        )
        if existing:
            logger.warning(
                "citation already exists: %d, %d",
                citing_publication_id,
                cited_publication_id,
            )
            raise HTTPException(
                status_code=409,
                detail=f"citation {citing_publication_id}, {cited_publication_id} already exists",
            )
        citation = Citation(
            citing_publication_id=citing_publication_id,
            cited_publication_id=cited_publication_id,
        )
        self.session.add(citation)
        return citation
