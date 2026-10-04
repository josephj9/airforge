import unittest

from fastapi.testclient import TestClient

from app import create_app


class HealthTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(create_app())
        self.addCleanup(self.client.close)

    def test_health(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok", "service": "airforge", "phase": 1})

    def test_allowed_origin(self):
        response = self.client.get("/health", headers={"Origin": "http://localhost:5173"})
        self.assertEqual(response.headers["Access-Control-Allow-Origin"], "http://localhost:5173")

    def test_unknown_origin_is_not_granted_cors(self):
        response = self.client.get("/health", headers={"Origin": "https://untrusted.example"})
        self.assertNotIn("Access-Control-Allow-Origin", response.headers)

    def test_generation_not_implemented_in_phase_one(self):
        response = self.client.post("/api/generate", json={})
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"error": "Endpoint not found"})


if __name__ == "__main__":
    unittest.main()
