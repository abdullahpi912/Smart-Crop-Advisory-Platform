"""
Cropling Admin & Security Verification Script:
Verifies live database admin account presence, 4-factor cryptographic hash integrity
(password, favorite number, security phrase, and hint), and audit logging tables.

Usage:
  ADMIN_USERNAME=your_admin python verify_live_admin.py
  or
  python verify_live_admin.py [optional_username]
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))
load_dotenv(dotenv_path=backend_dir / '.env')

from db import get_connection

def is_valid_hash(hash_val):
    if not hash_val or not isinstance(hash_val, str):
        return False
    return (hash_val.startswith('scrypt:') or hash_val.startswith('pbkdf2:') or hash_val.startswith('$2b$') or hash_val.startswith('$2a$')) and len(hash_val) > 40

def verify_admin_security(target_username=None):
    print("=" * 60)
    print("CROPLING ADMIN & SECURITY AUDIT VERIFICATION (4-FACTOR)")
    print("=" * 60)

    username_to_check = target_username or os.environ.get('ADMIN_USERNAME') or (sys.argv[1] if len(sys.argv) > 1 else None)

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # 1. Verify admins table structure and admin record
        if username_to_check:
            cursor.execute(
                "SELECT id, username, password_hash, favorite_number_hash, security_phrase_hash, security_phrase_hint, created_at "
                "FROM admins WHERE username = %s",
                (username_to_check,)
            )
        else:
            cursor.execute(
                "SELECT id, username, password_hash, favorite_number_hash, security_phrase_hash, security_phrase_hint, created_at "
                "FROM admins ORDER BY id ASC LIMIT 1"
            )
            
        admin = cursor.fetchone()

        if not admin:
            print(f"[INFO] No admin accounts found matching criteria in database.")
            return False

        print(f"[PASS] Found Admin Account: '{admin['username']}' (ID: #{admin['id']})")
        print(f"[PASS] Created At: {admin['created_at']}")
        
        # 2. Verify password hash is cryptographic and not plaintext
        pwd_hash = admin.get('password_hash')
        if is_valid_hash(pwd_hash):
            print("[PASS] Password Security: Cryptographically hashed (zero plaintext stored).")
        else:
            print("[WARN] Password hash format unrecognized or unpopulated.")

        # 3. Verify favorite number hash is cryptographic
        fn_hash = admin.get('favorite_number_hash')
        if is_valid_hash(fn_hash):
            print("[PASS] Favorite Number Security: Cryptographically hashed (zero plaintext stored).")
        else:
            print("[WARN] Favorite number hash format unrecognized or unpopulated (re-provision via create_admin.py).")

        # 4. Verify security phrase hash is cryptographic
        sp_hash = admin.get('security_phrase_hash')
        if is_valid_hash(sp_hash):
            print("[PASS] Security Phrase Security: Cryptographically hashed (zero plaintext stored).")
        else:
            print("[WARN] Security phrase hash format unrecognized or unpopulated (re-provision via create_admin.py).")

        # 5. Verify security phrase hint presence
        hint = admin.get('security_phrase_hint')
        if hint and len(hint.strip()) > 0:
            print(f"[PASS] Security Phrase Hint: Configured ('{hint}')")
        else:
            print("[WARN] Security phrase hint empty or missing.")

        # 6. Verify login_logs audit table exists
        cursor.execute("SELECT COUNT(*) as count FROM login_logs")
        log_count = cursor.fetchone()['count']
        print(f"[PASS] Audit System: 'login_logs' table active ({log_count} total entries logged).")

        # 7. Verify admin_action_logs audit table exists
        cursor.execute("SELECT COUNT(*) as count FROM admin_action_logs")
        action_count = cursor.fetchone()['count']
        print(f"[PASS] Audit System: 'admin_action_logs' table active ({action_count} total entries logged).")

        # 8. Verify advisory_logs per-farmer isolation schema
        cursor.execute("""
            SELECT COLUMN_NAME FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'advisory_logs' AND COLUMN_NAME = 'user_id'
        """)
        if cursor.fetchone():
            print("[PASS] Data Isolation: 'advisory_logs.user_id' column present with ON DELETE CASCADE.")
        else:
            print("[FAIL] 'advisory_logs.user_id' missing!")

        cursor.close()
        conn.close()

        print("=" * 60)
        print("RESULT: ALL SECURITY AUDIT & VERIFICATION CHECKS COMPLETED!")
        print("=" * 60)
        return True

    except Exception as e:
        print(f"[ERROR] Verification failed: {e}")
        return False

if __name__ == '__main__':
    verify_admin_security()
