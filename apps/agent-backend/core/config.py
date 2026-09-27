from pathlib import Path
from typing import Literal

from pydantic import Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


ROOT_ENV_FILE = Path(__file__).resolve().parents[3] / ".env"


class EnvironmentSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ROOT_ENV_FILE, env_file_encoding="utf-8", extra="ignore"
    )


class DatabaseSettings(EnvironmentSettings):
    host: str = Field(default="localhost", min_length=1, validation_alias="POSTGRES_HOST")
    port: int = Field(default=5432, ge=1, le=65535, validation_alias="POSTGRES_PORT")
    name: str = Field(default="eitri", min_length=1, validation_alias="POSTGRES_DB")
    user: str = Field(default="eitri", min_length=1, validation_alias="POSTGRES_USER")
    password: SecretStr = Field(min_length=1, validation_alias="POSTGRES_PASSWORD")


class GeminiSettings(EnvironmentSettings):
    provider: Literal["gemini", "vertex"] = Field(
        default="gemini", validation_alias="EITRI_LLM_PROVIDER"
    )
    api_key: SecretStr | None = Field(default=None, validation_alias="GOOGLE_API_KEY")
    project: str | None = Field(default=None, min_length=1, validation_alias="GOOGLE_CLOUD_PROJECT")
    location: str = Field(default="global", min_length=1, validation_alias="GOOGLE_CLOUD_LOCATION")
    model: str = Field(min_length=1, validation_alias="EITRI_LLM_MODEL")

    @model_validator(mode="after")
    def validate_credentials(self) -> "GeminiSettings":
        if self.provider == "gemini" and (
            self.api_key is None or not self.api_key.get_secret_value().strip()
        ):
            raise ValueError("GOOGLE_API_KEY is required for the Gemini Developer API")
        if self.provider == "vertex" and not self.project:
            raise ValueError("GOOGLE_CLOUD_PROJECT is required for Vertex AI")
        return self


class LoggingSettings(EnvironmentSettings):
    level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = Field(
        default="INFO", validation_alias="LOG_LEVEL"
    )
