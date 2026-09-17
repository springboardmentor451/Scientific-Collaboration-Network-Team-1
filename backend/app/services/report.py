import csv
import io
import json
import logging
from _csv import Writer
from datetime import date

from fastapi.responses import StreamingResponse
from sqlalchemy import ScalarResult, Select, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import InstrumentedAttribute

from app.core.constants import PublicationStatus, PublicationType
from app.models import (
    Collaboration,
    CollaborationResearcher,
    Publication,
    PublicationAuthor,
    Researcher,
)
from app.schemas import CollaborationReportFilter, PublicationReportFilter

logger: logging.Logger = logging.getLogger(__name__)


class ReportService:
    def __init__(self, session: AsyncSession) -> None:
        self.session: AsyncSession = session

    async def publication_report_csv(
        self, filters: PublicationReportFilter
    ) -> StreamingResponse:
        logger.info("generating publication CSV report")
        publications: list[Publication] = await self._get_publications(filters)
        rows: list[list[int | str | PublicationType | PublicationStatus | date]] = [
            [
                p.publication_id,
                p.title,
                p.publication_type,
                p.status,
                p.doi or "",
                p.publication_date or "",
                p.created_at.date(),
            ]
            for p in publications
        ]
        header: list[str] = [
            "ID",
            "Title",
            "Type",
            "Status",
            "DOI",
            "Publication Date",
            "Created At",
        ]
        return self._csv_response(header, rows, "publications.csv")

    async def publication_report_json(
        self, filters: PublicationReportFilter
    ) -> StreamingResponse:
        logger.info("generating publication JSON report")
        publications: list[Publication] = await self._get_publications(filters)
        data: list[
            dict[str, int | str | PublicationType | PublicationStatus | None]
        ] = [
            {
                "id": p.publication_id,
                "title": p.title,
                "type": p.publication_type,
                "status": p.status,
                "doi": p.doi,
                "publication_date": str(p.publication_date)
                if p.publication_date
                else None,
                "created_at": p.created_at.isoformat(),
            }
            for p in publications
        ]
        return StreamingResponse(
            iter([json.dumps(data, indent=2)]),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=publications.json"},
        )

    async def collaboration_report_csv(
        self, filters: CollaborationReportFilter
    ) -> StreamingResponse:
        collaborations: list[Collaboration] = await self._get_collaborations(filters)
        rows = []
        for c in collaborations:
            member_ids: list[int] = await self._get_member_ids(c.collaboration_id)
            rows.append(
                [
                    c.collaboration_id,
                    c.collaboration_type or "",
                    ", ".join(str(m) for m in member_ids),
                    c.collaboration_count,
                    c.created_at.date(),
                ]
            )
        header: list[str] = ["ID", "Type", "Researcher IDs", "Count", "Created At"]
        return self._csv_response(header, rows, "collaborations.csv")

    async def _get_publications(
        self, filters: PublicationReportFilter
    ) -> list[Publication]:
        query: Select[tuple[Publication]] = select(Publication)
        query = self._apply_author_scoped_filters(query, filters)
        query = self._apply_attribute_filters(query, filters)
        result: ScalarResult[Publication] = await self.session.scalars(query)
        return list(result.all())

    def _apply_author_scoped_filters(
        self, query: Select[tuple[Publication]], filters: PublicationReportFilter
    ) -> Select[tuple[Publication]]:
        """
        researcher_id and institution_id both route through PublicationAuthor,
        join it at most once regardless of which of the two are set.
        """
        if not (filters.researcher_id or filters.institution_id):
            return query
        query = query.join(PublicationAuthor)
        if filters.researcher_id:
            query = query.where(
                PublicationAuthor.researcher_id == filters.researcher_id
            )
        if filters.institution_id:
            query = query.join(Researcher).where(
                Researcher.institution_id == filters.institution_id
            )
        return query

    def _apply_attribute_filters(
        self, query: Select[tuple[Publication]], filters: PublicationReportFilter
    ) -> Select[tuple[Publication]]:
        equality_filters: dict[
            str,
            InstrumentedAttribute[PublicationType]
            | InstrumentedAttribute[PublicationStatus],
        ] = {
            "publication_type": Publication.publication_type,
            "status": Publication.status,
        }
        for field, column in equality_filters.items():
            value = getattr(filters, field)
            if value:
                query = query.where(column == value)
        if filters.from_date:
            query = query.where(Publication.publication_date >= filters.from_date)
        if filters.to_date:
            query = query.where(Publication.publication_date <= filters.to_date)
        return query

    def _csv_response(
        self, header: list[str], rows: list[list], filename: str
    ) -> StreamingResponse:
        output = io.StringIO()
        writer: Writer = csv.writer(output)
        writer.writerow(header)
        writer.writerows(rows)
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )

    async def _get_collaborations(
        self, filters: CollaborationReportFilter
    ) -> list[Collaboration]:
        query: Select[tuple[Collaboration]] = select(Collaboration)
        if filters.researcher_id:
            query = query.join(CollaborationResearcher).where(
                CollaborationResearcher.researcher_id == filters.researcher_id
            )
        if filters.from_date:
            query = query.where(Collaboration.created_at >= filters.from_date)
        if filters.to_date:
            query = query.where(Collaboration.created_at <= filters.to_date)
        result: ScalarResult[Collaboration] = await self.session.scalars(query)
        return list(result.all())

    async def _get_member_ids(self, collaboration_id: int) -> list[int]:
        members: ScalarResult[int] = await self.session.scalars(
            select(CollaborationResearcher.researcher_id).where(
                CollaborationResearcher.collaboration_id == collaboration_id
            )
        )
        return list(members.all())
