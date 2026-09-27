from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from psycopg import Error
from psycopg_pool import PoolTimeout

from app.core.logging import get_logger


router = APIRouter()
logger = get_logger("api.health")


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "agent-backend"}


@router.get("/ready")
async def ready(request: Request) -> JSONResponse:
    try:
        async with request.app.state.database.connection() as connection:
            await connection.execute("SELECT 1")
    except (Error, PoolTimeout) as error:
        logger.warning("Readiness check failed: %s", type(error).__name__)
        return JSONResponse({"status": "unavailable", "service": "agent-backend"}, status_code=503)
    return JSONResponse({"status": "ok", "service": "agent-backend"})
