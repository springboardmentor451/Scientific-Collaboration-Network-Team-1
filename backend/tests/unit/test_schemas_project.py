from datetime import date

import pytest
from app.schemas import ProjectRequest, ProjectUpdateRequest
from app.schemas.base import validate_dates
from pydantic import ValidationError


def test_project_requires_name() -> None:
    with pytest.raises(ValidationError):
        ProjectRequest(name="")


def test_project_name_min_length() -> None:
    with pytest.raises(ValidationError):
        ProjectRequest(name="")


def test_project_valid_minimal() -> None:
    req = ProjectRequest(name="NLP Research")
    assert req.name == "NLP Research"
    assert req.researcher_ids == []
    assert req.description is None


def test_project_no_dates_valid() -> None:
    req = ProjectRequest(name="Open Ended")
    assert req.start_date is None
    assert req.end_date is None


def test_end_before_start_raises() -> None:
    with pytest.raises(ValueError, match="end_date"):
        validate_dates(date(2024, 12, 31), date(2024, 1, 1))


def test_none_dates_valid() -> None:
    validate_dates(None, None)
    validate_dates(None, date(2024, 1, 1))


def test_project_update_all_optional() -> None:
    req = ProjectUpdateRequest()
    assert req.name is None
    assert req.status is None
