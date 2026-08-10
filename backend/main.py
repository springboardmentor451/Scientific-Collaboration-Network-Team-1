import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from app.core import (
    Config,
    engine,
    get_config,
    logging_config,  # noqa: F401
)
from app.core.domains import load_domains
from app.routes import router
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from granian import Granian
from granian.constants import Interfaces

logger: logging.Logger = logging.getLogger(__name__)
config: type[Config] = get_config()
config.validate()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info("starting up Research Management Platform")
    await load_domains()
    yield
    logger.info("shutting down")
    await engine.dispose()


app = FastAPI(
    title="Scientific Collaboration Network Analyzer",
    version="1.0.0",
    lifespan=lifespan,
)
app.include_router(router, prefix="/api")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, e: Exception) -> JSONResponse:
    logger.error(f"Unhandled exception: {e}")
    return JSONResponse(status_code=500, content={"detail": "internal server error"})


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


if __name__ == "__main__":
    Granian(
        target="main:app",
        address="0.0.0.0",
        port=8000,
        interface=Interfaces.ASGI,
        reload=True,
    ).serve()
