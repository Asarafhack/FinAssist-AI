"""Environment-backed application settings."""
from pydantic import BaseModel, Field
import os

class Settings(BaseModel):
    app_name: str = "FinAssist AI"
    database_path: str = os.getenv("FINASSIST_DB_PATH", "./finassist.db")
    retrieval_threshold: float = Field(default_factory=lambda: float(os.getenv("RETRIEVAL_THRESHOLD", "0.12")), ge=0, le=1)
    llm_api_key: str | None = os.getenv("LLM_API_KEY") or None
    llm_base_url: str = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    llm_model: str = os.getenv("LLM_MODEL", "gpt-4o-mini")
    llm_timeout_seconds: float = Field(default_factory=lambda: float(os.getenv("LLM_TIMEOUT_SECONDS", "12")), ge=1, le=60)
    environment: str = os.getenv("ENVIRONMENT", "development")

    @property
    def llm_enabled(self) -> bool:
        return bool(self.llm_api_key and self.llm_model and self.llm_base_url)

settings = Settings()
