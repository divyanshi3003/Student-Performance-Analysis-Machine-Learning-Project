from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import logging
from app.core.config import settings
from app.core.database import engine, Base
from app.api.routers import auth, students, predict, mentors

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

@app.on_event("startup")
def on_startup():
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified/created successfully.")
    except Exception as e:
        logger.warning(f"Database table verification skipped: {e}")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(students.router, prefix=f"{settings.API_V1_STR}/students", tags=["students"])
app.include_router(predict.router, prefix=f"{settings.API_V1_STR}/predict", tags=["predict"])
app.include_router(mentors.router, prefix=f"{settings.API_V1_STR}/mentors", tags=["mentors"])

# Global Error Middleware
from starlette.exceptions import HTTPException as StarletteHTTPException

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=getattr(exc, "headers", None) or {},
        )
    logger.error(f"Global Error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"message": "An unexpected error occurred. Please try again later.", "detail": str(exc)},
    )

@app.get("/health", tags=["System"])
async def health_check():
    """Basic health check endpoint"""
    return {"status": "ok", "project": settings.PROJECT_NAME, "version": settings.VERSION}

# Serve Frontend Static Files & SPA Fallback
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import HTTPException

static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    assets_dir = os.path.join(static_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path in ["health", "docs", "redoc", "openapi.json"]:
            raise HTTPException(status_code=404, detail="Not Found")
        
        file_path = os.path.join(static_dir, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(static_dir, "index.html"))
else:
    @app.get("/", tags=["System"])
    def root():
        return {
            "message": "EduMetrics ML Backend API is live and operational!",
            "status": "online",
            "documentation": "/docs",
            "health": "/health",
            "version": settings.VERSION,
        }
