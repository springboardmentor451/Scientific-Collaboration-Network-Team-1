import logging
from collections.abc import Sequence
from typing import Any

from fastapi import HTTPException
from sqlalchemy import Result, Row, ScalarResult, Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import (
    ProjectStatus,
    PublicationStatus,
    PublicationType,
    UserStatus,
)
from app.models import (
    Citation,
    Collaboration,
    CollaborationResearcher,
    Conference,
    Institution,
    Project,
    ProjectResearcher,
    Publication,
    PublicationAuthor,
    Researcher,
    User,
)
from app.schemas import (
    InstitutionStats,
    ProjectStats,
    PublicationStats,
    PublicStats,
    ResearcherDashboard,
    SystemStats,
)

logger: logging.Logger = logging.getLogger(__name__)


class DashboardService:
    def __init__(self, session: AsyncSession) -> None:
        self.session: AsyncSession = session

    # async def get_researcher_dashboard(self, user_id: int) -> ResearcherDashboard:
    #     logger.debug("fetching researcher dashboard for user: %d", user_id)
    #     researcher: Researcher | None = await self.session.scalar(
    #         select(Researcher).where(Researcher.user_id == user_id)
    #     )
    #     if not researcher:
    #         raise HTTPException(status_code=404, detail="researcher profile not found")
    #     # publication stats
    #     pub_rows: Result[
    #         tuple[PublicationType, PublicationStatus, int]
    #     ] = await self.session.execute(
    #         select(Publication.publication_type, Publication.status, func.count())
    #         .join(PublicationAuthor)
    #         .where(PublicationAuthor.researcher_id == researcher.researcher_id)
    #         .group_by(Publication.publication_type, Publication.status)
    #     )
    #     rows: Sequence[Row[tuple[PublicationType, PublicationStatus, int]]] = (
    #         pub_rows.all()
    #     )
    #     total_pubs: int = sum(r[2] for r in rows)
    #     by_type: dict[str, int] = {}
    #     by_status: dict[str, int] = {}
    #     for pub_type, status, count in rows:
    #         by_type[pub_type] = by_type.get(pub_type, 0) + count
    #         by_status[status] = by_status.get(status, 0) + count
    #     # project stats
    #     project_rows: Result[tuple[ProjectStatus, int]] = await self.session.execute(
    #         select(Project.status, func.count())
    #         .join(ProjectResearcher)
    #         .where(ProjectResearcher.researcher_id == researcher.researcher_id)
    #         .group_by(Project.status)
    #     )
    #     project_counts = {row[0]: row[1] for row in project_rows.all()}
    #     # collaboration count
    #     collab_count: int | None = await self.session.scalar(
    #         select(
    #             func.count(CollaborationResearcher.collaboration_id.distinct())
    #         ).where(CollaborationResearcher.researcher_id == researcher.researcher_id)
    #     )
    #     # citation count - how many times this researcher's papers were cited
    #     citation_count: int | None = await self.session.scalar(
    #         select(func.count(Citation.citation_id))
    #         .join(
    #             Publication, Citation.cited_publication_id == Publication.publication_id
    #         )
    #         .join(PublicationAuthor)
    #         .where(PublicationAuthor.researcher_id == researcher.researcher_id)
    #     )
    #     return ResearcherDashboard(
    #         researcher_id=researcher.researcher_id,
    #         name=researcher.name,
    #         publication_stats=PublicationStats(
    #             total=total_pubs, by_type=by_type, by_status=by_status
    #         ),
    #         project_stats=ProjectStats(
    #             total=sum(project_counts.values()),
    #             active=project_counts.get(ProjectStatus.ACTIVE, 0),
    #             completed=project_counts.get(ProjectStatus.COMPLETED, 0),
    #         ),
    #         collaboration_count=collab_count or 0,
    #         citation_count=citation_count or 0,
    #     )

    # async def get_institution_stats(self, institution_id: int) -> InstitutionStats:
    #     logger.debug("fetch institution stats: %d", institution_id)
    #     institution: Institution | None = await self.session.get(
    #         Institution, institution_id
    #     )
    #     if not institution:
    #         raise HTTPException(status_code=404, detail="institution not found")
    #     researcher_count: int | None = await self.session.scalar(
    #         select(func.count(Researcher.researcher_id)).where(
    #             Researcher.institution_id == institution_id
    #         )
    #     )
    #     researcher_ids: ScalarResult[int] = await self.session.scalars(
    #         select(Researcher.researcher_id).where(
    #             Researcher.institution_id == institution_id
    #         )
    #     )
    #     rid_list: list[int] = list(researcher_ids.all())
    #     pub_count = 0
    #     active_projects = 0
    #     if rid_list:
    #         pub_count: int | None = await self.session.scalar(
    #             select(func.count(PublicationAuthor.publication_id.distinct())).where(
    #                 PublicationAuthor.researcher_id.in_(rid_list)
    #             )
    #         )
    #         active_projects: int | None = await self.session.scalar(
    #             select(func.count(ProjectResearcher.project_id.distinct()))
    #             .join(Project)
    #             .where(
    #                 ProjectResearcher.researcher_id.in_(rid_list),
    #                 Project.status == ProjectStatus.ACTIVE,
    #             )
    #         )
    #     return InstitutionStats(
    #         institution_id=institution_id,
    #         name=institution.name,
    #         total_researchers=researcher_count or 0,
    #         total_publications=pub_count or 0,
    #         active_projects=active_projects or 0,
    #     )
    async def get_researcher_dashboard(self, user_id: int) -> ResearcherDashboard:
        logger.debug("fetching researcher dashboard for user: %d", user_id)
        researcher: Researcher = await self._get_researcher_by_user_id(user_id)
        researcher_id: int = researcher.researcher_id
        return ResearcherDashboard(
            researcher_id=researcher_id,
            name=researcher.name,
            publication_stats=await self._get_publication_stats(researcher_id),
            project_stats=await self._get_project_stats(researcher_id),
            collaboration_count=await self._count_collaborations(researcher_id),
            citation_count=await self._count_citations_received(researcher_id),
        )

    async def get_institution_stats(self, institution_id: int) -> InstitutionStats:
        logger.debug("fetching institution stats: %d", institution_id)
        institution: Institution = await self._get_institution_or_404(institution_id)
        researcher_ids: list[int] = await self._get_researcher_ids(institution_id)
        return InstitutionStats(
            institution_id=institution_id,
            name=institution.name,
            total_researchers=len(researcher_ids),
            total_publications=await self._count_publications(researcher_ids),
            active_projects=await self._count_active_projects(researcher_ids),
        )

    async def get_system_stats(self) -> SystemStats:
        logger.debug("fetch system stats")
        return SystemStats(
            total_users=await self._count(User),
            pending_users=await self._count(User, User.status == UserStatus.PENDING),
            active_users=await self._count(User, User.status == UserStatus.ACTIVE),
            total_researchers=await self._count(Researcher),
            total_institutions=await self._count(Institution),
            total_publications=await self._count(Publication),
            total_projects=await self._count(Project),
            total_collaborations=await self._count(Collaboration),
            total_citations=await self._count(Citation),
        )

    async def get_public_stats(self) -> PublicStats:
        return PublicStats(
            total_researchers=await self._count(Researcher),
            total_publications=await self._count(Publication),
            total_institutions=await self._count(Institution),
            total_conferences=await self._count(Conference),
            total_collaborations=await self._count(Collaboration),
        )

    async def _get_researcher_by_user_id(self, user_id: int) -> Researcher:
        researcher: Researcher | None = await self.session.scalar(
            select(Researcher).where(Researcher.user_id == user_id)
        )
        if not researcher:
            raise HTTPException(status_code=404, detail="researcher profile not found")
        return researcher

    async def _get_publication_stats(self, researcher_id: int) -> PublicationStats:
        pub_rows: Result[
            tuple[PublicationType, PublicationStatus, int]
        ] = await self.session.execute(
            select(Publication.publication_type, Publication.status, func.count())
            .join(PublicationAuthor)
            .where(PublicationAuthor.researcher_id == researcher_id)
            .group_by(Publication.publication_type, Publication.status)
        )
        rows: Sequence[Row[tuple[PublicationType, PublicationStatus, int]]] = (
            pub_rows.all()
        )
        by_type: dict[str, int] = {}
        by_status: dict[str, int] = {}
        for pub_type, status, count in rows:
            by_type[pub_type] = by_type.get(pub_type, 0) + count
            by_status[status] = by_status.get(status, 0) + count
        return PublicationStats(
            total=sum(r[2] for r in rows), by_type=by_type, by_status=by_status
        )

    async def _get_project_stats(self, researcher_id: int) -> ProjectStats:
        project_rows: Result[tuple[ProjectStatus, int]] = await self.session.execute(
            select(Project.status, func.count())
            .join(ProjectResearcher)
            .where(ProjectResearcher.researcher_id == researcher_id)
            .group_by(Project.status)
        )
        project_counts: dict[ProjectStatus, int] = {
            row[0]: row[1] for row in project_rows.all()
        }
        return ProjectStats(
            total=sum(project_counts.values()),
            active=project_counts.get(ProjectStatus.ACTIVE, 0),
            completed=project_counts.get(ProjectStatus.COMPLETED, 0),
        )

    async def _count_collaborations(self, researcher_id: int) -> int:
        count: int | None = await self.session.scalar(
            select(
                func.count(CollaborationResearcher.collaboration_id.distinct())
            ).where(CollaborationResearcher.researcher_id == researcher_id)
        )
        return count or 0

    async def _count_citations_received(self, researcher_id: int) -> int:
        """How many times this researcher's papers were cited by others."""
        count: int | None = await self.session.scalar(
            select(func.count(Citation.citation_id))
            .join(
                Publication, Citation.cited_publication_id == Publication.publication_id
            )
            .join(PublicationAuthor)
            .where(PublicationAuthor.researcher_id == researcher_id)
        )
        return count or 0

    async def _get_institution_or_404(self, institution_id: int) -> Institution:
        institution: Institution | None = await self.session.get(
            Institution, institution_id
        )
        if not institution:
            raise HTTPException(status_code=404, detail="institution not found")
        return institution

    async def _get_researcher_ids(self, institution_id: int) -> list[int]:
        researcher_ids: ScalarResult[int] = await self.session.scalars(
            select(Researcher.researcher_id).where(
                Researcher.institution_id == institution_id
            )
        )
        return list(researcher_ids.all())

    async def _count_publications(self, researcher_ids: list[int]) -> int:
        if not researcher_ids:
            return 0
        count: int | None = await self.session.scalar(
            select(func.count(PublicationAuthor.publication_id.distinct())).where(
                PublicationAuthor.researcher_id.in_(researcher_ids)
            )
        )
        return count or 0

    async def _count_active_projects(self, researcher_ids: list[int]) -> int:
        if not researcher_ids:
            return 0
        count: int | None = await self.session.scalar(
            select(func.count(ProjectResearcher.project_id.distinct()))
            .join(Project)
            .where(
                ProjectResearcher.researcher_id.in_(researcher_ids),
                Project.status == ProjectStatus.ACTIVE,
            )
        )
        return count or 0

    async def _count(self, model: type, condition: Any = None) -> int:
        query: Select[tuple[int]] = select(func.count()).select_from(model)
        if condition is not None:
            query = query.where(condition)
        return await self.session.scalar(query) or 0
