import logging

from fastapi import HTTPException
from sqlalchemy import ScalarResult, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import ProjectRole
from app.models import Project, ProjectResearcher, Researcher
from app.schemas import (
    ProjectMemberRequest,
    ProjectMemberResponse,
    ProjectMemberUpdateRequest,
    ProjectRequest,
    ProjectResponse,
    ProjectUpdateRequest,
)

logger: logging.Logger = logging.getLogger(__name__)


class ProjectService:
    def __init__(self, session: AsyncSession) -> None:
        self.session: AsyncSession = session

    async def get_all(self) -> list[ProjectResponse]:
        result: ScalarResult[Project] = await self.session.scalars(select(Project))
        return [ProjectResponse.from_orm(p) for p in result.all()]

    async def get_by_id(self, project_id: int) -> ProjectResponse:
        project: Project = await self._get_by_id(project_id)
        return ProjectResponse.from_orm(project)

    async def get_by_researcher(self, researcher_id: int) -> list[ProjectResponse]:
        result: ScalarResult[Project] = await self.session.scalars(
            select(Project)
            .join(ProjectResearcher)
            .where(ProjectResearcher.researcher_id == researcher_id)
        )
        return [ProjectResponse.from_orm(p) for p in result.all()]

    async def create(
        self, data: ProjectRequest, researcher: Researcher
    ) -> ProjectResponse:
        member_ids: list[int] = self._normalize_member_ids(
            data.researcher_ids, exclude_id=researcher.researcher_id
        )
        await self._ensure_researchers_exist(member_ids)

        project: Project = await self._create_project_row(data)
        self._assign_pi(project.project_id, researcher.researcher_id)
        self._assign_members(project.project_id, member_ids)

        await self.session.commit()
        logger.info("project created: %d", project.project_id)
        return ProjectResponse.from_orm(project)

    async def update(
        self, project_id: int, data: ProjectUpdateRequest, researcher: Researcher
    ) -> ProjectResponse:
        logger.debug("update project: %d", project_id)
        project: Project = await self._get_by_id(project_id)
        await self._check_membership(project_id, researcher.researcher_id)
        if data.name is not None:
            project.name = data.name
        if data.description is not None:
            project.description = data.description
        if data.start_date is not None:
            project.start_date = data.start_date
        if data.end_date is not None:
            project.end_date = data.end_date
        if data.status is not None:
            project.status = data.status
        if data.researcher_ids is not None:
            pi_id: int = await self._get_pi_id(project_id)
            await self._update_members(project_id, data.researcher_ids, pi_id)
        await self.session.commit()
        await self.session.refresh(project)
        logger.info("project updated: %d", project_id)
        return ProjectResponse.from_orm(project)

    async def delete(self, project_id: int, researcher: Researcher) -> None:
        project: Project = await self._get_by_id(project_id)
        member: ProjectResearcher = await self._check_membership(
            project_id, researcher.researcher_id
        )
        if member.role != ProjectRole.PI:
            raise HTTPException(
                status_code=403, detail="only the PI can delete a project"
            )
        await self.session.delete(project)
        await self.session.commit()
        logger.info("project deleted: %d", project_id)

    async def add_member(
        self, project_id: int, data: ProjectMemberRequest, researcher: Researcher
    ) -> ProjectMemberResponse:
        logger.debug("adding member to project: %d", project_id)
        current: ProjectResearcher = await self._check_membership(
            project_id, researcher.researcher_id
        )
        if current.role != ProjectRole.PI:
            raise HTTPException(status_code=403, detail="only PI can add members")
        # check target researcher exists
        target: Researcher | None = await self.session.get(
            Researcher, data.researcher_id
        )
        if not target:
            raise HTTPException(status_code=404, detail="researcher not found")
        # check not already a member
        existing: ProjectResearcher | None = await self.session.scalar(
            select(ProjectResearcher).where(
                ProjectResearcher.project_id == project_id,
                ProjectResearcher.researcher_id == data.researcher_id,
            )
        )
        if existing:
            raise HTTPException(
                status_code=409, detail="researcher is already a member"
            )
        member = ProjectResearcher(
            project_id=project_id, researcher_id=data.researcher_id, role=data.role
        )
        self.session.add(member)
        await self.session.commit()
        await self.session.refresh(member)
        logger.info(
            "member added: project_id=%d researcher_id=%d",
            project_id,
            data.researcher_id,
        )
        return ProjectMemberResponse.from_orm(member)

    async def remove_member(
        self, project_id: int, researcher_id: int, current_researcher: Researcher
    ) -> None:
        logger.debug("removing member from project: %d", project_id)
        current: ProjectResearcher = await self._check_membership(
            project_id, current_researcher.researcher_id
        )
        if current.role != ProjectRole.PI:
            raise HTTPException(status_code=403, detail="only PI can remove members")
        if researcher_id == current_researcher.researcher_id:
            raise HTTPException(
                status_code=400,
                detail="PI cannot remove themselves — transfer PI role first",
            )
        member: ProjectResearcher | None = await self.session.scalar(
            select(ProjectResearcher).where(
                ProjectResearcher.project_id == project_id,
                ProjectResearcher.researcher_id == researcher_id,
            )
        )
        if not member:
            raise HTTPException(
                status_code=404, detail="researcher is not a member of this project"
            )
        await self.session.delete(member)
        await self.session.commit()
        logger.info(
            "member removed: project_id=%d researcher_id=%d", project_id, researcher_id
        )

    async def update_member_role(
        self,
        project_id: int,
        researcher_id: int,
        data: ProjectMemberUpdateRequest,
        current_researcher: Researcher,
    ) -> ProjectMemberResponse:
        logger.debug("updating member role: project_id=%d", project_id)
        current: ProjectResearcher = await self._check_membership(
            project_id, current_researcher.researcher_id
        )
        if current.role != ProjectRole.PI:
            raise HTTPException(
                status_code=403, detail="only PI can update member roles"
            )
        member: ProjectResearcher | None = await self.session.scalar(
            select(ProjectResearcher).where(
                ProjectResearcher.project_id == project_id,
                ProjectResearcher.researcher_id == researcher_id,
            )
        )
        if not member:
            raise HTTPException(status_code=404, detail="researcher is not a member")
        member.role = data.role
        await self.session.commit()
        await self.session.refresh(member)
        logger.info(
            "member role updated: project_id=%d researcher_id=%d role=%s",
            project_id,
            researcher_id,
            data.role,
        )
        return ProjectMemberResponse.from_orm(member)

    async def _get_by_id(self, project_id: int) -> Project:
        project: Project | None = await self.session.get(Project, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="project not found")
        return project

    async def _get_pi_id(self, project_id: int) -> int:
        pi: ProjectResearcher | None = await self.session.scalar(
            select(ProjectResearcher).where(
                ProjectResearcher.project_id == project_id,
                ProjectResearcher.role == ProjectRole.PI,
            )
        )
        if not pi:
            raise HTTPException(status_code=500, detail="project has no PI")
        return pi.researcher_id

    def _normalize_member_ids(
        self, researcher_ids: list[int], exclude_id: int
    ) -> list[int]:
        """Dedupe requested members and silently drop the PI if they listed themselves."""
        if len(set(researcher_ids)) != len(researcher_ids):
            raise HTTPException(
                status_code=400, detail="duplicate researcher IDs not allowed"
            )
        return [rid for rid in researcher_ids if rid != exclude_id]

    async def _ensure_researchers_exist(self, researcher_ids: list[int]) -> None:
        for rid in researcher_ids:
            await self._get_researcher(rid)

    async def _get_researcher(self, researcher_id: int) -> Researcher:
        researcher: Researcher | None = await self.session.get(
            Researcher, researcher_id
        )
        if not researcher:
            raise HTTPException(
                status_code=404, detail=f"researcher {researcher_id} not found"
            )
        return researcher

    async def _create_project_row(self, data: ProjectRequest) -> Project:
        project = Project(
            name=data.name,
            description=data.description,
            start_date=data.start_date,
            end_date=data.end_date,
        )
        self.session.add(project)
        await self.session.flush()
        return project

    def _assign_pi(self, project_id: int, researcher_id: int) -> None:
        self.session.add(
            ProjectResearcher(
                project_id=project_id, researcher_id=researcher_id, role=ProjectRole.PI
            )
        )

    def _assign_members(self, project_id: int, researcher_ids: list[int]) -> None:
        for rid in researcher_ids:
            self.session.add(
                ProjectResearcher(
                    project_id=project_id, researcher_id=rid, role=ProjectRole.MEMBER
                )
            )

    async def _check_membership(
        self, project_id: int, researcher_id: int
    ) -> ProjectResearcher:
        member: ProjectResearcher | None = await self.session.scalar(
            select(ProjectResearcher).where(
                ProjectResearcher.project_id == project_id,
                ProjectResearcher.researcher_id == researcher_id,
            )
        )
        if not member:
            raise HTTPException(
                status_code=403, detail="you are not a member of this project"
            )
        return member

    async def _update_members(
        self, project_id: int, researcher_ids: list[int], pi_id: int
    ) -> None:
        member_ids: list[int] = self._normalize_member_ids(
            researcher_ids, exclude_id=pi_id
        )
        await self._ensure_researchers_exist(member_ids)

        # remove all existing non-PI members
        existing: ScalarResult[ProjectResearcher] = await self.session.scalars(
            select(ProjectResearcher).where(
                ProjectResearcher.project_id == project_id,
                ProjectResearcher.role != ProjectRole.PI,
            )
        )
        for member in existing.all():
            await self.session.delete(member)
        await self.session.flush()
        # add new members
        self._assign_members(project_id, member_ids)
        logger.info(
            "project members updated: project_id=%d members=%s",
            project_id,
            researcher_ids,
        )
