from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import logging
from app.core.config import settings
from app.core.database import engine, Base

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize DB tables (for dev only, usually use Alembic in prod)
# Initialize DB tables (managed via Alembic)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
)

# Global Error Middleware
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global Error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"message": "An unexpected error occurred. Please try again later."},
    )

@app.get("/health", tags=["System"])
async def health_check():
    """Basic health check endpoint"""
    return {"status": "ok", "project": settings.PROJECT_NAME, "version": settings.VERSION}
