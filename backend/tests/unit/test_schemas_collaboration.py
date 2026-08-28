import pytest
from app.schemas.collaboration import CollaborationRequest
from pydantic import ValidationError


def test_requires_at_least_two_researchers() -> None:
    with pytest.raises(ValidationError):
        CollaborationRequest(researcher_ids=[1])


def test_empty_list_rejected() -> None:
    with pytest.raises(ValidationError):
        CollaborationRequest(researcher_ids=[])


def test_duplicate_ids_rejected() -> None:
    with pytest.raises(ValidationError, match="cannot collaborate with themselves"):
        CollaborationRequest(researcher_ids=[1, 1])


def test_three_researchers_valid() -> None:
    req = CollaborationRequest(researcher_ids=[1, 2, 3])
    assert len(req.researcher_ids) == 3


def test_two_researchers_valid() -> None:
    req = CollaborationRequest(researcher_ids=[1, 2])
    assert req.researcher_ids == [1, 2]


def test_optional_collaboration_type() -> None:
    req = CollaborationRequest(researcher_ids=[1, 2], collaboration_type="co_authorship")
    assert req.collaboration_type == "co_authorship"


def test_collaboration_type_none_by_default() -> None:
    req = CollaborationRequest(researcher_ids=[1, 2])
    assert req.collaboration_type is None
