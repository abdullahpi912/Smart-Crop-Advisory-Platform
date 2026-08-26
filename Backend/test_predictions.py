"""
Automated Test Suite for Cropling Multi-Model API Endpoints
Verifies:
- GET /
- GET /api/health
- GET /api/options
- POST /api/predict (Crop ML Model)
- POST /api/predict/fertilizer (Valid inference + Top-3 Shortlist)
- POST /api/predict/fertilizer (Strict 400 validation on invalid categoricals)
- POST /api/predict/yield (Valid XGBoost inference + expm1 Tonnes inversion)
- POST /api/predict/yield (Strict 400 validation on invalid categoricals and negative area)
- GET /api/logs
"""

import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app


class TestCroplingMultiModelAPI(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_01_root_and_health(self):
        r = self.client.get('/')
        self.assertEqual(r.status_code, 200)
        data = r.get_json()
        self.assertEqual(data.get('status'), 'running')
        self.assertIn('options', data.get('endpoints', {}))
        self.assertIn('predict_fertilizer', data.get('endpoints', {}))
        self.assertIn('predict_yield', data.get('endpoints', {}))

        r_health = self.client.get('/api/health')
        self.assertEqual(r_health.status_code, 200)
        health_data = r_health.get_json()
        self.assertIn(health_data.get('models', {}).get('crop_recommendation'), ['loaded', 'offline'])
        self.assertIn(health_data.get('models', {}).get('fertilizer_recommendation'), ['loaded', 'offline'])
        self.assertIn(health_data.get('models', {}).get('crop_yield_prediction'), ['loaded', 'offline'])

    def test_02_options_catalog(self):
        r = self.client.get('/api/options')
        self.assertEqual(r.status_code, 200)
        data = r.get_json()
        self.assertIn('fertilizer', data)
        self.assertIn('yield', data)
        self.assertEqual(len(data['fertilizer']['districts']), 5)
        self.assertEqual(len(data['fertilizer']['soilColors']), 6)
        self.assertEqual(len(data['fertilizer']['crops']), 16)
        self.assertEqual(len(data['yield']['states']), 33)
        self.assertEqual(len(data['yield']['seasons']), 6)
        self.assertEqual(len(data['yield']['crops']), 124)

    def test_03_crop_prediction(self):
        payload = {
            'nitrogen': 90, 'phosphorus': 42, 'potassium': 43,
            'temperature': 26.5, 'humidity': 80.0, 'ph': 6.5, 'rainfall': 202.0
        }
        r = self.client.post('/api/predict', json=payload)
        self.assertEqual(r.status_code, 201)
        data = r.get_json()
        self.assertEqual(data.get('status'), 'success')
        self.assertTrue(bool(data.get('crop')))
        self.assertTrue(bool(data.get('recommendedItem')))

    def test_04_fertilizer_prediction_valid(self):
        payload = {
            'district_name': 'Kolhapur',
            'soil_color': 'Black',
            'crop': 'Sugarcane',
            'nitrogen': 50.0,
            'phosphorus': 20.0,
            'potassium': 30.0,
            'ph': 6.5,
            'rainfall': 120.0,
            'temperature': 28.0
        }
        r = self.client.post('/api/predict/fertilizer', json=payload)
        self.assertEqual(r.status_code, 201)
        data = r.get_json()
        self.assertEqual(data.get('status'), 'success')
        self.assertTrue(bool(data.get('fertilizer')))
        self.assertEqual(data.get('badgeClass'), 'badge-fertilizer')
        self.assertIn('top3', data)
        self.assertEqual(len(data['top3']), 3)
        for cand in data['top3']:
            self.assertIn('name', cand)
            self.assertIn('confidence', cand)

    def test_05_fertilizer_prediction_invalid_categoricals(self):
        # Bad district
        r1 = self.client.post('/api/predict/fertilizer', json={
            'district_name': 'Atlantis', 'soil_color': 'Black', 'crop': 'Sugarcane',
            'nitrogen': 50, 'phosphorus': 20, 'potassium': 30, 'ph': 6.5, 'rainfall': 120, 'temperature': 28
        })
        self.assertEqual(r1.status_code, 400)
        self.assertIn('Invalid district_name', r1.get_json().get('error', ''))

        # Bad soil color
        r2 = self.client.post('/api/predict/fertilizer', json={
            'district_name': 'Pune', 'soil_color': 'NeonGreen', 'crop': 'Wheat',
            'nitrogen': 50, 'phosphorus': 20, 'potassium': 30, 'ph': 6.5, 'rainfall': 120, 'temperature': 28
        })
        self.assertEqual(r2.status_code, 400)
        self.assertIn('Invalid soil_color', r2.get_json().get('error', ''))

        # Bad crop
        r3 = self.client.post('/api/predict/fertilizer', json={
            'district_name': 'Pune', 'soil_color': 'Dark Brown', 'crop': 'KryptoniteTree',
            'nitrogen': 50, 'phosphorus': 20, 'potassium': 30, 'ph': 6.5, 'rainfall': 120, 'temperature': 28
        })
        self.assertEqual(r3.status_code, 400)
        self.assertIn('Invalid crop', r3.get_json().get('error', ''))

    def test_06_yield_prediction_valid(self):
        payload = {
            'state_name': 'Maharashtra',
            'season': 'Kharif',
            'crop': 'Rice',
            'crop_year': 2024,
            'area': 10.0
        }
        r = self.client.post('/api/predict/yield', json=payload)
        self.assertEqual(r.status_code, 201)
        data = r.get_json()
        self.assertEqual(data.get('status'), 'success')
        self.assertGreater(data.get('predicted_production_tonnes', 0), 0)
        self.assertEqual(data.get('unit'), 'tonnes')
        self.assertGreater(data.get('yield_per_hectare', 0), 0)
        self.assertEqual(data.get('badgeClass'), 'badge-yield')

    def test_07_yield_prediction_invalid_categoricals_and_numbers(self):
        # Bad state
        r1 = self.client.post('/api/predict/yield', json={
            'state_name': 'NarniaState', 'season': 'Kharif', 'crop': 'Rice', 'crop_year': 2024, 'area': 10.0
        })
        self.assertEqual(r1.status_code, 400)
        self.assertIn('Invalid state_name', r1.get_json().get('error', ''))

        # Bad season
        r2 = self.client.post('/api/predict/yield', json={
            'state_name': 'Maharashtra', 'season': 'MonsoonSummerSuper', 'crop': 'Rice', 'crop_year': 2024, 'area': 10.0
        })
        self.assertEqual(r2.status_code, 400)
        self.assertIn('Invalid season', r2.get_json().get('error', ''))

        # Bad crop
        r3 = self.client.post('/api/predict/yield', json={
            'state_name': 'Maharashtra', 'season': 'Kharif', 'crop': 'MoonDustCrop', 'crop_year': 2024, 'area': 10.0
        })
        self.assertEqual(r3.status_code, 400)
        self.assertIn('Invalid crop', r3.get_json().get('error', ''))

        # Non-positive area
        r4 = self.client.post('/api/predict/yield', json={
            'state_name': 'Maharashtra', 'season': 'Kharif', 'crop': 'Rice', 'crop_year': 2024, 'area': -5.0
        })
        self.assertEqual(r4.status_code, 400)
        self.assertIn('greater than 0', r4.get_json().get('error', ''))

    def test_08_logs_endpoint(self):
        r = self.client.get('/api/logs')
        self.assertEqual(r.status_code, 200)
        data = r.get_json()
        self.assertEqual(data.get('status'), 'success')
        self.assertIsInstance(data.get('logs'), list)


if __name__ == '__main__':
    unittest.main()
