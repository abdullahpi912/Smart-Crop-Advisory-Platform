import os
import mysql.connector


def get_connection():
    """Opens and returns a new MySQL connection using env-configured credentials."""
    return mysql.connector.connect(
        host=os.environ.get('DB_HOST', 'localhost'),
        user=os.environ.get('DB_USER', 'root'),
        password=os.environ.get('DB_PASSWORD', 'Abdullah@2007'),
        database=os.environ.get('DB_NAME', 'agrisense_db')
    )
