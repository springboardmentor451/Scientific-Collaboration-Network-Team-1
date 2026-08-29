import pytest
from app.schemas import CitationRequest
from pydantic import ValidationError


def test_self_citation_rejected() -> None:
    with pytest.raises(ValidationError, match="cannot cite itself"):
        CitationRequest(citing_publication_id=1, cited_publication_ids=[1])


def test_self_citation_in_list_rejected() -> None:
    with pytest.raises(ValidationError, match="cannot cite itself"):
        CitationRequest(citing_publication_id=1, cited_publication_ids=[2, 1])


def test_duplicate_cited_ids_rejected() -> None:
    with pytest.raises(ValidationError, match="duplicate"):
        CitationRequest(citing_publication_id=1, cited_publication_ids=[2, 2])


def test_empty_cited_list_rejected() -> None:
    with pytest.raises(ValidationError):
        CitationRequest(citing_publication_id=1, cited_publication_ids=[])


def test_valid_single_citation() -> None:
    req = CitationRequest(citing_publication_id=1, cited_publication_ids=[2])
    assert req.citing_publication_id == 1
    assert req.cited_publication_ids == [2]


def test_valid_bulk_citation() -> None:
    req = CitationRequest(citing_publication_id=1, cited_publication_ids=[2, 3, 4])
    assert len(req.cited_publication_ids) == 3
