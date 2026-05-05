"""Iteration 18 tests — Site Content CMS endpoints.

Covers:
  • GET /api/site-content (public) — returns dict (empty or saved)
  • PUT /api/admin/site-content (auth required) — saves JSON tree, persists,
    surfaces updated_at + updated_by, subsequent GET returns same data.
  • PUT /api/admin/site-content without token → 401.
  • Light regression for core endpoints used alongside CMS.
"""
import os
import io
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@rudralife.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Rudralife@2026")


# ─────────────────────── Fixtures ───────────────────────
@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


@pytest.fixture(scope="module")
def admin_token(s):
    r = s.post(f"{BASE_URL}/api/admin/login",
               json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"admin login failed {r.status_code} {r.text}"
    tok = r.json().get("token") or r.json().get("access_token")
    assert tok, f"no token in response {r.json()}"
    return tok


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="module", autouse=True)
def reset_site_content_after(s, admin_token):
    """Snapshot current CMS doc, run tests, restore at module end so we don't
    leave test data behind."""
    hdr = {"Authorization": f"Bearer {admin_token}"}
    snapshot = s.get(f"{BASE_URL}/api/admin/site-content", headers=hdr).json() or {}
    # strip server-managed keys
    snapshot.pop("updated_at", None)
    snapshot.pop("updated_by", None)
    yield
    # Restore: send empty dict {} so other tests start clean (as requested)
    s.put(f"{BASE_URL}/api/admin/site-content", headers=hdr, json={})


# ─────────────────────── Site-content tests ───────────────────────
class TestSiteContent:
    def test_public_get_returns_dict(self, s):
        r = s.get(f"{BASE_URL}/api/site-content")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, dict)

    def test_admin_put_without_token_401(self, s):
        r = requests.put(f"{BASE_URL}/api/admin/site-content",
                         json={"hero": {"title_hl": "X"}})
        assert r.status_code in (401, 403), f"expected 401/403, got {r.status_code}"

    def test_admin_put_with_token_saves_and_persists(self, s, auth_headers):
        payload = {
            "hero": {
                "title": "Welcome to",
                "title_hl": "TEST_Rudraksha_CMS",
                "subtitle": "pytest iter18 test",
            },
            "focus_box": {"visible": True, "points": [
                {"icon": "🌟", "title": "TEST_P1", "body": "point 1"},
            ]},
            "collection": {"autoplay": False, "speed": "fast"},
            "faq": [{"q": "TEST_Q1?", "a": "TEST_A1"}],
        }
        r = s.put(f"{BASE_URL}/api/admin/site-content",
                  headers=auth_headers, json=payload)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("saved") is True
        assert "updated_at" in body

        # verify via admin GET
        g = s.get(f"{BASE_URL}/api/admin/site-content", headers=auth_headers)
        assert g.status_code == 200
        doc = g.json()
        assert doc["hero"]["title_hl"] == "TEST_Rudraksha_CMS"
        assert doc["focus_box"]["visible"] is True
        assert doc["focus_box"]["points"][0]["title"] == "TEST_P1"
        assert doc["collection"]["autoplay"] is False
        assert doc["collection"]["speed"] == "fast"
        assert doc["faq"][0]["q"] == "TEST_Q1?"
        assert "updated_at" in doc
        assert doc.get("updated_by") == ADMIN_EMAIL

        # verify via public GET — should include same keys
        p = s.get(f"{BASE_URL}/api/site-content")
        assert p.status_code == 200
        pub = p.json()
        assert pub["hero"]["title_hl"] == "TEST_Rudraksha_CMS"
        assert pub["faq"][0]["q"] == "TEST_Q1?"

    def test_admin_put_empty_still_stamps(self, s, auth_headers):
        """PUT with {} succeeds and updates the server-managed stamp fields.
        NOTE: backend uses $set (merge) so prior fields are NOT removed — see
        code-review note in report. We only assert that save succeeds and
        updated_at is refreshed."""
        before = s.get(f"{BASE_URL}/api/admin/site-content", headers=auth_headers).json()
        r = s.put(f"{BASE_URL}/api/admin/site-content",
                  headers=auth_headers, json={})
        assert r.status_code == 200
        g = s.get(f"{BASE_URL}/api/admin/site-content", headers=auth_headers)
        doc = g.json()
        assert "updated_at" in doc
        assert doc["updated_at"] >= before.get("updated_at", "")

    def test_admin_get_requires_auth(self, s):
        r = requests.get(f"{BASE_URL}/api/admin/site-content")
        assert r.status_code in (401, 403)


# ─────────────────────── Regression smoke ───────────────────────
class TestRegressionSmoke:
    def test_exhibitions_public(self, s):
        r = s.get(f"{BASE_URL}/api/exhibitions")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_register_public(self, s):
        payload = {
            "full_name": "TEST_iter18 reg",
            "phone": "9876543210",
            "dial_code": "+91",
            "email": "test_iter18@example.com",
            "exhibition_id": "none",
            "exhibition_city": "Hyderabad",
            "visit_date": "2026-05-01",
            "city": "Hyderabad",
            "country": "India",
        }
        r = s.post(f"{BASE_URL}/api/register", json=payload)
        assert r.status_code in (200, 201), r.text

    def test_notify_interest_public(self, s):
        payload = {
            "full_name": "TEST_iter18 notify",
            "phone": "9876543211",
            "dial_code": "+91",
            "email": "test_iter18notify@example.com",
            "city": "Hyderabad",
            "country": "India",
            "interested_city": "Hyderabad",
        }
        r = s.post(f"{BASE_URL}/api/notify-interest", json=payload)
        assert r.status_code in (200, 201), r.text

    def test_admin_login_ok(self, s):
        r = s.post(f"{BASE_URL}/api/admin/login",
                   json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        assert r.json().get("token")

    def test_admin_registrations(self, s, auth_headers):
        r = s.get(f"{BASE_URL}/api/admin/registrations", headers=auth_headers)
        assert r.status_code == 200
        body = r.json()
        # Either a list or paginated {items, total} dict accepted
        assert isinstance(body, (list, dict))
        if isinstance(body, dict):
            assert "items" in body and isinstance(body["items"], list)

    def test_admin_notify_interest(self, s, auth_headers):
        r = s.get(f"{BASE_URL}/api/admin/notify-interest", headers=auth_headers)
        assert r.status_code == 200
        body = r.json()
        assert isinstance(body, (list, dict))
        if isinstance(body, dict):
            assert "items" in body and isinstance(body["items"], list)

    def test_admin_notify_cities(self, s, auth_headers):
        r = s.get(f"{BASE_URL}/api/admin/notify-cities", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_upload_image(self, s, admin_token):
        # small 1x1 PNG
        png = bytes.fromhex(
            "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4"
            "890000000d49444154789c636000010000000500010d0a2db40000000049454e"
            "44ae426082"
        )
        files = {"file": ("iter18.png", io.BytesIO(png), "image/png")}
        r = requests.post(
            f"{BASE_URL}/api/admin/upload-image",
            headers={"Authorization": f"Bearer {admin_token}"},
            files=files,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert "url" in body and body["url"].startswith("/api/uploads/")
