from psycopg.conninfo import make_conninfo
from psycopg_pool import AsyncConnectionPool

from core.config import DatabaseSettings


def create_database_pool(settings: DatabaseSettings) -> AsyncConnectionPool:
    return AsyncConnectionPool(
        conninfo=make_conninfo(
            host=settings.host,
            port=settings.port,
            dbname=settings.name,
            user=settings.user,
            password=settings.password.get_secret_value(),
            connect_timeout=3,
            options="-c statement_timeout=3000",
        ),
        min_size=0,
        max_size=5,
        timeout=3,
        open=False,
    )
