from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, Query
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from io import BytesIO
import os
import uuid
import logging
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
    city: str
    country: str
    exhibition_id: str
    exhibition_city: str
    visit_date: str
    message: Optional[str] = ""


class Registration(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    email: str
    dial_code: str = "+91"
    phone: str
    city: str
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
    timings: str = "10:00 AM to 8:00 PM (Sunday Open)"
    venue: str = ""
    address: str = ""
    order: int = 0


class Exhibition(ExhibitionIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class StatusToggle(BaseModel):
    status: str  # "live" | "soon"


# ─────────────────────── Public endpoints ───────────────────────
@api_router.get("/")
async def root():
    return {"message": "Rudralife API"}


@api_router.get("/exhibitions", response_model=List[Exhibition])
async def list_exhibitions_public():
    """Public list used by the registration form & exhibitions section."""
    docs = await db.exhibitions.find({}, {"_id": 0}).sort("order", 1).to_list(500)
    return docs


@api_router.post("/register", response_model=Registration)
async def create_registration(payload: RegistrationCreate):
    reg = Registration(**payload.model_dump())
    await db.registrations.insert_one(reg.model_dump())
    return reg


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
    docs = await db.exhibitions.find({}, {"_id": 0}).sort("order", 1).to_list(500)
    return docs


@admin_router.post("/exhibitions", response_model=Exhibition)
async def create_exhibition(payload: ExhibitionIn, admin=Depends(get_current_admin)):
    e = Exhibition(**payload.model_dump())
    await db.exhibitions.insert_one(e.model_dump())
    return e


@admin_router.put("/exhibitions/{exhibition_id}", response_model=Exhibition)
async def update_exhibition(exhibition_id: str, payload: ExhibitionIn, admin=Depends(get_current_admin)):
    existing = await db.exhibitions.find_one({"id": exhibition_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Exhibition not found")
    update_doc = payload.model_dump()
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
        "City", "Country", "Exhibition", "Visit Date", "Message",
    ]
    ws.append(headers)
    for d in docs:
        ws.append([
            d.get("created_at", ""),
            d.get("full_name", ""),
            d.get("email", ""),
            d.get("dial_code", ""),
            d.get("phone", ""),
            d.get("city", ""),
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


api_router.include_router(admin_router)
app.include_router(api_router)

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
     "timings": "10:00 AM to 8:00 PM (Sunday Open)",
     "venue": "Lemon Tree Hotel", "address": "Banjara Hills, Hyderabad, Telangana", "order": 1},
    {"name": "Visakhapatnam", "type": "domestic", "status": "live",
     "image": "https://images.unsplash.com/photo-1606298855672-3efb63017be8?w=1200&q=80",
     "start_date": "2026-04-24", "end_date": "2026-04-26",
     "timings": "10:00 AM to 8:00 PM (Sunday Open)",
     "venue": "Dolphin Hotels", "address": "Dabagardens, Visakhapatnam, Andhra Pradesh", "order": 2},
    {"name": "Bengaluru",     "type": "domestic", "status": "live",
     "image": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&q=80",
     "start_date": "2026-04-23", "end_date": "2026-04-27",
     "timings": "10:00 AM to 8:00 PM (Sunday Open)",
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


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
