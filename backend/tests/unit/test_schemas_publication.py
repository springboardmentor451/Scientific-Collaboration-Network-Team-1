from datetime import date

import pytest
from app.core.constants import PublicationStatus, PublicationType
from app.schemas import PublicationRequest, PublicationUpdateRequest
from pydantic import ValidationError


def test_valid_publication_request() -> None:
    req = PublicationRequest(title="Valid Title Here")
    assert req.title == "Valid Title Here"
    assert req.publication_type == PublicationType.JOURNAL
    assert req.status == PublicationStatus.DRAFT


def test_title_too_short_rejected() -> None:
    with pytest.raises(ValidationError):
        PublicationRequest(title="Hi")


def test_all_publication_types_valid() -> None:
    for pub_type in PublicationType:
        req = PublicationRequest(title="Valid Title Here", publication_type=pub_type)
        assert req.publication_type == pub_type


def test_all_statuses_valid() -> None:
    for status in PublicationStatus:
        req = PublicationRequest(title="Valid Title Here", status=status)
        assert req.status == status


def test_invalid_doi_length() -> None:
    from app.core.constants import DOI_MAX_LENGTH

    with pytest.raises(ValidationError):
        PublicationRequest(title="Valid Title Here", doi="x" * (DOI_MAX_LENGTH + 1))


def test_external_authors_default_empty() -> None:
    req = PublicationRequest(title="Valid Title Here")
    assert req.external_authors == []


def test_researcher_ids_default_empty() -> None:
    req = PublicationRequest(title="Valid Title Here")
    assert req.researcher_ids == []


def test_future_publication_date_valid() -> None:
    req = PublicationRequest(
        title="Valid Title Here",
        publication_date=date(2030, 1, 1),
    )
    assert req.publication_date == date(2030, 1, 1)


def test_update_all_optional() -> None:
    req = PublicationUpdateRequest()
    assert req.title is None
    assert req.status is None
