import pytest
from app.services.project import ProjectService
from fastapi import HTTPException


def make_service() -> ProjectService:
    return ProjectService.__new__(ProjectService)


def test_normalize_member_ids_excludes_pi() -> None:
    service: ProjectService = make_service()
    result: list[int] = service._normalize_member_ids([1, 2, 3], exclude_id=1)
    assert 1 not in result
    assert result == [2, 3]


def test_normalize_member_ids_rejects_duplicates() -> None:
    service: ProjectService = make_service()
    with pytest.raises(HTTPException) as exc:
        service._normalize_member_ids([1, 1, 2], exclude_id=99)
    assert exc.value.status_code == 400


def test_normalize_member_ids_empty_list() -> None:
    service: ProjectService = make_service()
    result: list[int] = service._normalize_member_ids([], exclude_id=1)
    assert result == []