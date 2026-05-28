from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from io import BytesIO
import os
import uuid
import logging
import shutil
import bcrypt
import jwt as pyjwt
from openpyxl import Workbook

# ─────────────────────── DB ───────────────────────
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# ─────────────────────── App ───────────────────────
app = FastAPI(title="Rudralife API")
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"
JWT_EXPIRES_HOURS = 24


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(admin_id: str, email: str) -> str:
    payload = {
        "sub": admin_id,
        "email": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRES_HOURS),
    }
    return pyjwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


async def get_current_admin(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    token = auth_header[7:] if auth_header.startswith("Bearer ") else None
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = pyjwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        admin = await db.admins.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not admin:
            raise HTTPException(status_code=401, detail="Admin not found")
        return admin
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ─────────────────────── Models ───────────────────────
class LoginIn(BaseModel):
    email: EmailStr
    password: str


class RegistrationCreate(BaseModel):
    full_name: str
    email: EmailStr
    dial_code: str = "+91"
    phone: str
    city: str = ""              # legacy — kept optional for back-compat
    profession: str = ""        # new field replacing city
    country: str
    exhibition_id: str
    exhibition_city: str
    visit_date: str
    message: Optional[str] = ""


class NotifyInterestCreate(BaseModel):
    full_name: str
    email: EmailStr
    dial_code: str = "+91"
    phone: str
    interested_city: str
    exhibition_id: Optional[str] = ""
    exhibition_type: Optional[str] = "domestic"  # "domestic" | "international"


class NotifyInterest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    email: str
    dial_code: str = "+91"
    phone: str
    interested_city: str
    exhibition_id: str = ""
    exhibition_type: str = "domestic"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class Registration(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    email: str
    dial_code: str = "+91"
    phone: str
    city: str = ""
    profession: str = ""
    country: str
    exhibition_id: str
    exhibition_city: str
    visit_date: str
    message: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ExhibitionIn(BaseModel):
    name: str
    type: str = "domestic"  # "domestic" | "international"
    image: str = ""
    status: str = "soon"   # "live" | "soon"
    start_date: Optional[str] = None  # ISO date "2026-04-16"
    end_date: Optional[str] = None
    timings: str = "10:00 am to 8:00 pm (Sunday Open)"
    venue: str = ""
    address: str = ""
    order: int = 0
    slug: Optional[str] = ""           # URL slug, e.g. "pune"
    country_code: str = "IN"           # ISO-2 (IN, US, GB, AE, SG, etc.)
    dial_code: str = "+91"             # Auto-default for phone field on this exhibition's forms


class Exhibition(ExhibitionIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class StatusToggle(BaseModel):
    status: str  # "live" | "soon"


class NotifyCityIn(BaseModel):
    name: str
    type: str = "domestic"  # "domestic" | "international"
    order: int = 0


class NotifyCity(NotifyCityIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class SiteContentIn(BaseModel):
    """Free-form content document driven by the admin Edit Page CMS.
    We accept any JSON the admin form produces and merge by top-level key."""
    model_config = ConfigDict(extra="allow")


# ─────────────────────── Public endpoints ───────────────────────
@api_router.get("/")
async def root():
    return {"message": "Rudralife API"}


# ─────────────────────── Helpers ───────────────────────
import re as _re

def _slugify(text: str) -> str:
    s = (text or "").strip().lower()
    s = _re.sub(r"[^a-z0-9]+", "-", s)
    s = _re.sub(r"-+", "-", s).strip("-")
    return s or "exhibition"


async def _ensure_unique_slug(base: str, exclude_id: str = "") -> str:
    """Append -2, -3… if slug already taken by another exhibition."""
    slug = base
    n = 2
    while True:
        existing = await db.exhibitions.find_one({"slug": slug})
        if not existing or existing.get("id") == exclude_id:
            return slug
        slug = f"{base}-{n}"
        n += 1


@api_router.get("/exhibitions", response_model=List[Exhibition])
async def list_exhibitions_public():
    """Public list used by the registration form & exhibitions section."""
    docs = await db.exhibitions.find({}, {"_id": 0}).sort([("status", 1), ("order", 1)]).to_list(500)
    return docs


@api_router.get("/exhibitions/by-slug/{slug}", response_model=Exhibition)
async def get_exhibition_by_slug(slug: str):
    doc = await db.exhibitions.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Exhibition not found")
    return doc


@api_router.post("/register", response_model=Registration)
async def create_registration(payload: RegistrationCreate):
    reg = Registration(**payload.model_dump())
    await db.registrations.insert_one(reg.model_dump())
    return reg


@api_router.post("/notify-interest", response_model=NotifyInterest)
async def create_notify_interest(payload: NotifyInterestCreate):
    rec = NotifyInterest(**payload.model_dump())
    await db.notify_interest.insert_one(rec.model_dump())
    return rec


@api_router.get("/notify-cities", response_model=List[NotifyCity])
async def list_notify_cities_public():
    """Public list of cities shown in the 'Notify Me' (Coming Soon) dropdown."""
    docs = await db.notify_cities.find({}, {"_id": 0}).sort([("type", 1), ("order", 1), ("name", 1)]).to_list(500)
    return docs


@api_router.get("/site-content")
async def get_site_content_public():
    """Public read of admin-managed Edit Page content. Returns {} if never edited."""
    doc = await db.site_content.find_one({"id": "main"}, {"_id": 0, "id": 0})
    return doc or {}


# ─────────────────────── Admin auth ───────────────────────
admin_router = APIRouter(prefix="/admin", tags=["admin"])


@admin_router.post("/login")
async def admin_login(payload: LoginIn):
    admin = await db.admins.find_one({"email": payload.email.lower()})
    if not admin or not verify_password(payload.password, admin.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(admin["id"], admin["email"])
    return {
        "token": token,
        "admin": {"id": admin["id"], "email": admin["email"], "name": admin.get("name", "Admin")},
        "expires_in_hours": JWT_EXPIRES_HOURS,
    }


@admin_router.get("/me")
async def admin_me(admin=Depends(get_current_admin)):
    return admin


# ─────────────────────── Admin: Exhibitions CRUD ───────────────────────
@admin_router.get("/exhibitions", response_model=List[Exhibition])
async def list_exhibitions_admin(admin=Depends(get_current_admin)):
    docs = await db.exhibitions.find({}, {"_id": 0}).sort([("status", 1), ("order", 1)]).to_list(500)
    return docs


@admin_router.post("/exhibitions", response_model=Exhibition)
async def create_exhibition(payload: ExhibitionIn, admin=Depends(get_current_admin)):
    data = payload.model_dump()
    base_slug = _slugify(data.get("slug") or data.get("name", ""))
    data["slug"] = await _ensure_unique_slug(base_slug)
    e = Exhibition(**data)
    await db.exhibitions.insert_one(e.model_dump())
    return e


@admin_router.put("/exhibitions/{exhibition_id}", response_model=Exhibition)
async def update_exhibition(exhibition_id: str, payload: ExhibitionIn, admin=Depends(get_current_admin)):
    existing = await db.exhibitions.find_one({"id": exhibition_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Exhibition not found")
    update_doc = payload.model_dump()
    base_slug = _slugify(update_doc.get("slug") or update_doc.get("name", ""))
    update_doc["slug"] = await _ensure_unique_slug(base_slug, exclude_id=exhibition_id)
    update_doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.exhibitions.update_one({"id": exhibition_id}, {"$set": update_doc})
    merged = {**existing, **update_doc}
    return merged


@admin_router.patch("/exhibitions/{exhibition_id}/status", response_model=Exhibition)
async def toggle_status(exhibition_id: str, payload: StatusToggle, admin=Depends(get_current_admin)):
    if payload.status not in ("live", "soon"):
        raise HTTPException(status_code=400, detail="status must be 'live' or 'soon'")
    existing = await db.exhibitions.find_one({"id": exhibition_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Exhibition not found")
    await db.exhibitions.update_one(
        {"id": exhibition_id},
        {"$set": {"status": payload.status, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    existing["status"] = payload.status
    existing["updated_at"] = datetime.now(timezone.utc).isoformat()
    return existing


@admin_router.delete("/exhibitions/{exhibition_id}")
async def delete_exhibition(exhibition_id: str, admin=Depends(get_current_admin)):
    res = await db.exhibitions.delete_one({"id": exhibition_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Exhibition not found")
    return {"deleted": True, "id": exhibition_id}


# ─────────────────────── Admin: Registrations (read-only + export) ───────────────────────
def _build_reg_query(date_from: Optional[str], date_to: Optional[str], exhibition_id: Optional[str], visit_date: Optional[str]) -> dict:
    q: dict = {}
    if exhibition_id:
        q["exhibition_id"] = exhibition_id
    if visit_date:
        q["visit_date"] = visit_date
    if date_from or date_to:
        rng = {}
        if date_from:
            rng["$gte"] = date_from
        if date_to:
            # inclusive end-of-day
            rng["$lte"] = date_to + "T23:59:59.999999+00:00" if len(date_to) == 10 else date_to
        q["created_at"] = rng
    return q


@admin_router.get("/registrations")
async def list_registrations_admin(
    admin=Depends(get_current_admin),
    date_from: Optional[str] = Query(None, description="ISO date YYYY-MM-DD"),
    date_to: Optional[str] = Query(None, description="ISO date YYYY-MM-DD"),
    exhibition_id: Optional[str] = None,
    visit_date: Optional[str] = None,
    limit: int = Query(500, ge=1, le=5000),
):
    q = _build_reg_query(date_from, date_to, exhibition_id, visit_date)
    docs = await db.registrations.find(q, {"_id": 0}).sort("created_at", -1).to_list(limit)
    total = await db.registrations.count_documents(q)
    return {"total": total, "items": docs}


@admin_router.get("/registrations/export")
async def export_registrations(
    admin=Depends(get_current_admin),
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    exhibition_id: Optional[str] = None,
    visit_date: Optional[str] = None,
):
    q = _build_reg_query(date_from, date_to, exhibition_id, visit_date)
    docs = await db.registrations.find(q, {"_id": 0}).sort("created_at", -1).to_list(10000)

    wb = Workbook()
    ws = wb.active
    ws.title = "Rudralife Leads"
    headers = [
        "Created At", "Full Name", "Email", "Dial Code", "Phone",
        "Profession", "Country", "Exhibition", "Visit Date", "Message",
    ]
    ws.append(headers)
    for d in docs:
        ws.append([
            d.get("created_at", ""),
            d.get("full_name", ""),
            d.get("email", ""),
            d.get("dial_code", ""),
            d.get("phone", ""),
            d.get("profession", "") or d.get("city", ""),
            d.get("country", ""),
            d.get("exhibition_city", ""),
            d.get("visit_date", ""),
            d.get("message", ""),
        ])
    # Column widths
    widths = [22, 22, 28, 10, 16, 16, 16, 22, 22, 40]
    from openpyxl.utils import get_column_letter
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w

    buf = BytesIO()
    wb.save(buf)
    buf.seek(0)
    fname = f"rudralife_leads_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.xlsx"
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{fname}"'},
    )


def _build_notify_query(date_from: Optional[str], date_to: Optional[str], city: Optional[str], etype: Optional[str]) -> dict:
    q: dict = {}
    if city: q["interested_city"] = {"$regex": f"^{city}$", "$options": "i"}
    if etype: q["exhibition_type"] = etype
    if date_from or date_to:
        rng = {}
        if date_from: rng["$gte"] = date_from
        if date_to:
            rng["$lte"] = date_to + "T23:59:59.999999+00:00" if len(date_to) == 10 else date_to
        q["created_at"] = rng
    return q


@admin_router.get("/notify-interest")
async def list_notify_interest(
    admin=Depends(get_current_admin),
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    city: Optional[str] = None,
    exhibition_type: Optional[str] = None,
    limit: int = Query(500, ge=1, le=5000),
):
    q = _build_notify_query(date_from, date_to, city, exhibition_type)
    docs = await db.notify_interest.find(q, {"_id": 0}).sort("created_at", -1).to_list(limit)
    total = await db.notify_interest.count_documents(q)
    return {"total": total, "items": docs}


@admin_router.get("/notify-interest/export")
async def export_notify_interest(
    admin=Depends(get_current_admin),
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    city: Optional[str] = None,
    exhibition_type: Optional[str] = None,
):
    q = _build_notify_query(date_from, date_to, city, exhibition_type)
    docs = await db.notify_interest.find(q, {"_id": 0}).sort("created_at", -1).to_list(10000)
    wb = Workbook()
    ws = wb.active
    ws.title = "Notify Me Leads"
    headers = ["Created At", "Full Name", "Email", "Dial Code", "Phone", "Interested City", "Exhibition Type"]
    ws.append(headers)
    for d in docs:
        ws.append([
            d.get("created_at", ""),
            d.get("full_name", ""),
            d.get("email", ""),
            d.get("dial_code", ""),
            d.get("phone", ""),
            d.get("interested_city", ""),
            d.get("exhibition_type", ""),
        ])
    from openpyxl.utils import get_column_letter
    widths = [22, 22, 28, 10, 16, 22, 18]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    buf = BytesIO()
    wb.save(buf)
    buf.seek(0)
    fname = f"rudralife_notifyme_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.xlsx"
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{fname}"'},
    )


# ─────────────────────── Admin: Notify Cities (Coming Soon dropdown management) ───────────────────────
@admin_router.get("/notify-cities", response_model=List[NotifyCity])
async def admin_list_notify_cities(admin=Depends(get_current_admin)):
    docs = await db.notify_cities.find({}, {"_id": 0}).sort([("type", 1), ("order", 1), ("name", 1)]).to_list(500)
    return docs


@admin_router.post("/notify-cities", response_model=NotifyCity)
async def admin_create_notify_city(payload: NotifyCityIn, admin=Depends(get_current_admin)):
    name_clean = payload.name.strip()
    if not name_clean:
        raise HTTPException(status_code=400, detail="City name is required")
    if payload.type not in ("domestic", "international"):
        raise HTTPException(status_code=400, detail="type must be 'domestic' or 'international'")
    existing = await db.notify_cities.find_one({"name": {"$regex": f"^{name_clean}$", "$options": "i"}, "type": payload.type})
    if existing:
        raise HTTPException(status_code=409, detail=f"'{name_clean}' already exists for {payload.type}")
    city = NotifyCity(name=name_clean, type=payload.type, order=payload.order)
    await db.notify_cities.insert_one(city.model_dump())
    return city


@admin_router.delete("/notify-cities/{city_id}")
async def admin_delete_notify_city(city_id: str, admin=Depends(get_current_admin)):
    res = await db.notify_cities.delete_one({"id": city_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="City not found")
    return {"deleted": True, "id": city_id}


# ─────────────────────── Admin: Image upload ───────────────────────
ALLOWED_IMG_EXT = {".jpg", ".jpeg", ".png", ".webp"}
MAX_IMG_BYTES = 4 * 1024 * 1024  # 4MB hard cap


@admin_router.post("/upload-image")
async def admin_upload_image(file: UploadFile = File(...), admin=Depends(get_current_admin)):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_IMG_EXT:
        raise HTTPException(status_code=400, detail=f"Unsupported file type. Allowed: {', '.join(sorted(ALLOWED_IMG_EXT))}")
    fname = f"{uuid.uuid4().hex}{ext}"
    target = UPLOAD_DIR / fname
    written = 0
    with target.open("wb") as buf:
        while True:
            chunk = await file.read(1024 * 64)
            if not chunk:
                break
            written += len(chunk)
            if written > MAX_IMG_BYTES:
                buf.close()
                target.unlink(missing_ok=True)
                raise HTTPException(status_code=413, detail=f"File too large. Max {MAX_IMG_BYTES // (1024*1024)}MB")
            buf.write(chunk)
    return {"filename": fname, "url": f"/api/uploads/{fname}", "size": written}


# ─────────────────────── Admin: Site Content (Edit Page CMS) ───────────────────────
@admin_router.get("/site-content")
async def admin_get_site_content(admin=Depends(get_current_admin)):
    doc = await db.site_content.find_one({"id": "main"}, {"_id": 0, "id": 0})
    return doc or {}


@admin_router.put("/site-content")
async def admin_save_site_content(payload: dict, admin=Depends(get_current_admin)):
    """Replaces the singleton site-content doc with the supplied JSON.
    Frontend should send the FULL content tree on each save."""
    doc = dict(payload or {})
    doc["id"] = "main"
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    doc["updated_by"] = admin.get("email", "")
    await db.site_content.replace_one({"id": "main"}, doc, upsert=True)
    return {"saved": True, "updated_at": doc["updated_at"]}


@admin_router.delete("/site-content")
async def admin_reset_site_content(admin=Depends(get_current_admin)):
    """Clears the site-content doc, reverting all sections to their hard-coded defaults."""
    await db.site_content.delete_many({"id": "main"})
    return {"reset": True}


api_router.include_router(admin_router)
app.include_router(api_router)

# ─────────────────────── Static uploads (images) ───────────────────────
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# ─────────────────────── Middleware ───────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ─────────────────────── Seed admin + initial exhibitions ───────────────────────
SEED_EXHIBITIONS = [
    {"name": "Hyderabad",     "type": "domestic", "status": "live",
     "image": "https://images.unsplash.com/photo-1641722995655-0cd1e5e3f8bd?w=1200&q=80",
     "start_date": "2026-04-16", "end_date": "2026-04-20",
     "timings": "10:00 am to 8:00 pm (Sunday Open)",
     "venue": "Lemon Tree Hotel", "address": "Banjara Hills, Hyderabad, Telangana", "order": 1},
    {"name": "Visakhapatnam", "type": "domestic", "status": "live",
     "image": "https://images.unsplash.com/photo-1606298855672-3efb63017be8?w=1200&q=80",
     "start_date": "2026-04-24", "end_date": "2026-04-26",
     "timings": "10:00 am to 8:00 pm (Sunday Open)",
     "venue": "Dolphin Hotels", "address": "Dabagardens, Visakhapatnam, Andhra Pradesh", "order": 2},
    {"name": "Bengaluru",     "type": "domestic", "status": "live",
     "image": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&q=80",
     "start_date": "2026-04-23", "end_date": "2026-04-27",
     "timings": "10:00 am to 8:00 pm (Sunday Open)",
     "venue": "Lemon Tree Premier", "address": "Ulsoor Lake, Bengaluru, Karnataka", "order": 3},
    {"name": "Chennai",     "type": "domestic", "status": "soon", "image": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&q=80", "order": 4},
    {"name": "Delhi",       "type": "domestic", "status": "soon", "image": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=80", "order": 5},
    {"name": "Ahmedabad",   "type": "domestic", "status": "soon", "image": "https://images.unsplash.com/photo-1518544801976-3e188ea7cbe3?w=1200&q=80", "order": 6},
    {"name": "Mumbai",      "type": "domestic", "status": "soon", "image": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&q=80", "order": 7},
    {"name": "Kolkata",     "type": "domestic", "status": "soon", "image": "https://images.unsplash.com/photo-1558431382-27e303142255?w=1200&q=80", "order": 8},
    {"name": "Gandhinagar", "type": "domestic", "status": "soon", "image": "https://images.unsplash.com/photo-1587899897387-091ebd01a6b2?w=1200&q=80", "order": 9},
    {"name": "Vadodara",    "type": "domestic", "status": "soon", "image": "https://images.unsplash.com/photo-1599661046827-dacff0ac8d2d?w=1200&q=80", "order": 10},
    {"name": "Rajkot",      "type": "domestic", "status": "soon", "image": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80", "order": 11},
    {"name": "Surat",       "type": "domestic", "status": "soon", "image": "https://images.unsplash.com/photo-1590676619229-9fa1c25b3c67?w=1200&q=80", "order": 12},
    {"name": "Jamnagar",    "type": "domestic", "status": "soon", "image": "https://images.unsplash.com/photo-1609948543911-d4fab7c50b1c?w=1200&q=80", "order": 13},
    {"name": "Pune",        "type": "domestic", "status": "soon", "image": "https://images.unsplash.com/photo-1572445271230-a78b5944a659?w=1200&q=80", "order": 14},
    {"name": "Indore",      "type": "domestic", "status": "soon", "image": "https://images.unsplash.com/photo-1605649461784-edc01a77a2cd?w=1200&q=80", "order": 15},
    {"name": "Jaipur",      "type": "domestic", "status": "soon", "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=80", "order": 16},
    {"name": "Dubai",        "type": "international", "status": "soon", "image": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80", "order": 100},
    {"name": "Singapore",    "type": "international", "status": "soon", "image": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80", "order": 101},
    {"name": "United Kingdom","type": "international","status": "soon", "image": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80", "order": 102},
    {"name": "Malaysia",     "type": "international", "status": "soon", "image": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&q=80", "order": 103},
]


@app.on_event("startup")
async def on_startup():
    # Indexes
    await db.admins.create_index("email", unique=True)
    await db.exhibitions.create_index("id", unique=True)
    await db.registrations.create_index("created_at")

    # Seed admin (idempotent)
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@rudralife.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "Rudralife@2026")
    existing = await db.admins.find_one({"email": admin_email})
    if not existing:
        await db.admins.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "name": "Rudralife Admin",
            "password_hash": hash_password(admin_password),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin {admin_email}")
    else:
        # Sync password if env changed
        if not verify_password(admin_password, existing.get("password_hash", "")):
            await db.admins.update_one(
                {"email": admin_email},
                {"$set": {"password_hash": hash_password(admin_password)}},
            )
            logger.info("Admin password synced from .env")

    # Seed exhibitions if collection empty
    if await db.exhibitions.count_documents({}) == 0:
        for s in SEED_EXHIBITIONS:
            doc = Exhibition(**s).model_dump()
            await db.exhibitions.insert_one(doc)
        logger.info(f"Seeded {len(SEED_EXHIBITIONS)} exhibitions")

    # Index for notify_interest
    await db.notify_interest.create_index("created_at")
    await db.notify_cities.create_index("id", unique=True)
    await db.site_content.create_index("id", unique=True)
    await db.exhibitions.create_index("slug", sparse=True)

    # Backfill slugs + country/dial codes for legacy exhibition docs
    legacy = await db.exhibitions.find({"$or": [{"slug": {"$exists": False}}, {"slug": ""}]}, {"_id": 0}).to_list(500)
    for ex in legacy:
        base = _slugify(ex.get("name", ""))
        slug = await _ensure_unique_slug(base, exclude_id=ex.get("id", ""))
        # Country/dial defaults: domestic → IN/+91, international → guess US/+1 if not set
        country_code = ex.get("country_code") or ("IN" if ex.get("type") == "domestic" else "US")
        dial_code = ex.get("dial_code") or ("+91" if ex.get("type") == "domestic" else "+1")
        await db.exhibitions.update_one(
            {"id": ex["id"]},
            {"$set": {"slug": slug, "country_code": country_code, "dial_code": dial_code}},
        )
    if legacy:
        logger.info(f"Backfilled slug/dial_code on {len(legacy)} legacy exhibitions")

    # Seed notify_cities from exhibitions if collection empty
    if await db.notify_cities.count_documents({}) == 0:
        ex_docs = await db.exhibitions.find({}, {"_id": 0, "name": 1, "type": 1, "order": 1}).to_list(500)
        seen = set()
        for ex in ex_docs:
            key = (ex.get("name", "").strip().lower(), ex.get("type", "domestic"))
            if not ex.get("name") or key in seen:
                continue
            seen.add(key)
            city = NotifyCity(name=ex["name"].strip(), type=ex.get("type", "domestic"), order=ex.get("order", 50))
            await db.notify_cities.insert_one(city.model_dump())
        logger.info(f"Seeded {len(seen)} notify_cities from exhibitions")

    # One-time migration: lowercase AM/PM in stored timings strings
    cursor = db.exhibitions.find({"timings": {"$regex": "AM|PM"}}, {"_id": 0, "id": 1, "timings": 1})
    async for doc in cursor:
        new_t = (doc.get("timings") or "").replace(" AM", " am").replace(" PM", " pm").replace("AM ", "am ").replace("PM ", "pm ")
        if new_t and new_t != doc.get("timings"):
            await db.exhibitions.update_one({"id": doc["id"]}, {"$set": {"timings": new_t}})


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
