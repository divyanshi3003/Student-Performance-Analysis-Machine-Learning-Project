import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "EduMetrics ML API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # InsForge PostgreSQL connection string
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:2d93c8a04e23b7e965deb811e8da4f5c@844m3mz5.us-east.database.insforge.app:5432/insforge?sslmode=require"
    )
    
    # InsForge Platform Configuration
    INSFORGE_URL: str = os.getenv("INSFORGE_URL", "https://844m3mz5.us-east.insforge.app")
    INSFORGE_API_KEY: str = os.getenv("INSFORGE_API_KEY", "ik_861ca9233b1c9f32be0ff9f2c5e5b613")

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
