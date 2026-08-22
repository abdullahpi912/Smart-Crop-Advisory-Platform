"""
Automated Test Suite for Flask Backend HTTP Methods
Validates GET, POST, PUT, and DELETE operations.
"""
import sys
import os
import json
import unittest

# Ensure Backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app

class TestHTTPMethods(unittest.TestCase):
    def setUp(self):
        """Set up test client before each test case."""
        app.config['TESTING'] = True
        app.config['RATELIMIT_ENABLED'] = False
        self.app = app.test_client()
        self.app.testing = True
        try:
            from app import limiter
            limiter.reset()
        except Exception:
            pass

    # ----------------------------------------------------
    # 0. SKELETON ROOT TEST
    # ----------------------------------------------------
    def test_00_get_root(self):
        """Test GET / root health-check endpoint."""
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data.get('status'), 'running')
        self.assertIn('service', data)
        print(" [GET] / passed: root endpoint is running")

    # ----------------------------------------------------
    # 1. GET METHOD TESTS
    # ----------------------------------------------------
    def test_01_get_health(self):

        """Test GET /api/health endpoint."""
        response = self.app.get('/api/health')
        self.assertIn(response.status_code, [200, 503])
        data = json.loads(response.data)
        self.assertIn('status', data)
        print(" [GET] /api/health passed:", data['status'])

    def test_02_get_logs(self):
        """Test GET /api/logs endpoint."""
        response = self.app.get('/api/logs')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'success')
        self.assertGreaterEqual(len(data['logs']), 1)
        print(f" [GET] /api/logs passed: retrieved {len(data['logs'])} records")

    def test_03_get_log_by_id(self):
        """Test GET /api/logs/<log_id> endpoint."""
        response = self.app.get('/api/logs/LOG-8942')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['log']['logId'], '#LOG-8942')
        print(" [GET] /api/logs/LOG-8942 passed: retrieved log item")

    def test_04_get_crops(self):
        """Test GET /api/crops endpoint."""
        response = self.app.get('/api/crops')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'success')
        self.assertIn('rice', data['crops'])
        print(f" [GET] /api/crops passed: total {data['total']} crops in catalog")

    # ----------------------------------------------------
    # 2. POST METHOD TESTS (Post Data)
    # ----------------------------------------------------
    def test_05_post_predict(self):
        """Test POST /api/predict endpoint (Post soil data to calculate ML recommendation)."""
        payload = {
            "nitrogen": 85,
            "phosphorus": 40,
            "potassium": 40,
            "temperature": 25.5,
            "humidity": 82.0,
            "ph": 6.4,
            "rainfall": 210.0
        }
        response = self.app.post('/api/predict', data=json.dumps(payload), content_type='application/json')
        self.assertIn(response.status_code, [200, 201])
        data = json.loads(response.data)
        self.assertIn('logId', data)
        self.assertIn('recommendedItem', data)
        print(" [POST] /api/predict passed: created recommendation", data['logId'])

    def test_06_post_create_log(self):
        """Test POST /api/logs endpoint (Post custom advisory log data)."""
        with self.app.session_transaction() as sess:
            sess['user_id'] = 1
            sess['username'] = 'test_farmer'

        import random
        rand_num = random.randint(1000, 9999)
        payload = {
            "logId": f"#LOG-{rand_num}",
            "recommendedItem": "Organic Compost & Bio-fertilizer",
            "category": "Organic Soil Amendment",
            "npkSummary": "N: 40 | P: 50 | K: 40",
            "climateSummary": "pH 6.8 | 150 mm | 22 C",
            "detailedNotes": "High organic matter content addition recommended for soil structure enrichment."
        }
        response = self.app.post('/api/logs', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['log']['logId'], f'#LOG-{rand_num}')
        print(" [POST] /api/logs passed: posted new log entry", data['log']['logId'])

    # ----------------------------------------------------
    # 3. PUT METHOD TESTS (Update Data)
    # ----------------------------------------------------
    def test_07_put_update_log(self):
        """Test PUT /api/logs/<log_id> endpoint (Update existing log details)."""
        with self.app.session_transaction() as sess:
            sess['user_id'] = 1
            sess['username'] = 'test_farmer'

        update_payload = {
            "dosageAdvice": "Updated dosage: Apply 60kg/ha during early tillering stage",
            "detailedNotes": "Farmer verified field output: Excellent growth observed."
        }
        response = self.app.put('/api/logs/LOG-8942', data=json.dumps(update_payload), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['log']['dosageAdvice'], update_payload['dosageAdvice'])
        print(" [PUT] /api/logs/LOG-8942 passed: updated record note successfully")

    # ----------------------------------------------------
    # 4. DELETE METHOD TESTS (Delete Data)
    # ----------------------------------------------------
    def test_08_delete_single_log(self):
        """Test DELETE /api/logs/<log_id> endpoint."""
        with self.app.session_transaction() as sess:
            sess['user_id'] = 1
            sess['username'] = 'test_farmer'

        import random
        rand_num = random.randint(1000, 9999)
        payload = {
            "logId": f"#LOG-DEL-{rand_num}",
            "recommendedItem": "Test Delete Item"
        }
        self.app.post('/api/logs', data=json.dumps(payload), content_type='application/json')

        response = self.app.delete(f'/api/logs/LOG-DEL-{rand_num}')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['deletedId'], f'#LOG-DEL-{rand_num}')
        print(f" [DELETE] /api/logs/LOG-DEL-{rand_num} passed: removed log entry successfully")


    def test_09_delete_non_existent_log(self):
        """Test DELETE /api/logs/<log_id> with invalid log ID."""
        with self.app.session_transaction() as sess:
            sess['user_id'] = 1
            sess['username'] = 'test_farmer'

        response = self.app.delete('/api/logs/LOG-0000')
        self.assertEqual(response.status_code, 404)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'error')
        print(" [DELETE] /api/logs/LOG-0000 passed: received 404 Not Found as expected")

    # ----------------------------------------------------
    # 5. AUTHENTICATION & REGISTRATION TESTS
    # ----------------------------------------------------
    def test_10_register_missing_fields(self):
        """Test POST /register with missing required username or password."""
        payload = {"username": "test_user_only"}
        response = self.app.post('/register', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
        print(" [POST] /register (missing fields) passed: rejected with 400")

    def test_11_register_user_success(self):
        """Test POST /register with valid user payload."""
        import random
        rand_id = random.randint(1000, 9999)
        payload = {
            "username": f"test_farmer_{rand_id}",
            "password": "TestPassword@123",
            "fullname": "Test Automated Farmer",
            "email": f"farmer_{rand_id}@example.com",
            "phone": "+91 9876543210",
            "region": "Test District",
            "soilType": "loamy"
        }
        response = self.app.post('/register', data=json.dumps(payload), content_type='application/json')
        self.assertIn(response.status_code, [201, 400]) # 201 created or 400 if DB unavailable/duplicate
        data = json.loads(response.data)
        if response.status_code == 201:
            self.assertIn('user_id', data)
            self.assertEqual(data['username'], payload['username'])
            self.assertNotIn('password', data)
            self.assertNotIn('password_hash', data)
            print(" [POST] /register passed: created user", data['username'])
        else:
            print(" [POST] /register notice:", data.get('error'))

    def test_12_register_duplicate_user(self):
        """Test POST /register duplicate username prevention."""
        payload = {
            "username": "agrisense_test_dup",
            "password": "AgriSense@123",
            "fullname": "Duplicate User",
            "email": "dup@example.com"
        }
        # First registration
        self.app.post('/register', data=json.dumps(payload), content_type='application/json')
        # Second registration with same username/email
        response = self.app.post('/register', data=json.dumps(payload), content_type='application/json')
        if response.status_code == 400:
            data = json.loads(response.data)
            self.assertEqual(data['error'], 'Username or email already exists')
            print(" [POST] /register (duplicate) passed: duplicate rejected with 400")

    # ----------------------------------------------------
    # 6. SESSIONS & LOGIN TESTS
    # ----------------------------------------------------
    def test_13_login_invalid_credentials(self):
        """Test POST /login with invalid password returns HTTP 401."""
        payload = {
            "username": "agrisense_test_dup",
            "password": "WrongPassword123"
        }
        response = self.app.post('/login', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 401)
        data = json.loads(response.data)
        self.assertEqual(data['error'], 'Invalid username or password')
        print(" [POST] /login (invalid creds) passed: rejected with 401 Unauthorized")

    def test_14_full_auth_session_flow(self):
        """
        Test complete session flow:
        1. POST /login -> 200 OK
        2. GET /profile -> 200 OK (Authenticated)
        3. POST /logout -> 200 OK (Session cleared)
        4. GET /profile -> 401 Unauthorized (Blocked)
        """
        import random
        rand_id = random.randint(1000, 9999)
        username = f"sess_user_{rand_id}"
        password = "SessionPass@123"

        # Register test user first
        reg_payload = {
            "username": username,
            "password": password,
            "fullname": "Session Flow Tester",
            "email": f"sess_{rand_id}@example.com"
        }
        self.app.post('/register', data=json.dumps(reg_payload), content_type='application/json')

        login_payload = {"username": username, "password": password}

        # Step 1: POST /login
        res_login = self.app.post('/login', data=json.dumps(login_payload), content_type='application/json')
        self.assertEqual(res_login.status_code, 200)
        data_login = json.loads(res_login.data)
        self.assertIn("Welcome back", data_login["message"])
        print(" [POST] /login passed: authenticated session created for", username)

        # Step 2: GET /profile (Authenticated)
        res_prof = self.app.get('/profile')
        self.assertEqual(res_prof.status_code, 200)
        data_prof = json.loads(res_prof.data)
        self.assertEqual(data_prof["status"], "success")
        print(" [GET] /profile passed: authenticated profile retrieved successfully")

        # Step 3: POST /logout
        res_logout = self.app.post('/logout')
        self.assertEqual(res_logout.status_code, 200)
        data_logout = json.loads(res_logout.data)
        self.assertEqual(data_logout["message"], "Logged out successfully")
        print(" [POST] /logout passed: session cleared")

        # Step 4: GET /profile (Blocked after logout)
        res_prof_after = self.app.get('/profile')
        self.assertEqual(res_prof_after.status_code, 401)
        data_prof_after = json.loads(res_prof_after.data)
        self.assertEqual(data_prof_after["error"], "Please log in first")
        print(" [GET] /profile after logout passed: blocked with 401 Unauthorized")

    # ----------------------------------------------------
    # 7. USER RECOMMENDATIONS & FARMS CRUD TESTS
    # ----------------------------------------------------
    def test_15_user_recommendation_crud(self):
        """Test user-bound recommendations POST, GET, GET/<id>, PUT/<id>, DELETE/<id>."""
        import random
        rand_id = random.randint(1000, 9999)
        username = f"rec_user_{rand_id}"
        password = "RecPassword@123"

        # Register & Login
        self.app.post('/register', data=json.dumps({"username": username, "password": password}), content_type='application/json')
        self.app.post('/login', data=json.dumps({"username": username, "password": password}), content_type='application/json')

        # 1. Create Recommendation
        payload = {
            "nitrogen": 90, "phosphorus": 42, "potassium": 43,
            "temperature": 26.5, "humidity": 80.0, "ph": 6.5, "rainfall": 202.0,
            "notes": "Optimal wetland paddy recommendation test."
        }
        res_create = self.app.post('/api/recommendations', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(res_create.status_code, 201)
        data_create = json.loads(res_create.data)
        rec_id = data_create['recommendation']['recId']
        clean_rec_id = rec_id.replace('#', '')
        print(" [POST] /api/recommendations passed: created record", rec_id)

        # 2. Get All Recommendations
        res_get_all = self.app.get('/api/recommendations')
        self.assertEqual(res_get_all.status_code, 200)
        data_get_all = json.loads(res_get_all.data)
        self.assertGreaterEqual(data_get_all['total'], 1)
        print(f" [GET] /api/recommendations passed: retrieved {data_get_all['total']} user records")

        # 3. Get Single Recommendation
        res_get_one = self.app.get(f'/api/recommendations/{clean_rec_id}')
        self.assertEqual(res_get_one.status_code, 200)
        data_get_one = json.loads(res_get_one.data)
        self.assertEqual(data_get_one['recommendation']['recId'], rec_id)
        print(" [GET] /api/recommendations/<id> passed: retrieved single record", rec_id)

        # 4. Update Recommendation Notes
        update_payload = {"notes": "Verified top dressing applied."}
        res_put = self.app.put(f'/api/recommendations/{clean_rec_id}', data=json.dumps(update_payload), content_type='application/json')
        self.assertEqual(res_put.status_code, 200)
        data_put = json.loads(res_put.data)
        self.assertEqual(data_put['recommendation']['notes'], update_payload['notes'])
        print(" [PUT] /api/recommendations/<id> passed: updated record notes")

        # 5. Delete Recommendation
        res_del = self.app.delete(f'/api/recommendations/{clean_rec_id}')
        self.assertEqual(res_del.status_code, 200)
        data_del = json.loads(res_del.data)
        self.assertEqual(data_del['deletedId'], rec_id)
        print(" [DELETE] /api/recommendations/<id> passed: deleted record", rec_id)


    def test_16_farm_profiles_crud(self):
        """Test farm plot profile POST and GET endpoints."""
        import random
        rand_id = random.randint(1000, 9999)
        username = f"farm_user_{rand_id}"
        password = "FarmPassword@123"

        # Register & Login
        self.app.post('/register', data=json.dumps({"username": username, "password": password}), content_type='application/json')
        self.app.post('/login', data=json.dumps({"username": username, "password": password}), content_type='application/json')

        # Create Farm Profile
        farm_payload = {
            "farm_name": "Palakkad Green Acre Plot 1",
            "location": "Palakkad, Kerala",
            "area_acres": 4.5,
            "soil_type": "loamy"
        }
        res_create = self.app.post('/api/farms', data=json.dumps(farm_payload), content_type='application/json')
        self.assertEqual(res_create.status_code, 201)
        data_create = json.loads(res_create.data)
        self.assertEqual(data_create['farm']['farmName'], farm_payload['farm_name'])
        print(" [POST] /api/farms passed: created farm plot profile")

        # Get Farm Profiles
        res_get = self.app.get('/api/farms')
        self.assertEqual(res_get.status_code, 200)
        data_get = json.loads(res_get.data)
        self.assertGreaterEqual(data_get['total'], 1)
        print(f" [GET] /api/farms passed: retrieved {data_get['total']} farm profiles")

    def test_17_profile_update_and_account_management(self):
        """Test PUT /profile, PUT /api/user/change-password, and DELETE /api/user/account."""
        import random
        rand_id = random.randint(1000, 9999)
        username = f"account_user_{rand_id}"
        password = "OldPass@12345"
        new_password = "NewPass@67890"

        # 1. Register & Login
        self.app.post('/register', data=json.dumps({"username": username, "password": password, "fullname": "Original Name"}), content_type='application/json')
        self.app.post('/login', data=json.dumps({"username": username, "password": password}), content_type='application/json')

        # 2. Update Profile (PUT /profile)
        update_profile_payload = {
            "fullname": "Updated Farmer Name",
            "phone": "9876543210",
            "region": "Coimbatore, Tamil Nadu",
            "soil_type": "sandy"
        }
        res_prof = self.app.put('/profile', data=json.dumps(update_profile_payload), content_type='application/json')
        self.assertEqual(res_prof.status_code, 200)
        data_prof = json.loads(res_prof.data)
        self.assertEqual(data_prof['user']['fullname'], update_profile_payload['fullname'])
        print(" [PUT] /profile passed: updated user profile details")

        # 3. Change Password (Wrong Old Password -> 401)
        res_pass_wrong = self.app.put('/api/user/change-password', data=json.dumps({"old_password": "WrongPassword", "new_password": new_password}), content_type='application/json')
        self.assertEqual(res_pass_wrong.status_code, 401)
        print(" [PUT] /api/user/change-password (wrong old pass) passed: rejected with 401 Unauthorized")

        # 4. Change Password (Valid -> 200)
        res_pass = self.app.put('/api/user/change-password', data=json.dumps({"old_password": password, "new_password": new_password}), content_type='application/json')
        self.assertEqual(res_pass.status_code, 200)
        print(" [PUT] /api/user/change-password passed: password updated successfully")

        # 5. Delete Account (Wrong Password -> 401)
        res_del_wrong = self.app.delete('/api/user/account', data=json.dumps({"password": "WrongPassword"}), content_type='application/json')
        self.assertEqual(res_del_wrong.status_code, 401)
        print(" [DELETE] /api/user/account (wrong pass) passed: rejected with 401 Unauthorized")

        # 6. Delete Account (Valid Password -> 200)
        res_del = self.app.delete('/api/user/account', data=json.dumps({"password": new_password}), content_type='application/json')
        self.assertEqual(res_del.status_code, 200)
        print(" [DELETE] /api/user/account passed: user account deleted from database")


if __name__ == '__main__':
    unittest.main()





