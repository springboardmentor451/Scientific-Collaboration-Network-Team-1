import os
from pathlib import Path

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR: Path = Path(__file__).resolve().parent.parent
ENV_PATH: Path = BASE_DIR / ".env"
ALLOWED_ALGORITHMS: frozenset[str] = frozenset({"HS256", "HS384", "HS512"})
_SHARED_SETTINGS = SettingsConfigDict(
    env_file=ENV_PATH, env_file_encoding="utf-8", extra="ignore"
)


class Config(BaseSettings):
    model_config = _SHARED_SETTINGS

    JWT_KEY: SecretStr
    DATABASE_URL: str
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int
    DEBUG: bool = False
    TESTING: bool = False
    SMTP_HOST: str = Field(default="localhost")
    SMTP_PORT: int = Field(default=587)
    SMTP_USER: str = Field(default="")
    SMTP_PASSWORD: SecretStr = Field(default=SecretStr(""))

    @field_validator("ALGORITHM")
    @classmethod
    def validate_algorithm(cls, v: str) -> str:
        if v not in ALLOWED_ALGORITHMS:
            raise ValueError(f"Unsupported HMAC algorithm: {v}")
        return v

    @field_validator(
        "ACCESS_TOKEN_EXPIRE_MINUTES", "REFRESH_TOKEN_EXPIRE_DAYS", "SMTP_PORT"
    )
    @classmethod
    def validate_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Must be a positive integer")
        return v


class DevelopmentConfig(Config):
    JWT_KEY: SecretStr = SecretStr("dev-key-minimum-32-characters-long")
    DATABASE_URL: str = Field(default="sqlite+aiosqlite:///database/dev.db")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    DEBUG: bool = True


class TestingConfig(Config):
    JWT_KEY: SecretStr = SecretStr("test-key-minimum-32-characters-long")
    DATABASE_URL: str = Field(default="sqlite+aiosqlite:///database/test.db")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    TESTING: bool = True


class ProductionConfig(Config):
    pass


_config: dict[str, type[Config]] = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}


def get_config() -> Config:
    env: str = os.environ.get("FASTAPI_ENV", "development")
    if env not in _config:
        raise SystemExit(
            f"[config] FASTAPI_ENV must be in {list(_config.keys())}, got '{env}'"
        )
    cls = _config[env]
    return cls.model_validate({})
