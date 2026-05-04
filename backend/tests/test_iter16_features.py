"""Iteration 16 backend tests — Notify Cities CRUD + Image Upload."""
import os
import io
import struct
import zlib
import pytest
import requests

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL",
    "https://sacred-rudraksha-hub.preview.emergentagent.com",
).rstrip("/")

ADMIN_EMAIL = "admin@rudralife.com"
ADMIN_PASSWORD = "Rudralife@2026"


def _make_png_bytes(w: int = 2, h: int = 2) -> bytes:
    """Build a valid minimal PNG (no PIL dependency)."""
    sig = b"\x89PNG\r\n\x1a\n"

    def chunk(tag, data):
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    ihdr = struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)  # 8-bit RGB
    raw = b""
    for _ in range(h):
        raw += b"\x00" + b"\xff\x00\x00" * w  # filter byte + red row
    idat = zlib.compress(raw)
    return sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")


@pytest.fixture(scope="module")
def token():
    r = requests.post(
        f"{BASE_URL}/api/admin/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="module")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ─────────── Public notify-cities ───────────
class TestPublicNotifyCities:
    def test_returns_seeded_cities(self):
        r = requests.get(f"{BASE_URL}/api/notify-cities")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 20, f"Expected ≥20 seeded cities, got {len(data)}"
        # No _id leak, has required fields
        for c in data[:5]:
            assert "_id" not in c
            assert "id" in c and "name" in c and "type" in c
            assert c["type"] in ("domestic", "international")
        domestic = [c for c in data if c["type"] == "domestic"]
        intl = [c for c in data if c["type"] == "international"]
        assert len(domestic) >= 16
        assert len(intl) >= 4


# ─────────── Admin notify-cities CRUD ───────────
class TestAdminNotifyCities:
    def test_list_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/admin/notify-cities")
        assert r.status_code == 401

    def test_list_with_auth(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/admin/notify-cities", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create_requires_auth(self):
        r = requests.post(
            f"{BASE_URL}/api/admin/notify-cities",
            json={"name": "TEST_NoAuth", "type": "domestic"},
        )
        assert r.status_code == 401

    def test_full_lifecycle(self, auth_headers):
        # CREATE
        payload = {"name": "TEST_NotifyCity_LC", "type": "domestic", "order": 999}
        r = requests.post(
            f"{BASE_URL}/api/admin/notify-cities",
            json=payload,
            headers=auth_headers,
        )
        assert r.status_code == 200, r.text
        created = r.json()
        cid = created["id"]
        assert created["name"] == payload["name"]
        assert created["type"] == "domestic"

        # Public list now includes it
        pub = requests.get(f"{BASE_URL}/api/notify-cities").json()
        assert any(c["id"] == cid for c in pub), "Created city missing from public list"

        # DUPLICATE → 409
        r = requests.post(
            f"{BASE_URL}/api/admin/notify-cities",
            json=payload,
            headers=auth_headers,
        )
        assert r.status_code == 409, f"Expected 409 dup; got {r.status_code} {r.text}"

        # Same name + different type → allowed
        r = requests.post(
            f"{BASE_URL}/api/admin/notify-cities",
            json={**payload, "type": "international"},
            headers=auth_headers,
        )
        assert r.status_code == 200, r.text
        cid2 = r.json()["id"]

        # DELETE both
        for _id in (cid, cid2):
            r = requests.delete(
                f"{BASE_URL}/api/admin/notify-cities/{_id}", headers=auth_headers
            )
            assert r.status_code == 200
            assert r.json().get("deleted") is True

        # 404 on second delete
        r = requests.delete(
            f"{BASE_URL}/api/admin/notify-cities/{cid}", headers=auth_headers
        )
        assert r.status_code == 404

    def test_invalid_type(self, auth_headers):
        r = requests.post(
            f"{BASE_URL}/api/admin/notify-cities",
            json={"name": "TEST_BadType", "type": "alien"},
            headers=auth_headers,
        )
        assert r.status_code == 400, r.text

    def test_missing_name(self, auth_headers):
        r = requests.post(
            f"{BASE_URL}/api/admin/notify-cities",
            json={"name": "   ", "type": "domestic"},
            headers=auth_headers,
        )
        assert r.status_code == 400, r.text

        r = requests.post(
            f"{BASE_URL}/api/admin/notify-cities",
            json={"type": "domestic"},
            headers=auth_headers,
        )
        # Pydantic 422 OR our 400; both are reasonable rejections
        assert r.status_code in (400, 422)

    def test_delete_unknown(self, auth_headers):
        r = requests.delete(
            f"{BASE_URL}/api/admin/notify-cities/non-existent-id-xyz",
            headers=auth_headers,
        )
        assert r.status_code == 404


# ─────────── Admin image upload ───────────
class TestAdminUploadImage:
    def test_requires_auth(self):
        png = _make_png_bytes()
        r = requests.post(
            f"{BASE_URL}/api/admin/upload-image",
            files={"file": ("x.png", png, "image/png")},
        )
        assert r.status_code == 401

    def test_upload_png_and_fetch(self, auth_headers):
        png = _make_png_bytes()
        r = requests.post(
            f"{BASE_URL}/api/admin/upload-image",
            files={"file": ("tiny.png", png, "image/png")},
            headers=auth_headers,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert "filename" in body and "url" in body and "size" in body
        assert body["url"].startswith("/api/uploads/")
        assert body["size"] == len(png)
        assert body["filename"].endswith(".png")
        # Fetch the uploaded URL
        full = f"{BASE_URL}{body['url']}"
        rr = requests.get(full)
        assert rr.status_code == 200
        ct = rr.headers.get("content-type", "")
        assert "image" in ct, f"unexpected content-type: {ct}"
        assert rr.content[:8] == b"\x89PNG\r\n\x1a\n"

    def test_upload_jpg(self, auth_headers):
        # JPG SOI/EOI minimal stub (server only checks extension, not magic)
        jpg = b"\xff\xd8\xff\xd9"
        r = requests.post(
            f"{BASE_URL}/api/admin/upload-image",
            files={"file": ("p.jpg", jpg, "image/jpeg")},
            headers=auth_headers,
        )
        assert r.status_code == 200, r.text
        assert r.json()["filename"].endswith(".jpg")

    def test_upload_webp(self, auth_headers):
        # WebP magic stub
        webp = b"RIFF\x00\x00\x00\x00WEBP"
        r = requests.post(
            f"{BASE_URL}/api/admin/upload-image",
            files={"file": ("p.webp", webp, "image/webp")},
            headers=auth_headers,
        )
        assert r.status_code == 200, r.text
        assert r.json()["filename"].endswith(".webp")

    def test_reject_non_image_extension(self, auth_headers):
        r = requests.post(
            f"{BASE_URL}/api/admin/upload-image",
            files={"file": ("evil.exe", b"MZ\x90\x00", "application/octet-stream")},
            headers=auth_headers,
        )
        assert r.status_code == 400, r.text

        r = requests.post(
            f"{BASE_URL}/api/admin/upload-image",
            files={"file": ("doc.pdf", b"%PDF-1.4", "application/pdf")},
            headers=auth_headers,
        )
        assert r.status_code == 400

    def test_reject_oversize(self, auth_headers):
        # 5 MB > 4 MB cap
        big = b"\x00" * (5 * 1024 * 1024)
        r = requests.post(
            f"{BASE_URL}/api/admin/upload-image",
            files={"file": ("huge.png", big, "image/png")},
            headers=auth_headers,
        )
        assert r.status_code == 413, f"Expected 413; got {r.status_code} {r.text[:200]}"
