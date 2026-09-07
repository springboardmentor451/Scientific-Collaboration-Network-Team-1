import pytest
from app.core.config import DevelopmentConfig, ProductionConfig, TestingConfig
from pydantic import ValidationError


def test_development_config_debug_true() -> None:
    cfg: DevelopmentConfig = DevelopmentConfig.model_validate({})
    assert cfg.DEBUG is True


def test_testing_config_test_true() -> None:
    cfg: TestingConfig = TestingConfig.model_validate({})
    assert cfg.TESTING is True


def test_production_config_debug_and_testing_false() -> None:
    cfg: ProductionConfig = ProductionConfig.model_validate(
        {
            "DATABASE_URL": "postgresql+asyncpg://user:pass@localhost/proddb",
            "JWT_KEY": "prod-key-minimum-32-characters-long-value",
            "ACCESS_TOKEN_EXPIRE_MINUTES": 15,
            "REFRESH_TOKEN_EXPIRE_DAYS": 7,
            "ALLOWED_ORIGIN": "https://yourapp.com",
        }
    )
    assert cfg.DEBUG is False
    assert cfg.TESTING is False


def test_invalid_algorithm_rejected(monkeypatch) -> None:
    monkeypatch.setenv("ALGORITHM", "RS256")
    with pytest.raises(expected_exception=ValidationError):
        DevelopmentConfig.model_validate({})


def test_negative_token_expiry_rejected(monkeypatch) -> None:
    monkeypatch.setenv("ACCESS_TOKEN_EXPIRE_MINUTES", "-1")
    with pytest.raises(expected_exception=ValidationError):
        DevelopmentConfig.model_validate({})
