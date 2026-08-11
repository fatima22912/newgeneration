from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str

    @field_validator("database_url")
    @classmethod
    def _use_pymysql_driver(cls, v: str) -> str:
        # Railway (et d'autres hébergeurs) fournissent une URL mysql:// brute ;
        # le driver installé est PyMySQL, qui nécessite le préfixe mysql+pymysql://.
        if v.startswith("mysql://"):
            return "mysql+pymysql://" + v[len("mysql://") :]
        return v

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    refresh_cookie_name: str = "ng_refresh_token"
    refresh_cookie_secure: bool = False

    cors_origins: str = "http://localhost:5173"

    max_failed_login_attempts: int = 5
    account_lock_minutes: int = 15

    upload_dir: str = "uploads"
    max_upload_size_mb: int = 5

    default_page_size: int = 20
    max_page_size: int = 100

    environment: str = "development"
    rate_limiting_enabled: bool = True

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
