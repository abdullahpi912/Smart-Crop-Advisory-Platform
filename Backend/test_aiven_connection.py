"""
Cropling - Aiven MySQL Connection & SSL Verification Script
Tests database round-trip with and without DB_SSL_CA.
"""
import os
import sys
from pathlib import Path

# Add Backend to path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from db import get_connection, _init_pool
from app import app


def test_direct_db():
    print("\n--- [1/2] Testing Direct Database Connection & Queries ---")
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Test basic connection & version
        cursor.execute("SELECT VERSION() AS mysql_version, DATABASE() AS current_db, USER() AS auth_user;")
        info = cursor.fetchone()
        print(f"  [+] Connected successfully!")
        print(f"  [+] MySQL Version: {info.get('mysql_version')}")
        print(f"  [+] Active Database: {info.get('current_db')}")
        print(f"  [+] Authenticated User: {info.get('auth_user')}")

        # Test advisory_logs table query
        cursor.execute("SELECT COUNT(*) AS total_logs FROM advisory_logs;")
        log_count = cursor.fetchone()
        print(f"  [+] advisory_logs count: {log_count.get('total_logs')}")

        cursor.close()
        conn.close()
        return True, None
    except Exception as e:
        print(f"  [-] Connection Failed: {e}")
        return False, str(e)


def test_flask_health_and_routes():
    print("\n--- [2/3] Testing Flask /api/health Endpoint ---")
    try:
        client = app.test_client()
        response = client.get('/api/health')
        data = response.get_json()
        print(f"  [+] Health HTTP Status: {response.status_code}")
        print(f"  [+] Response payload: {data}")
        health_ok = response.status_code == 200 and data.get('database') == 'connected'
    except Exception as e:
        print(f"  [-] Health Check Exception: {e}")
        return False, str(e)

    print("\n--- [3/3] Testing API Database Read & Seed Verification ---")
    try:
        response = client.get('/api/logs')
        data = response.get_json()
        print(f"  [+] /api/logs Status: {response.status_code}")
        print(f"  [+] Total advisory logs returned: {data.get('total', 0)}")
        return health_ok and response.status_code == 200, data
    except Exception as e:
        print(f"  [-] Logs API Exception: {e}")
        return False, str(e)


if __name__ == '__main__':
    print("==================================================")
    print("Cropling Aiven MySQL Verification Test")
    print(f"Target Host: {os.environ.get('DB_HOST')}:{os.environ.get('DB_PORT')}")
    print(f"DB User: {os.environ.get('DB_USER')}")
    print(f"DB Name: {os.environ.get('DB_NAME')}")
    print(f"DB_SSL_CA: {os.environ.get('DB_SSL_CA', '(unset)')}")
    print(f"DB_SSL_DISABLED: {os.environ.get('DB_SSL_DISABLED', '(unset)')}")
    print("==================================================")

    db_ok, db_err = test_direct_db()
    api_ok, api_data = test_flask_health_and_routes()

    print("\n==================================================")
    if db_ok and api_ok:
        print("RESULT: ALL TESTS PASSED SUCCESSFULLY!")
    else:
        print("RESULT: VERIFICATION ENCOUNTERED ISSUES")
    print("==================================================")
