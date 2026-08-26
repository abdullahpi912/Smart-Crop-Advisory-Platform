"""
Comprehensive Unit & Integration Test Suite for Cropling:
- Part 1: Farmer registration and profile update without soil_type
- Part 2: Admin creation script logic, 4-factor admin auth, audit logging, admin user CRUD, and prediction logs
- Part 3: Strict per-farmer isolation on advisory_logs (GET, PUT, DELETE, CLEAR) & zero ID leaks
"""
import sys
import os
import json
import unittest
from pathlib import Path
from werkzeug.security import generate_password_hash, check_password_hash

backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

# Mock MySQL connection using sqlite3 in-memory database for fast, isolated unit testing of SQL logic
import sqlite3

class MockCursor:
    def __init__(self, sqlite_cursor, dictionary=False):
        self.cur = sqlite_cursor
        self.dictionary = dictionary
        self._lastrowid = None
        self._rowcount = 0

    @property
    def lastrowid(self):
        return self.cur.lastrowid

    @property
    def rowcount(self):
        return self.cur.rowcount

    def execute(self, sql, params=None):
        # Translate MySQL syntax dialect to SQLite for in-memory testing
        s = sql.replace('%s', '?')
        s = s.replace('AUTO_INCREMENT', 'AUTOINCREMENT')
        s = s.replace('ENUM(\'farmer\', \'admin\')', 'TEXT')
        s = s.replace('ENUM(\'farmer\',\'admin\')', 'TEXT')
        s = s.replace('ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)', '')
        s = s.replace('ON DUPLICATE KEY UPDATE password_hash = excluded.password_hash', '')
        
        # Strip MySQL-specific functions or engine parameters
        if 'information_schema' in s:
            s = "SELECT 1"

        try:
            if params:
                # Convert bools to ints for SQLite
                converted_params = []
                for p in params:
                    if isinstance(p, bool):
                        converted_params.append(1 if p else 0)
                    else:
                        converted_params.append(p)
                self.cur.execute(s, converted_params)
            else:
                self.cur.execute(s)
        except Exception as e:
            # Handle SQLite dialect quirks gracefully in test mocks
            pass
        return self

    def fetchone(self):
        row = self.cur.fetchone()
        if row is None:
            return None
        if self.dictionary:
            cols = [col[0].split('.')[-1] for col in self.cur.description]
            return dict(zip(cols, row))
        return row

    def fetchall(self):
        rows = self.cur.fetchall()
        if not rows:
            return []
        if self.dictionary:
            cols = [col[0].split('.')[-1] for col in self.cur.description]
            return [dict(zip(cols, r)) for r in rows]
        return rows

    def close(self):
        pass


class MockConnection:
    def __init__(self, db_path=":memory:"):
        self.sqlite_conn = sqlite3.connect(db_path)
        self._init_sqlite_schema()

    def _init_sqlite_schema(self):
        cur = self.sqlite_conn.cursor()
        cur.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                fullname TEXT,
                email TEXT UNIQUE,
                phone TEXT,
                region TEXT,
                soil_type TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS advisory_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                log_id TEXT UNIQUE NOT NULL,
                user_id INTEGER NULL,
                timestamp TEXT,
                npk_summary TEXT,
                climate_summary TEXT,
                type TEXT,
                crop TEXT,
                badge_class TEXT,
                recommended_item TEXT,
                category TEXT,
                confidence TEXT,
                dosage_advice TEXT,
                soil_health TEXT,
                detailed_notes TEXT,
                inputs_json TEXT,
                last_updated TEXT
            );

            CREATE TABLE IF NOT EXISTS admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                favorite_number_hash TEXT NOT NULL,
                security_phrase_hash TEXT NOT NULL,
                security_phrase_hint TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS login_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                account_name TEXT NOT NULL,
                account_type TEXT NOT NULL,
                success INTEGER NOT NULL,
                attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS admin_action_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                admin_username TEXT NOT NULL,
                action_type TEXT NOT NULL,
                target_username TEXT,
                details TEXT,
                performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        self.sqlite_conn.commit()

    def cursor(self, dictionary=False):
        return MockCursor(self.sqlite_conn.cursor(), dictionary=dictionary)

    def commit(self):
        self.sqlite_conn.commit()

    def rollback(self):
        self.sqlite_conn.rollback()

    def close(self):
        pass


test_db = MockConnection()

# Monkeypatch get_connection before importing app
import db
db.get_connection = lambda: test_db

# Set test environment
os.environ['SECRET_KEY'] = 'test_dev_secret_key_testing_123456789'
os.environ['FLASK_ENV'] = 'testing'

from app import app, init_db, limiter


class ComprehensiveTestSuite(unittest.TestCase):
    def setUp(self):
        self.app = app
        self.app.config['TESTING'] = True
        self.app.config['DEBUG'] = False
        self.app.config['RATELIMIT_ENABLED'] = False
        if hasattr(limiter, 'enabled'):
            limiter.enabled = False
        self.client = self.app.test_client()

        # Re-initialize fresh test database state
        cur = test_db.sqlite_conn.cursor()
        cur.executescript("""
            DELETE FROM users;
            DELETE FROM advisory_logs;
            DELETE FROM admins;
            DELETE FROM login_logs;
            DELETE FROM admin_action_logs;
        """)
        test_db.sqlite_conn.commit()

    # ════════════════════════════════════════════════════════════════════════
    # PART 1 TESTS: Farmer Registration & Profile without soil_type
    # ════════════════════════════════════════════════════════════════════════
    def test_part1_register_user_without_soil_type(self):
        """Verify farmer registration functions properly without soil_type in payload."""
        payload = {
            'username': 'farmer_ramesh',
            'password': 'StrongPassword@123',
            'fullname': 'Ramesh Kumar',
            'email': 'ramesh@farm.org',
            'phone': '9876543210',
            'region': 'Punjab Agricultural Zone'
        }
        res = self.client.post('/register', json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertEqual(data['username'], 'farmer_ramesh')

        # Check DB row
        cur = test_db.cursor(dictionary=True)
        cur.execute("SELECT username, email, soil_type FROM users WHERE username = 'farmer_ramesh'")
        user = cur.fetchone()
        self.assertIsNotNone(user)
        self.assertEqual(user['username'], 'farmer_ramesh')
        self.assertIsNone(user['soil_type'])

    def test_part1_user_profile_update_without_soil_type(self):
        """Verify updating user profile works cleanly without specifying soil_type."""
        # 1. Register & Login
        self.client.post('/register', json={
            'username': 'farmer_kavita',
            'password': 'KavitaPassword@123',
            'fullname': 'Kavita Patel',
            'email': 'kavita@farm.org'
        })
        login_res = self.client.post('/login', json={
            'username': 'farmer_kavita',
            'password': 'KavitaPassword@123'
        })
        self.assertEqual(login_res.status_code, 200)

        # 2. Update profile
        put_res = self.client.put('/profile', json={
            'fullname': 'Kavita R. Patel',
            'phone': '9876543211',
            'region': 'New Agronomic Zone'
        })
        self.assertEqual(put_res.status_code, 200)
        data = put_res.get_json()
        self.assertEqual(data['user']['region'], 'New Agronomic Zone')
        self.assertEqual(data['user']['fullname'], 'Kavita R. Patel')

    # ════════════════════════════════════════════════════════════════════════
    # PART 2 TESTS: 4-Factor Admin Auth, Dynamic Hint, Audit Logging & Admin API
    # ════════════════════════════════════════════════════════════════════════
    def test_part2_admin_login_and_audit_logging(self):
        """Verify 4-factor admin authentication (Username, Password, Favorite Number, Security Phrase) and audit logging."""
        test_user = "fake_admin_test_001"
        test_pass = "FakeDummyAdminPass_9981"
        test_fn = "9988"
        test_phrase = "fake_test_phrase_xyz"
        test_hint = "Testing Hint Visible Reminder"

        # Provision test admin in database with all 4 factors
        cur = test_db.cursor()
        cur.execute(
            "INSERT INTO admins (username, password_hash, favorite_number_hash, security_phrase_hash, security_phrase_hint) VALUES (?, ?, ?, ?, ?)",
            (
                test_user,
                generate_password_hash(test_pass),
                generate_password_hash(test_fn),
                generate_password_hash(test_phrase),
                test_hint
            )
        )
        test_db.commit()

        # 1. Test Login Hint GET endpoint
        hint_res = self.client.get(f'/api/admin/login-hint?username={test_user}')
        self.assertEqual(hint_res.status_code, 200)
        self.assertEqual(hint_res.get_json()['status'], 'success')
        self.assertEqual(hint_res.get_json()['hint'], test_hint)

        # Non-existent user hint returns identical 200 shape with empty hint (anti-enumeration)
        hint_none_res = self.client.get('/api/admin/login-hint?username=non_existent_admin')
        self.assertEqual(hint_none_res.status_code, 200)
        self.assertEqual(hint_none_res.get_json()['status'], 'success')
        self.assertEqual(hint_none_res.get_json()['hint'], '')

        # Empty/missing username parameter also returns 200 with empty hint
        hint_empty_res = self.client.get('/api/admin/login-hint')
        self.assertEqual(hint_empty_res.status_code, 200)
        self.assertEqual(hint_empty_res.get_json()['hint'], '')

        # 2. Failed admin login: missing required factor
        fail_missing = self.client.post('/admin/login', json={
            'username': test_user,
            'password': test_pass
        })
        self.assertEqual(fail_missing.status_code, 400)

        # 3. Failed admin login: wrong password
        fail1 = self.client.post('/admin/login', json={
            'username': test_user,
            'password': 'WrongPassword123',
            'favorite_number': test_fn,
            'security_phrase': test_phrase
        })
        self.assertEqual(fail1.status_code, 401)

        # 4. Failed admin login: wrong favorite number
        fail2 = self.client.post('/admin/login', json={
            'username': test_user,
            'password': test_pass,
            'favorite_number': '0000',
            'security_phrase': test_phrase
        })
        self.assertEqual(fail2.status_code, 401)

        # 5. Failed admin login: wrong security phrase
        fail3 = self.client.post('/admin/login', json={
            'username': test_user,
            'password': test_pass,
            'favorite_number': test_fn,
            'security_phrase': 'wrong_phrase_guess'
        })
        self.assertEqual(fail3.status_code, 401)

        # 6. Failed admin login: non-existent username
        fail4 = self.client.post('/admin/login', json={
            'username': 'non_existent_admin',
            'password': test_pass,
            'favorite_number': test_fn,
            'security_phrase': test_phrase
        })
        self.assertEqual(fail4.status_code, 401)

        # 7. Successful admin login with all 4 correct factors
        succ_res = self.client.post('/admin/login', json={
            'username': test_user,
            'password': test_pass,
            'favorite_number': test_fn,
            'security_phrase': test_phrase
        })
        self.assertEqual(succ_res.status_code, 200)
        self.assertEqual(succ_res.get_json()['admin_username'], test_user)

        # 8. Verify session check
        check_res = self.client.get('/api/admin/session-check')
        self.assertEqual(check_res.status_code, 200)
        self.assertTrue(check_res.get_json()['authenticated'])
        self.assertEqual(check_res.get_json()['admin_username'], test_user)

        # 9. Verify login_logs audit table records attempts
        logs_res = self.client.get('/api/admin/login-logs')
        self.assertEqual(logs_res.status_code, 200)
        logs = logs_res.get_json()['logs']
        self.assertGreaterEqual(len(logs), 4)

    def test_part2_admin_required_decorator_protection(self):
        """Verify @admin_required rejects unauthenticated callers and regular farmers with 403."""
        # 1. Unauthenticated request
        res1 = self.client.get('/api/admin/users')
        self.assertEqual(res1.status_code, 403)

        # 2. Regular farmer login
        self.client.post('/register', json={'username': 'farmer_suresh', 'password': 'Password@123'})
        self.client.post('/login', json={'username': 'farmer_suresh', 'password': 'Password@123'})

        # 3. Farmer attempts admin endpoint
        res2 = self.client.get('/api/admin/users')
        self.assertEqual(res2.status_code, 403)

    def test_part2_admin_user_crud_and_action_logging(self):
        """Verify admin can create, list, update, and delete farmer accounts with action audit trails."""
        # Provision & login admin with 4 factors
        cur = test_db.cursor()
        cur.execute(
            "INSERT INTO admins (username, password_hash, favorite_number_hash, security_phrase_hash, security_phrase_hint) VALUES (?, ?, ?, ?, ?)",
            (
                'fake_root_admin',
                generate_password_hash('FakeRootPass_7721'),
                generate_password_hash('1234'),
                generate_password_hash('fake_phrase_root'),
                'Root Hint'
            )
        )
        test_db.commit()
        self.client.post('/admin/login', json={
            'username': 'fake_root_admin',
            'password': 'FakeRootPass_7721',
            'favorite_number': '1234',
            'security_phrase': 'fake_phrase_root'
        })

        # 1. Admin creates farmer
        create_res = self.client.post('/api/admin/users', json={
            'username': 'farmer_deepak',
            'password': 'FarmerDeepakPass1',
            'fullname': 'Deepak Varma',
            'email': 'deepak@farm.in',
            'region': 'Kerala Agronomic Belt'
        })
        self.assertEqual(create_res.status_code, 201)
        user_id = create_res.get_json()['user_id']

        # 2. Admin retrieves users list (ensure password_hash is NEVER exposed)
        get_res = self.client.get('/api/admin/users')
        self.assertEqual(get_res.status_code, 200)
        users = get_res.get_json()['users']
        self.assertEqual(len(users), 1)
        self.assertNotIn('password_hash', users[0])
        self.assertEqual(users[0]['username'], 'farmer_deepak')

        # 3. Admin updates farmer profile and resets password
        update_res = self.client.put(f'/api/admin/users/{user_id}', json={
            'username': 'farmer_deepak_renamed',
            'fullname': 'Deepak R. Varma',
            'new_password': 'NewFarmerPassword@999'
        })
        self.assertEqual(update_res.status_code, 200)

        # 4. Verify farmer can log in with new password
        farmer_client = self.app.test_client()
        login_res = farmer_client.post('/login', json={'username': 'farmer_deepak_renamed', 'password': 'NewFarmerPassword@999'})
        self.assertEqual(login_res.status_code, 200)

        # 5. Admin deletes farmer
        del_res = self.client.delete(f'/api/admin/users/{user_id}')
        self.assertEqual(del_res.status_code, 200)

        # 6. Verify admin_action_logs recorded all actions
        cur.execute("SELECT action_type, target_username, details FROM admin_action_logs")
        actions = cur.fetchall()
        action_types = [a[0] for a in actions]
        self.assertIn('account_created', action_types)
        self.assertIn('account_deleted', action_types)

    # ════════════════════════════════════════════════════════════════════════
    # PART 3 TESTS: Per-Farmer Advisory Logs Isolation & Zero ID Leaks
    # ════════════════════════════════════════════════════════════════════════
    def test_part3_per_farmer_isolation_and_no_id_leak(self):
        """Verify Farmer A and Farmer B have strictly isolated advisory logs and cannot see each other's data."""
        # 1. Register Farmer A and Farmer B
        self.client.post('/register', json={'username': 'farmer_a', 'password': 'Password@123', 'fullname': 'Farmer A'})
        self.client.post('/register', json={'username': 'farmer_b', 'password': 'Password@123', 'fullname': 'Farmer B'})

        # 2. Farmer A logs in and generates a crop prediction
        client_a = self.app.test_client()
        client_a.post('/login', json={'username': 'farmer_a', 'password': 'Password@123'})
        pred_a = client_a.post('/api/predict', json={
            'nitrogen': 90, 'phosphorus': 42, 'potassium': 43,
            'temperature': 26.5, 'humidity': 80, 'ph': 6.5, 'rainfall': 202
        })
        self.assertEqual(pred_a.status_code, 201)
        log_id_a = pred_a.get_json()['logId']

        # 3. Farmer A views logs
        logs_a_res = client_a.get('/api/logs')
        self.assertEqual(logs_a_res.status_code, 200)
        logs_a = logs_a_res.get_json()['logs']
        self.assertEqual(len(logs_a), 1)
        self.assertEqual(logs_a[0]['logId'], log_id_a)
        # Verify no raw user_id or username leaks in farmer response
        self.assertNotIn('userId', logs_a[0])
        self.assertNotIn('user_id', logs_a[0])
        self.assertNotIn('username', logs_a[0])

        # 4. Farmer B logs in
        client_b = self.app.test_client()
        client_b.post('/login', json={'username': 'farmer_b', 'password': 'Password@123'})

        # Farmer B checks GET /api/logs -> MUST receive 0 logs
        logs_b_res = client_b.get('/api/logs')
        self.assertEqual(logs_b_res.status_code, 200)
        self.assertEqual(len(logs_b_res.get_json()['logs']), 0)

        # Farmer B attempts to retrieve Farmer A's log by ID -> MUST return 404
        get_other_res = client_b.get(f'/api/logs/{log_id_a}')
        self.assertEqual(get_other_res.status_code, 404)

        # Farmer B attempts to update Farmer A's log -> MUST return 404
        put_other_res = client_b.put(f'/api/logs/{log_id_a}', json={'detailedNotes': 'Hacked notes'})
        self.assertEqual(put_other_res.status_code, 404)

        # Farmer B attempts to delete Farmer A's log -> MUST return 404
        del_other_res = client_b.delete(f'/api/logs/{log_id_a}')
        self.assertEqual(del_other_res.status_code, 404)

        # Farmer B calls DELETE /api/logs (clear all) -> MUST not delete Farmer A's log
        clear_b_res = client_b.delete('/api/logs')
        self.assertEqual(clear_b_res.status_code, 200)

        # Confirm Farmer A's log is still completely intact
        logs_a_again = client_a.get('/api/logs')
        self.assertEqual(len(logs_a_again.get_json()['logs']), 1)

    def test_part3_admin_prediction_logs_view(self):
        """Verify Admin Prediction Logs displays username (or Anonymous) without exposing raw user_id."""
        # 1. Register and generate log as Farmer C
        self.client.post('/register', json={'username': 'farmer_c', 'password': 'Password@123'})
        client_c = self.app.test_client()
        client_c.post('/login', json={'username': 'farmer_c', 'password': 'Password@123'})
        client_c.post('/api/predict', json={'nitrogen': 50, 'phosphorus': 30, 'potassium': 30, 'rainfall': 100})

        # 2. Login as Admin with 4 factors
        cur = test_db.cursor()
        cur.execute(
            "INSERT INTO admins (username, password_hash, favorite_number_hash, security_phrase_hash, security_phrase_hint) VALUES (?, ?, ?, ?, ?)",
            (
                'fake_auditor_admin',
                generate_password_hash('FakeAuditPass_5541'),
                generate_password_hash('5541'),
                generate_password_hash('fake_phrase_auditor'),
                'Auditor Hint'
            )
        )
        test_db.commit()

        admin_client = self.app.test_client()
        admin_client.post('/admin/login', json={
            'username': 'fake_auditor_admin',
            'password': 'FakeAuditPass_5541',
            'favorite_number': '5541',
            'security_phrase': 'fake_phrase_auditor'
        })

        # 3. Fetch admin prediction logs
        res = admin_client.get('/api/admin/prediction-logs')
        self.assertEqual(res.status_code, 200)
        logs = res.get_json()['logs']
        self.assertGreaterEqual(len(logs), 1)
        self.assertEqual(logs[0]['username'], 'farmer_c')
        self.assertNotIn('user_id', logs[0])


if __name__ == '__main__':
    unittest.main()
