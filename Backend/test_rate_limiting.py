"""
Test script to verify rate limiting behavior:
1. /api/health is exempt from rate limiting (can be called > 100 times without 429).
2. / and /favicon.ico are exempt from rate limiting.
3. User-facing routes (e.g., /login or default limited routes) enforce rate limits.
4. DummyLimiter fallback functions correctly without errors.
"""
import sys
import os
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, limiter, DummyLimiter

class TestRateLimitingExemptions(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['RATELIMIT_ENABLED'] = True
        self.client = app.test_client()
        # Reset limiter storage if possible
        try:
            limiter.reset()
        except Exception:
            pass

    def test_dummy_limiter_standalone(self):
        """Test that DummyLimiter handles decorators both with and without arguments."""
        dummy = DummyLimiter()

        @dummy.limit("5 per minute")
        def sample_func_1():
            return "func1"

        @dummy.exempt
        def sample_func_2():
            return "func2"

        @dummy.exempt()
        def sample_func_3():
            return "func3"

        self.assertEqual(sample_func_1(), "func1")
        self.assertEqual(sample_func_2(), "func2")
        self.assertEqual(sample_func_3(), "func3")
        print(" [PASS] DummyLimiter fallback decorators work as expected.")

    def test_health_check_rate_limit_exempt(self):
        """Test hitting /api/health 120 times (exceeding 100/hr limit) without getting 429."""
        for i in range(120):
            res = self.client.get('/api/health')
            self.assertNotEqual(
                res.status_code, 429,
                f"Iteration {i+1}: /api/health returned 429 Rate Limit Exceeded!"
            )
            self.assertIn(res.status_code, [200, 503])
        print(" [PASS] /api/health successfully handled 120 consecutive requests without 429.")

    def test_root_health_check_rate_limit_exempt(self):
        """Test hitting / 120 times without getting 429."""
        for i in range(120):
            res = self.client.get('/')
            self.assertNotEqual(
                res.status_code, 429,
                f"Iteration {i+1}: / returned 429 Rate Limit Exceeded!"
            )
            self.assertEqual(res.status_code, 200)
        print(" [PASS] / (root health check) successfully handled 120 consecutive requests without 429.")

    def test_favicon_rate_limit_exempt(self):
        """Test hitting /favicon.ico 120 times without getting 429."""
        for i in range(120):
            res = self.client.get('/favicon.ico')
            self.assertNotEqual(
                res.status_code, 429,
                f"Iteration {i+1}: /favicon.ico returned 429 Rate Limit Exceeded!"
            )
            self.assertEqual(res.status_code, 204)
        print(" [PASS] /favicon.ico successfully handled 120 consecutive requests without 429.")

    def test_login_rate_limiting_enforced(self):
        """Test that /login rate limit (5 per minute) is properly enforced."""
        try:
            limiter.reset()
        except Exception:
            pass

        statuses = []
        for i in range(8):
            res = self.client.post('/login', json={'username': 'invalid_user', 'password': 'wrong_password'})
            statuses.append(res.status_code)

        # First 5 should be 400 or 401 (or 500 if db offline), 6th onwards must be 429
        self.assertIn(429, statuses, "Expected /login to trigger 429 after 5 attempts.")
        print(f" [PASS] /login rate limiting active. Status codes: {statuses}")

if __name__ == '__main__':
    unittest.main()
