"""
Test script to verify ISO 8601 UTC timestamp generation in Backend/app.py.
"""
import sys
import os
import json
import datetime
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app

class TestTimestampFormat(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['RATELIMIT_ENABLED'] = False
        self.client = app.test_client()

    def _assert_valid_iso_utc(self, ts_str):
        self.assertIsInstance(ts_str, str)
        # Parse with datetime.fromisoformat
        dt = datetime.datetime.fromisoformat(ts_str)
        self.assertIsNotNone(dt.tzinfo, f"Timestamp {ts_str} must be timezone-aware.")
        # Check UTC offset is 0
        utc_offset = dt.utcoffset()
        self.assertEqual(utc_offset, datetime.timedelta(0), f"Timestamp {ts_str} must be in UTC.")

    def test_crop_predict_timestamp(self):
        payload = {
            "nitrogen": 90,
            "phosphorus": 42,
            "potassium": 43,
            "temperature": 26.5,
            "humidity": 80.0,
            "ph": 6.5,
            "rainfall": 202.0
        }
        res = self.client.post('/api/predict', json=payload)
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data)
        ts = data.get('timestamp')
        self._assert_valid_iso_utc(ts)
        print(f" [PASS] /api/predict timestamp is ISO 8601 UTC: {ts}")

    def test_fertilizer_predict_timestamp(self):
        payload = {
            "nitrogen": 50,
            "phosphorus": 20,
            "potassium": 30,
            "temperature": 28.0,
            "rainfall": 120.0,
            "ph": 6.5,
            "district_name": "Kolhapur",
            "soil_color": "Black",
            "crop": "Sugarcane"
        }
        res = self.client.post('/api/predict/fertilizer', json=payload)
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data)
        ts = data.get('timestamp')
        self._assert_valid_iso_utc(ts)
        print(f" [PASS] /api/predict/fertilizer timestamp is ISO 8601 UTC: {ts}")

    def test_yield_predict_timestamp(self):
        payload = {
            "state_name": "Maharashtra",
            "season": "Kharif",
            "crop": "Rice",
            "crop_year": 2024,
            "area": 10.0
        }
        res = self.client.post('/api/predict/yield', json=payload)
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data)
        ts = data.get('timestamp')
        self._assert_valid_iso_utc(ts)
        print(f" [PASS] /api/predict/yield timestamp is ISO 8601 UTC: {ts}")

if __name__ == '__main__':
    unittest.main()
