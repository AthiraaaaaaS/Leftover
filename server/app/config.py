"""Application configuration."""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """App settings from env."""

    app_name: str = "LeftoverLink API"
    debug: bool = False
    # PostgreSQL: postgresql+asyncpg://user:password@host:port/dbname
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/leftoverlink"
    secret_key: str = "leftoverlink-dev-secret-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174"
    # Admin app is built and deployed separately. Add its URL(s) here so it can fetch donations (comma-separated).
    # e.g. https://admin.yourdomain.com or http://localhost:5174 for local dev.
    admin_cors_origins: str = ""
    # Google Maps API key for Geocoding & Places
    google_maps_api_key: Optional[str] = None
    # Resend.com API key for sending emails (free tier: 100/day). Leave empty to skip sending.
    resend_api_key: Optional[str] = None
    # Base URL of the client app (for feedback links in emails). e.g. https://yourapp.com
    client_base_url: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
