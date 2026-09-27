from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes.chat import router as chat_router
from app.api.routes.health import router as health_router
from app.core.config import DatabaseSettings, LoggingSettings
from app.core.database import create_database_pool
from app.core.logging import configure_logging, get_logger


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
app.include_router(chat_router)
app.include_router(health_router)
