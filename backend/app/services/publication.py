import logging
from pathlib import Path

from fastapi import HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy import ScalarResult, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.selectable import Select

from app.core.constants import PublicationStatus, UserRole
from app.models import Publication, PublicationAuthor, Researcher, User
from app.schemas import (
    PublicationRequest,
    PublicationResponse,
    PublicationUpdateRequest,
)
from app.utils.file_upload import save_publication_file

logger: logging.Logger = logging.getLogger(__name__)


class PublicationService:
    def __init__(self, session: AsyncSession) -> None:
        self.session: AsyncSession = session

    async def get_all(
        self, include_restricted: bool = False
    ) -> list[PublicationResponse]:
        query: Select[tuple[Publication]] = select(Publication)
        if not include_restricted:
            query = query.where(Publication.is_open_access == True)
        result: ScalarResult[Publication] = await self.session.scalars(query)
        return [PublicationResponse.from_orm(p) for p in result.all()]

    async def get_by_id(self, publication_id: int) -> PublicationResponse:
        publication: Publication = await self._get_by_id(publication_id)
        return PublicationResponse.from_orm(publication)

    async def get_by_researcher(self, researcher_id: int) -> list[PublicationResponse]:
        logger.debug("fetching publications for researcher: %d", researcher_id)
        result: ScalarResult[Publication] = await self.session.scalars(
            select(Publication)
            .join(PublicationAuthor)
            .where(PublicationAuthor.researcher_id == researcher_id)
        )
        return [PublicationResponse.from_orm(p) for p in result.all()]

    async def create(
        self, data: PublicationRequest, researcher: Researcher
    ) -> PublicationResponse:
        await self._ensure_doi_unique(data.doi)
        co_author_ids: list[int] = [
            rid for rid in data.researcher_ids if rid != researcher.researcher_id
        ]
        await self._validate_researcher_ids(co_author_ids)
        publication: Publication = await self._create_publication_row(data)
        self._assign_primary_author(
            publication.publication_id, researcher.researcher_id
        )
        self._assign_co_authors(publication.publication_id, co_author_ids)
        await self.session.commit()
        await self.session.refresh(publication)
        logger.info("publication created: %d", publication.publication_id)
        return PublicationResponse.from_orm(publication)

    async def update(
        self,
        publication_id: int,
        data: PublicationUpdateRequest,
        researcher: Researcher,
    ) -> PublicationResponse:
        logger.debug("update publication: %d", publication_id)
        publication: Publication = await self._get_by_id(publication_id)
        await self._check_ownership(publication, researcher)
        self._ensure_valid_status_transition(data, publication)
        self._apply_updates(publication, data)

        if data.researcher_ids is not None:
            co_author_ids: list[int] = [
                rid for rid in data.researcher_ids if rid != researcher.researcher_id
            ]
            await self._validate_researcher_ids(co_author_ids)
            await self._update_authors(
                publication_id, co_author_ids, researcher.researcher_id
            )
        await self.session.commit()
        await self.session.refresh(publication)
        logger.info("publication updated: %d", publication_id)
        return PublicationResponse.from_orm(publication)

    async def delete(self, publication_id: int, researcher: Researcher) -> None:
        publication: Publication = await self._get_by_id(publication_id)
        await self._check_ownership(publication, researcher)
        await self.session.delete(publication)
        await self.session.commit()

    async def upload_file(
        self, publication_id: int, file: UploadFile, researcher: Researcher
    ) -> PublicationResponse:
        logger.debug("uploade file: publication_id=%d", publication_id)
        publication: Publication = await self._get_by_id(publication_id)
        await self._check_ownership(publication, researcher)
        file_path = await save_publication_file(file, publication_id)
        publication.file_path = file_path
        await self.session.commit()
        await self.session.refresh(publication)
        logger.info(
            "file uploaded: publication_id=%d path=%s", publication_id, file_path
        )
        return PublicationResponse.from_orm(publication)

    async def download(self, publication_id: int, user: User) -> FileResponse:
        logger.debug("download requested: publication_id=%d", publication_id)
        publication: Publication = await self._get_by_id(publication_id)
        if not publication.file_path:
            raise HTTPException(
                status_code=404, detail="no file uploaded for this publication"
            )
        # restricted publications, only authors or admin can download
        if not publication.is_open_access and user.role != UserRole.SYSTEM_ADMIN:
            author: PublicationAuthor | None = await self.session.scalar(
                select(PublicationAuthor)
                .join(Researcher)
                .where(
                    PublicationAuthor.publication_id == publication_id,
                    Researcher.user_id == user.user_id,
                )
            )
            if not author:
                raise HTTPException(
                    status_code=403, detail="this publication is restricted"
                )
        file_path = Path(publication.file_path)
        if not file_path.exists():
            logger.error(
                "file missing on disk: publication_id=%d path=%s",
                publication_id,
                file_path,
            )
            raise HTTPException(status_code=404, detail="file not found on server")
        logger.info("file downloaded: publication_id=%d", publication_id)
        return FileResponse(
            path=str(file_path),
            filename=file_path.name,
            media_type="application/octet-stream",
        )

    async def _check_ownership(
        self, publication: Publication, researcher: Researcher
    ) -> None:
        author: PublicationAuthor | None = await self.session.scalar(
            select(PublicationAuthor).where(
                PublicationAuthor.publication_id == publication.publication_id,
                PublicationAuthor.researcher_id == researcher.researcher_id,
            )
        )
        if not author:
            raise HTTPException(
                status_code=403,
                detail="you are not an author of this publication",
            )

    async def _get_by_id(self, publication_id: int) -> Publication:
        publication: Publication | None = await self.session.get(
            Publication, publication_id
        )
        if not publication:
            raise HTTPException(status_code=404, detail="publication not found")
        return publication

    async def _get_researcher(self, researcher_id: int) -> Researcher:
        researcher: Researcher | None = await self.session.get(
            Researcher, researcher_id
        )
        if not researcher:
            raise HTTPException(
                status_code=404, detail=f"researcher {researcher_id} not found"
            )
        return researcher

    async def _validate_researcher_ids(self, researcher_ids: list[int]) -> None:
        if not researcher_ids:
            return
        # check for duplicates
        if len(set(researcher_ids)) != len(researcher_ids):
            raise HTTPException(
                status_code=400, detail="duplicate researcher IDs not allowed"
            )
        # check all exist
        for researcher_id in researcher_ids:
            await self._get_researcher(researcher_id)

    async def _ensure_doi_unique(self, doi: str | None) -> None:
        if not doi:
            return
        existing: Publication | None = await self.session.scalar(
            select(Publication).where(Publication.doi == doi)
        )
        if existing:
            raise HTTPException(status_code=409, detail="DOI already exists")

    async def _create_publication_row(self, data: PublicationRequest) -> Publication:
        publication = Publication(
            title=data.title,
            abstract=data.abstract,
            doi=data.doi,
            publication_type=data.publication_type,
            status=data.status,
            publication_date=data.publication_date,
            conference_id=data.conference_id,
            external_authors=data.external_authors,
        )
        self.session.add(publication)
        await self.session.flush()
        return publication

    def _assign_primary_author(self, publication_id: int, researcher_id: int) -> None:
        self.session.add(
            PublicationAuthor(
                publication_id=publication_id,
                researcher_id=researcher_id,
                author_order=1,
                is_corresponding=True,
            )
        )

    def _assign_co_authors(self, publication_id: int, co_author_ids: list[int]) -> None:
        for order, researcher_id in enumerate(co_author_ids, start=2):
            self.session.add(
                PublicationAuthor(
                    publication_id=publication_id,
                    researcher_id=researcher_id,
                    author_order=order,
                    is_corresponding=False,
                )
            )

    def _ensure_valid_status_transition(
        self, data: PublicationUpdateRequest, publication: Publication
    ) -> None:
        if data.status == PublicationStatus.SUBMITTED and not publication.file_path:
            raise HTTPException(
                status_code=400, detail="upload a file before submitting"
            )
        if data.status == PublicationStatus.PUBLISHED and not publication.doi:
            raise HTTPException(
                status_code=400, detail="assign a DOI before marking as published"
            )

    def _apply_updates(
        self, publication: Publication, data: PublicationUpdateRequest
    ) -> None:
        if data.title is not None:
            publication.title = data.title
        if data.abstract is not None:
            publication.abstract = data.abstract
        if data.doi is not None:
            publication.doi = data.doi
        if data.publication_type is not None:
            publication.publication_type = data.publication_type
        if data.status is not None:
            publication.status = data.status
        if data.publication_date is not None:
            publication.publication_date = data.publication_date
        if data.conference_id is not None:
            publication.conference_id = data.conference_id
        if data.external_authors is not None:
            publication.external_authors = data.external_authors

    async def _update_authors(
        self,
        publication_id: int,
        co_author_ids: list[int],
        corresponding_researcher_id: int,
    ) -> None:
        existing: ScalarResult[PublicationAuthor] = await self.session.scalars(
            select(PublicationAuthor).where(
                PublicationAuthor.publication_id == publication_id
            )
        )
        for author in existing.all():
            await self.session.delete(author)
        await self.session.flush()

        self.session.add(
            PublicationAuthor(
                publication_id=publication_id,
                researcher_id=corresponding_researcher_id,
                author_order=1,
                is_corresponding=True,
            )
        )
        for order, rid in enumerate(co_author_ids, start=2):
            self.session.add(
                PublicationAuthor(
                    publication_id=publication_id,
                    researcher_id=rid,
                    author_order=order,
                    is_corresponding=False,
                )
            )
