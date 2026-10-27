"""HS Timber Works inquiry API."""

from __future__ import annotations

import json
import secrets
import sqlite3
from pathlib import Path

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

DB_PATH = Path("data/timber.db")
ADMIN_PASSWORD = "workshop"
TOKENS: set[str] = set()

SEED = [
    {
        "sku": "HS-TBL-01",
        "name": "Mango Dining Table",
        "category": "Tables",
        "wood": "Mango",
        "summary": "A long solid table for daily service and wholesale dining ranges.",
        "description": "Cut from kiln-dried mango, with a quiet grain and a matte oil finish. Built for restaurants, showrooms, and household orders in quantity. Legs are mortised; the top is book-matched where the log allows.",
        "images": ["/media/table.jpg", "/media/grain.jpg"],
    },
    {
        "sku": "HS-CHR-01",
        "name": "Cane Armchair",
        "category": "Seating",
        "wood": "Mango",
        "summary": "A light armchair with woven cane and visible joinery.",
        "description": "Frame in mango, seat and back in hand-woven cane. Suitable for cafés and retail floors that need a repeatable chair rather than a one-off. We quote by the dozen and by the hundred.",
        "images": ["/media/chair.jpg", "/media/chair-detail.jpg"],
    },
    {
        "sku": "HS-TBL-02",
        "name": "Low Coffee Table",
        "category": "Tables",
        "wood": "Mango",
        "summary": "A low table with a calm top and squared edges.",
        "description": "A compact table for lounges and hospitality suites. The top is a single slab or a careful glue-up, finished with hardwax oil. Dimensions can be adjusted for a project.",
        "images": ["/media/coffee.jpg", "/media/grain.jpg"],
    },
    {
        "sku": "HS-CAB-01",
        "name": "Sideboard",
        "category": "Storage",
        "wood": "Mango",
        "summary": "A long cabinet with brass pulls and two banks of drawers.",
        "description": "Interior in the same timber as the face. Drawers run on wooden slides. Made for homes, boutique hotels, and office reception rooms. Bulk finishes are quoted after a sample approval.",
        "images": ["/media/sideboard.jpg", "/media/workshop.jpg"],
    },
    {
        "sku": "HS-TBL-03",
        "name": "Conference Table",
        "category": "Institutional",
        "wood": "Mango",
        "summary": "A meeting table scaled for offices and institutions.",
        "description": "A longer top on a simple trestle, specified for board rooms, schools, and co-working floors. Cable cut-outs and extension leaves are available on request. We manufacture to a drawing.",
        "images": ["/media/conference.jpg", "/media/table.jpg"],
    },
    {
        "sku": "HS-TOY-01",
        "name": "Carved Play Set",
        "category": "Objects",
        "wood": "Mango",
        "summary": "Small carved animals and blocks, finished for children.",
        "description": "Solid mango, sanded smooth and finished with a food-safe oil. Sold as sets for retailers and as larger lots for schools and gift programmes. Shapes can be adapted to a brief.",
        "images": ["/media/toys.jpg", "/media/grain.jpg"],
    },
]


def connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with connect() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS products (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              sku TEXT UNIQUE NOT NULL,
              name TEXT NOT NULL,
              category TEXT NOT NULL,
              wood TEXT NOT NULL,
              summary TEXT NOT NULL,
              description TEXT NOT NULL,
              images TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS inquiries (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              mobile TEXT NOT NULL,
              address TEXT NOT NULL,
              pincode TEXT NOT NULL,
              company TEXT NOT NULL DEFAULT '',
              notes TEXT NOT NULL DEFAULT '',
              items TEXT NOT NULL,
              status TEXT NOT NULL DEFAULT 'new',
              created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
            """
        )
        count = conn.execute("SELECT COUNT(*) AS c FROM products").fetchone()["c"]
        if count == 0:
            for item in SEED:
                conn.execute(
                    """INSERT INTO products (sku, name, category, wood, summary, description, images)
                       VALUES (?, ?, ?, ?, ?, ?, ?)""",
                    (
                        item["sku"],
                        item["name"],
                        item["category"],
                        item["wood"],
                        item["summary"],
                        item["description"],
                        json.dumps(item["images"]),
                    ),
                )


def require_admin(authorization: str | None) -> None:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Workshop sign-in required")
    token = authorization.removeprefix("Bearer ").strip()
    if token not in TOKENS:
        raise HTTPException(status_code=401, detail="Workshop sign-in required")


class LoginBody(BaseModel):
    password: str


class ProductIn(BaseModel):
    sku: str
    name: str
    category: str
    wood: str = "Mango"
    summary: str
    description: str
    images: list[str] = Field(default_factory=lambda: ["/media/grain.jpg"])


class InquiryItem(BaseModel):
    sku: str
    name: str
    quantity: int = Field(ge=1)
    notes: str = ""


class InquiryIn(BaseModel):
    name: str
    mobile: str
    address: str
    pincode: str
    company: str = ""
    notes: str = ""
    items: list[InquiryItem]


class StatusIn(BaseModel):
    status: str


app = FastAPI(title="HS Timber Works")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    init_db()


def product_dict(row: sqlite3.Row) -> dict:
    data = dict(row)
    data["images"] = json.loads(data["images"])
    return data


@app.get("/timber-api/health")
def health() -> dict:
    return {"ok": True}


@app.post("/timber-api/admin/login")
def login(body: LoginBody) -> dict:
    if body.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Incorrect workshop key")
    token = secrets.token_urlsafe(24)
    TOKENS.add(token)
    return {"token": token}


@app.get("/timber-api/products")
def list_products() -> list[dict]:
    with connect() as conn:
        rows = conn.execute("SELECT * FROM products ORDER BY id").fetchall()
    return [product_dict(row) for row in rows]


@app.get("/timber-api/products/{product_id}")
def get_product(product_id: int) -> dict:
    with connect() as conn:
        row = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    return product_dict(row)


@app.post("/timber-api/products")
def add_product(body: ProductIn, authorization: str | None = Header(default=None)) -> dict:
    require_admin(authorization)
    with connect() as conn:
        try:
            cur = conn.execute(
                """INSERT INTO products (sku, name, category, wood, summary, description, images)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (
                    body.sku,
                    body.name,
                    body.category,
                    body.wood,
                    body.summary,
                    body.description,
                    json.dumps(body.images),
                ),
            )
        except sqlite3.IntegrityError as exc:
            raise HTTPException(status_code=409, detail="That product id is already used") from exc
        row = conn.execute("SELECT * FROM products WHERE id = ?", (cur.lastrowid,)).fetchone()
    return product_dict(row)


@app.delete("/timber-api/products/{product_id}")
def delete_product(product_id: int, authorization: str | None = Header(default=None)) -> dict:
    require_admin(authorization)
    with connect() as conn:
        conn.execute("DELETE FROM products WHERE id = ?", (product_id,))
    return {"ok": True}


@app.post("/timber-api/inquiries")
def create_inquiry(body: InquiryIn) -> dict:
    if not body.items:
        raise HTTPException(status_code=400, detail="Add at least one item")
    with connect() as conn:
        cur = conn.execute(
            """INSERT INTO inquiries (name, mobile, address, pincode, company, notes, items)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                body.name.strip(),
                body.mobile.strip(),
                body.address.strip(),
                body.pincode.strip(),
                body.company.strip(),
                body.notes.strip(),
                json.dumps([item.model_dump() for item in body.items]),
            ),
        )
        inquiry_id = cur.lastrowid
    return {"id": inquiry_id}


@app.get("/timber-api/inquiries")
def list_inquiries(authorization: str | None = Header(default=None)) -> list[dict]:
    require_admin(authorization)
    with connect() as conn:
        rows = conn.execute("SELECT * FROM inquiries ORDER BY id DESC").fetchall()
    result = []
    for row in rows:
        data = dict(row)
        data["items"] = json.loads(data["items"])
        result.append(data)
    return result


@app.patch("/timber-api/inquiries/{inquiry_id}")
def update_status(
    inquiry_id: int,
    body: StatusIn,
    authorization: str | None = Header(default=None),
) -> dict:
    require_admin(authorization)
    allowed = {"new", "quoted", "making", "delivered"}
    if body.status not in allowed:
        raise HTTPException(status_code=400, detail="Unknown status")
    with connect() as conn:
        conn.execute("UPDATE inquiries SET status = ? WHERE id = ?", (body.status, inquiry_id))
    return {"ok": True}
