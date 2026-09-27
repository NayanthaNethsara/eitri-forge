from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from psycopg import Error
from psycopg_pool import PoolTimeout

from core.config import DatabaseSettings, LoggingSettings
from core.database import create_database_pool
from core.logging import configure_logging, get_logger


logger = get_logger("api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging(LoggingSettings().level)
    async with create_database_pool(DatabaseSettings()) as pool:
        app.state.database = pool
        logger.info("Agent backend started")
        yield
        logger.info("Agent backend stopped")


app = FastAPI(title="Eitri Forge Agent Backend", lifespan=lifespan)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "agent-backend"}


@app.get("/ready")
async def ready(request: Request) -> JSONResponse:
    try:
        async with request.app.state.database.connection() as connection:
            await connection.execute("SELECT 1")
    except (Error, PoolTimeout) as error:
        logger.warning("Readiness check failed: %s", type(error).__name__)
        return JSONResponse({"status": "unavailable", "service": "agent-backend"}, status_code=503)
    return JSONResponse({"status": "ok", "service": "agent-backend"})
