import os

from dotenv import load_dotenv
from pydantic import SecretStr

load_dotenv()


def _parse_int(key: str, default_val: str) -> int:
    val: str = os.environ.get(key, default_val)
    try:
        return int(val)
    except ValueError:
        raise SystemExit(f"[config] {key} must be an integer got '{val}'")


class Config:
    JWT_KEY = SecretStr(os.environ.get("JWT_KEY", ""))
    DATABASE_URL: str = os.environ.get("DATABASE_URL", "")
    ALGORITHM: str = os.environ.get("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = _parse_int("ACCESS_TOKEN_EXPIRE_MINUTES", "0")
    REFRESH_TOKEN_EXPIRE_DAYS: int = _parse_int("REFRESH_TOKEN_EXPIRE_DAYS", "0")
    DEBUG = False
    TESTING = False

    @classmethod
    def validate(cls) -> None:
        """Validate that all required configuration variables are set"""
        errors: list[str] = []
        if not cls.JWT_KEY.get_secret_value():
            errors.append("JWT_KEY is not set")
        if not cls.DATABASE_URL:
            errors.append("DATABASE_URL is not set")
        if cls.ALGORITHM not in ("HS256", "HS384", "HS512"):
            errors.append(
                f"ALGORITHM '{cls.ALGORITHM}' is not a supported HMAC algorithm"
            )
        if cls.ACCESS_TOKEN_EXPIRE_MINUTES <= 0:
            errors.append("ACCESS_TOKEN_EXPIRE_MINUTES must be a positive integer")
        if cls.REFRESH_TOKEN_EXPIRE_DAYS <= 0:
            errors.append("REFRESH_TOKEN_EXPIRE_DAYS must be a positive integer")

        if errors:
            raise SystemExit(
                f"configuration error:-\n{'\n'.join(f'- {error}' for error in errors)}"
            )


class DevelopmentConfig(Config):
    JWT_KEY: SecretStr = SecretStr("dev-key-minimum-32-characters-long")
    DATABASE_URL: str = os.environ.get(
        "DEV_DATABASE_URL", "sqlite+aiosqlite:///database/dev.db"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    DEBUG = True


class TestingConfig(Config):
    JWT_KEY = SecretStr("test-key-minimum-32-characters-long")
    DATABASE_URL: str = os.environ.get(
        "TEST_DATABASE_URL", "sqlite+aiosqlite:///database/test.db"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    TESTING = True


class ProductionConfig(Config):
    pass


config: dict[str, type[Config]] = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}


def get_config() -> type[Config]:
    env: str = os.environ.get("FASTAPI_ENV", "development")
    if env not in config:
        raise SystemExit(
            f"[config] FASTAPI_ENV must be in {list(config.keys())}, got '{env}'"
        )
    return config[env]
