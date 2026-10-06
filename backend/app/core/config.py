from functools import lru_cache

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str | None = None
    database_host: str | None = None
    database_port: int = 3306
    database_name: str | None = None
    database_user: str | None = None
    database_password: str | None = None

    @model_validator(mode="after")
    def _configure_database_url(self) -> "Settings":
        # Render Blueprint wires the private MySQL host and generated password
        # as separate environment variables. Local development can keep using
        # DATABASE_URL as before.
        if self.database_host:
            required = {
                "DATABASE_NAME": self.database_name,
                "DATABASE_USER": self.database_user,
                "DATABASE_PASSWORD": self.database_password,
            }
            missing = [name for name, value in required.items() if not value]
            if missing:
                raise ValueError(f"Missing database settings: {', '.join(missing)}")
            self.database_url = URL.create(
                drivername="mysql+pymysql",
                username=self.database_user,
                password=self.database_password,
                host=self.database_host.strip(),
                port=self.database_port,
                database=self.database_name,
            ).render_as_string(hide_password=False)
        elif self.database_url:
            self.database_url = self.database_url.strip()
            # Some providers give a mysql:// URI; PyMySQL needs this SQLAlchemy
            # driver name. This keeps DATABASE_URL compatible with Aiven too.
            if self.database_url.startswith("mysql://"):
                self.database_url = "mysql+pymysql://" + self.database_url[len("mysql://") :]
        else:
            raise ValueError("Set DATABASE_URL or the DATABASE_HOST connection settings")
        return self

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

    @field_validator("database_url")
    @classmethod
    def _strip_database_url(cls, value: str | None) -> str | None:
        return value.strip() if value else value

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()