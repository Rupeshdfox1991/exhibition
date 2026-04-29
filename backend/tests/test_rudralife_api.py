"""Backend API tests for Rudralife app"""
import os
import pytest
import requests
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://sacred-rudraksha-hub.preview.emergentagent.com').rstrip('/')


@pytest.fixture(scope="module")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


VALID_PAYLOAD = {
    "full_name": "TEST_User RudraLife",
    "email": "test_rudralife@example.com",
    "dial_code": "+91",
    "phone": "9876543210",
    "city": "Mumbai",
    "country": "India",
    "exhibition_id": "hyderabad",
    "exhibition_city": "Hyderabad",
    "visit_date": "2026-01-20",
    "message": "Looking forward to attend"
}


# Root endpoint
class TestRoot:
    def test_root_message(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        data = r.json()
        assert data == {"message": "Rudralife API"}


# Registration module
class TestRegistration:
    def test_create_valid_registration(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/register", json=VALID_PAYLOAD)
        assert r.status_code == 200, f"Status: {r.status_code} Body: {r.text}"
        data = r.json()
        assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
        assert "created_at" in data
        assert data["full_name"] == VALID_PAYLOAD["full_name"]
        assert data["email"] == VALID_PAYLOAD["email"]
        assert data["exhibition_id"] == VALID_PAYLOAD["exhibition_id"]
        assert data["message"] == VALID_PAYLOAD["message"]
        # Ensure no mongo _id leaking
        assert "_id" not in data
        pytest.created_id = data["id"]

    def test_invalid_email_returns_422(self, api_client):
        bad = dict(VALID_PAYLOAD)
        bad["email"] = "not-an-email"
        r = api_client.post(f"{BASE_URL}/api/register", json=bad)
        assert r.status_code == 422, f"Expected 422, got {r.status_code}: {r.text}"

    def test_missing_required_field_returns_422(self, api_client):
        bad = dict(VALID_PAYLOAD)
        bad.pop("full_name")
        r = api_client.post(f"{BASE_URL}/api/register", json=bad)
        assert r.status_code == 422

    def test_optional_message_defaults(self, api_client):
        payload = dict(VALID_PAYLOAD)
        payload["email"] = "test_rudralife_nomsg@example.com"
        payload.pop("message")
        r = api_client.post(f"{BASE_URL}/api/register", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert data.get("message", "") == ""

    def test_public_list_registrations_removed(self, api_client):
        # Public GET /api/registrations was intentionally removed (admin-only now).
        r = api_client.get(f"{BASE_URL}/api/registrations")
        assert r.status_code in (404, 405)
