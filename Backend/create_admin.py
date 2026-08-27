"""
Cropling - Standalone Admin Account Provisioning Script
Creates or updates administrative user credentials in the 'admins' table
with 4-factor hashed authentication (password, favorite number, security phrase)
and a publicly visible security phrase hint.

Usage:
  1. Interactive mode (prompts with hidden inputs):
     python create_admin.py

  2. Environment variable mode (uncomment in .env or pass via env):
     ADMIN_USERNAME=admin ADMIN_PASSWORD=secret ADMIN_FAVORITE_NUMBER=123 \
     ADMIN_SECURITY_PHRASE="phrase" ADMIN_SECURITY_PHRASE_HINT="hint" python create_admin.py
"""
import os
import sys
import getpass
from pathlib import Path
from dotenv import load_dotenv

# Ensure Backend directory is in path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

# Load .env
env_path = backend_dir / '.env'
load_dotenv(dotenv_path=env_path)

from db import get_connection
from werkzeug.security import generate_password_hash


def provision_admin():
    print("=" * 60)
    print("CROPLING SECURE ADMIN PROVISIONING (4-FACTOR AUTH)")
    print("=" * 60)

    # 1. Username (visible input)
    username = os.environ.get('ADMIN_USERNAME')
    if not username:
        while True:
            try:
                username = input("Enter admin username: ").strip()
            except (KeyboardInterrupt, EOFError):
                print("\nAborted.")
                sys.exit(1)
            if username:
                break
            print("Error: Admin username cannot be empty. Please try again.\n", file=sys.stderr)

    # 2. Master Password (hidden input)
    password = os.environ.get('ADMIN_PASSWORD')
    if not password:
        while True:
            try:
                password = getpass.getpass("Enter admin password (hidden): ")
                confirm_pwd = getpass.getpass("Confirm admin password (hidden): ")
            except (KeyboardInterrupt, EOFError):
                print("\nAborted.")
                sys.exit(1)

            if not password:
                print("Error: Password cannot be empty. Please try again.\n", file=sys.stderr)
                continue
            if len(password) < 6:
                print("Error: Password must be at least 6 characters long. Please try again.\n", file=sys.stderr)
                continue
            if password != confirm_pwd:
                print("Error: Passwords do not match. Please try again.\n", file=sys.stderr)
                continue
            break

    # 3. Favorite Number (hidden input)
    favorite_number = os.environ.get('ADMIN_FAVORITE_NUMBER')
    if not favorite_number:
        while True:
            try:
                favorite_number = getpass.getpass("Enter admin favorite number (hidden): ").strip()
                confirm_fn = getpass.getpass("Confirm admin favorite number (hidden): ").strip()
            except (KeyboardInterrupt, EOFError):
                print("\nAborted.")
                sys.exit(1)

            if not favorite_number:
                print("Error: Favorite number cannot be empty. Please try again.\n", file=sys.stderr)
                continue
            if favorite_number != confirm_fn:
                print("Error: Favorite numbers do not match. Please try again.\n", file=sys.stderr)
                continue
            break

    # 4. Security Phrase (hidden input)
    security_phrase = os.environ.get('ADMIN_SECURITY_PHRASE')
    if not security_phrase:
        while True:
            try:
                security_phrase = getpass.getpass("Enter admin security phrase (hidden): ").strip()
                confirm_sp = getpass.getpass("Confirm admin security phrase (hidden): ").strip()
            except (KeyboardInterrupt, EOFError):
                print("\nAborted.")
                sys.exit(1)

            if not security_phrase:
                print("Error: Security phrase cannot be empty. Please try again.\n", file=sys.stderr)
                continue
            if security_phrase != confirm_sp:
                print("Error: Security phrases do not match. Please try again.\n", file=sys.stderr)
                continue
            break

    # 5. Security Phrase Hint (visible input)
    security_phrase_hint = os.environ.get('ADMIN_SECURITY_PHRASE_HINT')
    if not security_phrase_hint:
        while True:
            try:
                security_phrase_hint = input("Enter security phrase hint (visible reminder, e.g., 'Childhood pet'): ").strip()
            except (KeyboardInterrupt, EOFError):
                print("\nAborted.")
                sys.exit(1)

            if security_phrase_hint:
                break
            print("Error: Security phrase hint cannot be empty. Please try again.\n", file=sys.stderr)

    # Cryptographically hash secret factors individually
    password_hash = generate_password_hash(password)
    favorite_number_hash = generate_password_hash(favorite_number)
    security_phrase_hash = generate_password_hash(security_phrase)

    # Ensure admins table exists and insert / update credentials
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                favorite_number_hash VARCHAR(255) NOT NULL,
                security_phrase_hash VARCHAR(255) NOT NULL,
                security_phrase_hint VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        cursor.execute("""
            INSERT INTO admins (username, password_hash, favorite_number_hash, security_phrase_hash, security_phrase_hint)
            VALUES (%s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                password_hash = VALUES(password_hash),
                favorite_number_hash = VALUES(favorite_number_hash),
                security_phrase_hash = VALUES(security_phrase_hash),
                security_phrase_hint = VALUES(security_phrase_hint);
        """, (username, password_hash, favorite_number_hash, security_phrase_hash, security_phrase_hint))

        conn.commit()
        cursor.close()
        conn.close()

        print(f"\n[+] Success: Admin account '{username}' provisioned successfully in database.")

    except Exception as e:
        print(f"\n[-] Database Error: Failed to provision admin account ({e})", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    provision_admin()
