import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()


def get_connection():
    """Opens and returns a new MySQL connection using env-configured credentials."""
    db_password = os.environ.get('DB_PASSWORD')
    if db_password is None:
        raise RuntimeError("DB_PASSWORD environment variable is not set. Please configure it in your environment or .env file.")

    return mysql.connector.connect(
        host=os.environ.get('DB_HOST', 'localhost'),
        user=os.environ.get('DB_USER', 'root'),
        password=db_password,
        database=os.environ.get('DB_NAME', 'agrisense_db'),
        charset='utf8mb4'
    )

