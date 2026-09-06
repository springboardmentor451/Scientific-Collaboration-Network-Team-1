import hashlib
import logging
from collections.abc import Callable

from fastapi import HTTPException
from sqlalchemy import Insert, ScalarResult, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.engine.result import Result
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Collaboration, CollaborationResearcher, Researcher
from app.schemas import CollaborationRequest, CollaborationResponse

logger: logging.Logger = logging.getLogger(__name__)


class CollaborationService:
    def __init__(self, session: AsyncSession) -> None:
        self.session: AsyncSession = session

    async def get_all(self) -> list[CollaborationResponse]:
        logger.debug("fetching all collaborations")
        result: ScalarResult[Collaboration] = await self.session.scalars(
            select(Collaboration)
        )
        return [CollaborationResponse.from_orm(c) for c in result.all()]

    async def get_by_researcher(
        self, researcher_id: int
    ) -> list[CollaborationResponse]:
        logger.debug("fetching collaborations for researcher: %d", researcher_id)
        result: ScalarResult[Collaboration] = await self.session.scalars(
            select(Collaboration)
            .join(CollaborationResearcher)
            .where(CollaborationResearcher.researcher_id == researcher_id)
        )
        return [CollaborationResponse.from_orm(c) for c in result.all()]

    async def create(
        self, data: CollaborationRequest, researcher: Researcher
    ) -> CollaborationResponse:
        logger.debug("create collaboration: researchers=%s", data.researcher_ids)
        self._ensure_creator_included(data, researcher)
        if len(set(data.researcher_ids)) != len(data.researcher_ids):
            raise HTTPException(
                status_code=404, detail="duplicate researcher IDs not allowed"
            )
        for researcher_id in data.researcher_ids:
            await self._get_researcher(researcher_id)
        collaboration_id: int = await self._upsert_collaboration(data)
        await self._ensure_members(collaboration_id, data.researcher_ids)
        await self.session.commit()
        collaboration: Collaboration | None = await self.session.get(
            Collaboration, collaboration_id
        )
        await self.session.refresh(collaboration)
        logger.info("collaboration upserted: %d", collaboration_id)
        return CollaborationResponse.from_orm(collaboration)

    async def delete(self, collaboration_id: int, researcher: Researcher) -> None:
        logger.debug("delete collaboration: %d", collaboration_id)
        collaboration: Collaboration | None = await self.session.get(
            Collaboration, collaboration_id
        )
        if not collaboration:
            logger.warning("collaboration not found: %d", collaboration_id)
            raise HTTPException(status_code=404, detail="collaboration not found")
        await self._check_participant(collaboration_id, researcher.researcher_id)
        await self.session.delete(collaboration)
        await self.session.commit()
        logger.warning("collaboration deleted: %d", collaboration_id)

    async def _get_researcher(self, researcher_id: int) -> Researcher:
        researcher: Researcher | None = await self.session.get(
            Researcher, researcher_id
        )
        if not researcher:
            raise HTTPException(
                status_code=404, detail=f"researcher {researcher_id} not found"
            )
        return researcher

    async def _check_participant(
        self, collaboration_id: int, researcher_id: int
    ) -> None:
        member: CollaborationResearcher | None = await self.session.scalar(
            select(CollaborationResearcher).where(
                CollaborationResearcher.collaboration_id == collaboration_id,
                CollaborationResearcher.researcher_id == researcher_id,
            )
        )
        if not member:
            logger.warning(
                "collaboration access denied: researcher_id=%d collaboration_id=%d",
                researcher_id,
                collaboration_id,
            )
            raise HTTPException(
                status_code=403,
                detail="you are not a participant in this collaboration",
            )

    def _ensure_creator_included(
        self, data: CollaborationRequest, researcher: Researcher
    ) -> None:
        if researcher.researcher_id not in data.researcher_ids:
            raise HTTPException(
                status_code=403, detail="you must include yourself in the collaboration"
            )

    def _member_key(self, researcher_ids: list[int]) -> str:
        canonical: str = ",".join(str(rid) for rid in sorted(set(researcher_ids)))
        return hashlib.sha256(canonical.encode()).hexdigest()

    async def _upsert_collaboration(self, data: CollaborationRequest) -> int:
        key: str = self._member_key(data.researcher_ids)
        dialect: str = self.session.bind.dialect.name
        insert_fn: Callable[..., Insert] = (
            pg_insert if dialect == "postgresql" else sqlite_insert
        )
        stmt: Insert = insert_fn(Collaboration).values(
            member_key=key,
            collaboration_type=data.collaboration_type,
            collaboration_count=1,
        )
        stmt = stmt.on_conflict_do_update(
            index_elements=["member_key"],
            set_={"collaboration_count": Collaboration.collaboration_count + 1},
        ).returning(Collaboration.collaboration_id)
        result: Result[tuple[int]] = await self.session.execute(stmt)
        return result.scalar_one()

    async def _ensure_members(
        self, collaboration_id: int, researcher_ids: list[int]
    ) -> None:
        dialact: str = self.session.bind.dialect.name
        insert_fn: Callable[..., Insert] = (
            pg_insert if dialact == "postgresql" else sqlite_insert
        )
        rows: list[dict[str, int]] = [
            {"collaboration_id": collaboration_id, "researcher_id": researcher_id}
            for researcher_id in researcher_ids
        ]
        stmt: Insert = insert_fn(CollaborationResearcher).values(rows)
        stmt = stmt.on_conflict_do_nothing(
            index_elements=["collaboration_id", "researcher_id"]
        )
        await self.session.execute(stmt)
