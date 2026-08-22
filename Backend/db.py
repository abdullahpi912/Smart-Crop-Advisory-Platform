import os
import logging
import mysql.connector
from mysql.connector import pooling
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path=env_path)

logger = logging.getLogger("agrisense.db")

_pool = None


def _init_pool():
    """Initializes the MySQL connection pool from environment variables."""
    global _pool

    db_password = os.environ.get('DB_PASSWORD')
    if db_password is None:
        raise RuntimeError("DB_PASSWORD environment variable is not set. Please configure it in your environment or .env file.")

    pool_size = int(os.environ.get('DB_POOL_SIZE', 5))
    host = os.environ.get('DB_HOST', 'localhost')
    port = int(os.environ.get('DB_PORT', 3306))
    user = os.environ.get('DB_USER', 'root')
    database = os.environ.get('DB_NAME', 'agrisense_db')

    logger.info("Initializing MySQL connection pool (size=%d, host=%s, port=%d, user=%s, db=%s)",
                pool_size, host, port, user, database)

    _pool = pooling.MySQLConnectionPool(
        pool_name="agrisense_pool",
        pool_size=pool_size,
        pool_reset_session=True,
        host=host,
        port=port,
        user=user,
        password=db_password,
        database=database,
        charset='utf8mb4'
    )
    return _pool


def get_connection():
    """Retrieves and returns an active MySQL connection from the connection pool."""
    global _pool

    if _pool is None:
        _pool = _init_pool()

    try:
        return _pool.get_connection()
    except Exception as e:
        logger.error("Failed to acquire connection from pool: %s", e)
        raise
