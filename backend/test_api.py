"""Integration tests for the OneStep FastAPI application (main.py).

Tests:
1. Health check endpoint (GET /health)
2. Validation error handling (POST /next-step with invalid body)
3. End-to-end navigation request (POST /next-step)
"""

import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert data == {"status": "ok"}
    print("Health check endpoint: PASSED")


def test_validation_error():
    # Empty goal should return 400 Bad Request
    response = client.post(
        "/next-step",
        json={"goal": "  ", "page": "Test", "elements": [{"id": "el_1"}]},
    )
    assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    print("Request validation error (400): PASSED")


def test_next_step_e2e():
    payload = {
        "goal": "Change my residential address",
        "page": "Citizen Dashboard",
        "elements": [
            {"id": "el_1", "type": "button", "text": "Profile"},
            {"id": "el_2", "type": "button", "text": "Citizen Services"},
            {"id": "el_3", "type": "link", "text": "Payments"},
        ],
    }
    response = client.post("/next-step", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    print("E2E API Response:")
    print(data)
    assert "element_id" in data
    assert "instruction" in data
    assert "reason" in data
    assert data["element_id"] in ["el_1", "el_2", "el_3", None]
    print("E2E /next-step endpoint: PASSED")


if __name__ == "__main__":
    print("=" * 60)
    print("Running FastAPI Integration Tests")
    print("=" * 60)
    test_health()
    test_validation_error()
    test_next_step_e2e()
    print("=" * 60)
    print("All FastAPI API tests PASSED!")
    print("=" * 60)

