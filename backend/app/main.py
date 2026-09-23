from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import logging
from app.core.config import settings
from app.core.database import engine, Base
from app.api.routers import auth, students, predict, mentors

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize DB tables (managed via Alembic)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for EduMetrics ML - Student Performance Analysis System.",
    contact={
        "name": "Divyanshi Sharma",
        "email": "iamdivya3003@gmail.com",
    },
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(students.router, prefix=f"{settings.API_V1_STR}/students", tags=["students"])
app.include_router(predict.router, prefix=f"{settings.API_V1_STR}/predict", tags=["predict"])
app.include_router(mentors.router, prefix=f"{settings.API_V1_STR}/mentors", tags=["mentors"])

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
