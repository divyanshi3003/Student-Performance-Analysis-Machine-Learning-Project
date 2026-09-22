import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "EduMetrics ML API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Use Supabase PostgreSQL connection string (Transaction pooler)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres.wufpncjbaldqujlfihsk:your_password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres")
    
    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://wufpncjbaldqujlfihsk.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "your_anon_key")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "your_supabase_jwt_secret_key")

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
