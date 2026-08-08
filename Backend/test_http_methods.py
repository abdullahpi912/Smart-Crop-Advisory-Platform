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
        self.app = app.test_client()
        self.app.testing = True

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
        payload = {
            "logId": "#LOG-9999",
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
        self.assertEqual(data['log']['logId'], '#LOG-9999')
        print(" [POST] /api/logs passed: posted new log entry", data['log']['logId'])

    # ----------------------------------------------------
    # 3. PUT METHOD TESTS (Update Data)
    # ----------------------------------------------------
    def test_07_put_update_log(self):
        """Test PUT /api/logs/<log_id> endpoint (Update existing log details)."""
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
        response = self.app.delete('/api/logs/LOG-8941')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['deletedId'], '#LOG-8941')
        print(" [DELETE] /api/logs/LOG-8941 passed: removed log entry successfully")

    def test_09_delete_non_existent_log(self):
        """Test DELETE /api/logs/<log_id> with invalid log ID."""
        response = self.app.delete('/api/logs/LOG-0000')
        self.assertEqual(response.status_code, 404)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'error')
        print(" [DELETE] /api/logs/LOG-0000 passed: received 404 Not Found as expected")

if __name__ == '__main__':
    unittest.main()
