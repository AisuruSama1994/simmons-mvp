from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """Configuración centralizada de la aplicación"""
    
    # Database
    DATABASE_URL: str = "postgresql://simmons:simmons123@postgres:5432/simmons_db"
    
    # JWT & Security
    SECRET_KEY: str = "dev-secret-key-change-in-production-simmons-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Application
    DEBUG: bool = True
    REQUIRE_AUTH: bool = False
    APP_NAME: str = "Simmons MVP"
    APP_VERSION: str = "1.0.0"
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    
    # Seeds
    CREATE_SEED_DATA: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()