from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.rate_limit import limiter
from app.middlewares.cors import setup_cors
from app.middlewares.error_handler import setup_error_handlers
from app.middlewares.logging_middleware import LoggingMiddleware

settings = get_settings()

app = FastAPI(title="New Generation API", version="1.0.0")

app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    from fastapi.responses import JSONResponse

    return JSONResponse(
        status_code=429,
        content={
            "error": {
                "code": "rate_limited",
                "message": "Trop de tentatives, merci de réessayer plus tard.",
            }
        },
    )


setup_cors(app)
app.add_middleware(LoggingMiddleware)
setup_error_handlers(app)

app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

app.include_router(api_router)


@app.get("/health")
def health_check() -> dict:
    return {"data": {"status": "ok"}}
