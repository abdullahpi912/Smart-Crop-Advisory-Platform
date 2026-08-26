import os
import logging
import mysql.connector
from mysql.connector import pooling
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path=env_path)

logger = logging.getLogger("cropling.db")

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

    ssl_ca = os.environ.get('DB_SSL_CA')
    ssl_disabled = os.environ.get('DB_SSL_DISABLED', 'false').lower() in ('true', '1', 't')

    logger.info("Initializing MySQL connection pool (size=%d, host=%s, port=%d, user=%s, db=%s, ssl_ca=%s, ssl_disabled=%s)",
                pool_size, host, port, user, database, ssl_ca, ssl_disabled)

    pool_kwargs = {
        'pool_name': "cropling_pool",
        'pool_size': pool_size,
        'pool_reset_session': True,
        'host': host,
        'port': port,
        'user': user,
        'password': db_password,
        'database': database,
        'charset': 'utf8mb4'
    }

    if ssl_ca and not ssl_disabled:
        ca_path = Path(ssl_ca)
        if not ca_path.is_absolute():
            backend_dir = Path(__file__).resolve().parent
            if (backend_dir / ca_path).exists():
                ca_path = (backend_dir / ca_path).resolve()
            elif ca_path.exists():
                ca_path = ca_path.resolve()
            else:
                ca_path = (backend_dir / ca_path).resolve()

        if not ca_path.exists():
            logger.warning("DB_SSL_CA file does not exist at resolved path: %s", ca_path)

        pool_kwargs['ssl_ca'] = str(ca_path)
        pool_kwargs['ssl_verify_cert'] = True
        logger.info("Enabling MySQL SSL with CA cert: %s", ca_path)
    elif ssl_disabled:
        pool_kwargs['ssl_disabled'] = True
        logger.info("MySQL SSL explicitly disabled")

    _pool = pooling.MySQLConnectionPool(**pool_kwargs)
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
