import pytest
from app.core.constants import LOCATION_MAX_LENGTH, InstitutionType
from app.schemas import InstitutionRequest, InstitutionUpdateRequest
from pydantic import ValidationError


def test_valid_institution() -> None:
    req = InstitutionRequest(name="MIT", country="USA", city="Cambridge")
    assert req.name == "MIT"
    assert req.type == InstitutionType.UNIVERSITY


def test_default_type_is_university() -> None:
    req = InstitutionRequest(name="MIT", country="USA", city=None)
    assert req.type == InstitutionType.UNIVERSITY


def test_all_institution_types_valid() -> None:
    for inst_type in InstitutionType:
        req = InstitutionRequest(name="Test", country="USA", city=None, type=inst_type)
        assert req.type == inst_type


def test_city_optional() -> None:
    req = InstitutionRequest(name="MIT", country="USA", city=None)
    assert req.city is None


def test_city_max_length() -> None:
    with pytest.raises(ValidationError):
        InstitutionRequest(
            name="MIT", country="USA", city="x" * (LOCATION_MAX_LENGTH + 1)
        )


def test_update_all_optional() -> None:
    req = InstitutionUpdateRequest()
    assert req.name is None
    assert req.country is None


def test_institution_domain_optional() -> None:
    req = InstitutionRequest(name="MIT", country="USA", city="Cambridge")
    assert req.domain is None


def test_institution_domain_stored() -> None:
    req = InstitutionRequest(
        name="MIT", country="USA", city="Cambridge", domain="mit.edu"
    )
    assert req.domain == "mit.edu"
