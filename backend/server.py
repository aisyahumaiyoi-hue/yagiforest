from fastapi import FastAPI, APIRouter, Depends, HTTPException, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
import jwt
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ.get("JWT_SECRET", "dev_secret")
JWT_ALG = "HS256"
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI(title="YAGI API")
api = APIRouter(prefix="/api")

# ----------------------------------------------------------------------------
# Static configuration (payment = manual bank transfer, feature flags, tiers)
# ----------------------------------------------------------------------------
BANK_ACCOUNT = {
    "bank": "BCA",
    "account_number": "1470 8899 021",
    "account_name": "PT YAGI Care Indonesia",
}
FEATURE_FLAGS = {
    "skin_analyzer_enabled": False,
    "skin_agent_enabled": False,
    "loyalty_enabled": True,
    "impact_dashboard_enabled": True,
    "routine_gamification_enabled": True,
    "require_auth_before_payment": True,
    "reviews_enabled": True,
}
TIERS = [
    {"key": "seed", "name": "Seed", "threshold": 0},
    {"key": "leaf", "name": "Leaf", "threshold": 500},
    {"key": "canopy", "name": "Canopy", "threshold": 2000},
    {"key": "forest", "name": "Forest", "threshold": 5000},
]
SHIPPING = {
    "regular": {"id": "regular", "name": "Regular delivery", "eta": "Arrives 24-26 Aug", "price": 18000},
    "express": {"id": "express", "name": "Express delivery", "eta": "Arrives 23 Aug", "price": 31000},
}

IMG = {
    "moist": "https://static.prod-images.emergentagent.com/jobs/cdf9bc84-3f03-4479-bb9d-15a09cf3bba4/images/87d1377bc3e6763e2767a7c0fbdc3e01bf6720d7fa00f34a9091f0c9c11f97c7.jpeg",
    "serum": "https://static.prod-images.emergentagent.com/jobs/cdf9bc84-3f03-4479-bb9d-15a09cf3bba4/images/e828293933353fc57b8ef17bd931d6cce7521eea3f51b26dcdaf1e83ef923a4c.jpeg",
    "balm": "https://static.prod-images.emergentagent.com/jobs/cdf9bc84-3f03-4479-bb9d-15a09cf3bba4/images/b6c3d8ed9e85a44480bec4b723a97637f02824f380b1d9c767b4a5957a498a01.jpeg",
}

# Server-authoritative catalog. Prices live here, never trusted from client.
CATALOG = [
    {"id": "p1", "slug": "calm-barrier-moisturizer", "name": "Calm Barrier Moisturizer", "short_name": "Barrier moisturizer",
     "category": "Face care", "skin_concerns": ["Dryness", "Skin barrier", "Sensitive skin"],
     "purpose": "Barrier support for dry, sensitive skin", "price": 189000, "image": IMG["moist"],
     "rating": 4.9, "review_count": 214, "lower_waste": True, "match_score": 92,
     "variants": [{"id": "30g", "label": "30 g", "price": 119000}, {"id": "60g", "label": "60 g", "price": 189000}, {"id": "refill", "label": "Refill", "price": 149000}]},
    {"id": "p2", "slug": "relief-repair-serum", "name": "Relief & Repair Serum", "short_name": "Relief serum",
     "category": "Face care", "skin_concerns": ["Redness", "Itching", "Sensitive skin"],
     "purpose": "Soothes redness and the urge to scratch", "price": 249000, "image": IMG["serum"],
     "rating": 4.8, "review_count": 168, "lower_waste": True, "match_score": 88,
     "variants": [{"id": "30ml", "label": "30 ml", "price": 249000}, {"id": "refill", "label": "Refill", "price": 199000}]},
    {"id": "p3", "slug": "soothing-healing-balm", "name": "Soothing Healing Balm", "short_name": "Healing balm",
     "category": "Body care", "skin_concerns": ["Dryness", "Itching", "Eczema care"],
     "purpose": "Intensive relief for dry, flare-prone patches", "price": 159000, "image": IMG["balm"],
     "rating": 4.9, "review_count": 302, "lower_waste": True, "match_score": 90,
     "variants": [{"id": "45g", "label": "45 g", "price": 159000}, {"id": "90g", "label": "90 g", "price": 269000}]},
    {"id": "p4", "slug": "signature-body-butter", "name": "YAGI Signature Body Butter", "short_name": "Body butter",
     "category": "Body care", "skin_concerns": ["Dryness", "Skin barrier", "Sensitive skin"],
     "purpose": "Rich moisture for dry, eczema-prone skin", "price": 129000, "image": IMG["moist"],
     "rating": 4.9, "review_count": 214, "lower_waste": True, "match_score": 94,
     "variants": [{"id": "60g", "label": "60 g", "price": 89000}, {"id": "200g", "label": "200 g", "price": 129000}, {"id": "refill", "label": "Refill", "price": 99000}]},
    {"id": "p5", "slug": "gentle-cleansing-bar", "name": "Gentle Cleansing Bar", "short_name": "Cleansing bar",
     "category": "Face care", "skin_concerns": ["Sensitive skin", "Skin barrier"],
     "purpose": "Soap-free cleansing that respects the barrier", "price": 89000, "image": IMG["balm"],
     "rating": 4.7, "review_count": 121, "lower_waste": True, "match_score": 85,
     "variants": [{"id": "90g", "label": "90 g", "price": 89000}]},
    {"id": "p6", "slug": "scalp-relief-shampoo", "name": "Scalp Relief Shampoo", "short_name": "Relief shampoo",
     "category": "Hair care", "skin_concerns": ["Itching", "Sensitive skin"],
     "purpose": "Calms an itchy, sensitive scalp", "price": 119000, "image": IMG["serum"],
     "rating": 4.6, "review_count": 88, "lower_waste": True, "match_score": 80,
     "variants": [{"id": "250ml", "label": "250 ml", "price": 119000}, {"id": "refill", "label": "Refill", "price": 95000}]},
]
CATALOG_BY_ID = {p["id"]: p for p in CATALOG}


def variant_price(product, variant_id):
    for v in product.get("variants", []):
        if v["id"] == variant_id:
            return v["price"], v["label"]
    v = product["variants"][0]
    return v["price"], v["label"]


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def tier_for(lifetime):
    current = TIERS[0]
    nxt = None
    for i, t in enumerate(TIERS):
        if lifetime >= t["threshold"]:
            current = t
            nxt = TIERS[i + 1] if i + 1 < len(TIERS) else None
    return current, nxt

# ----------------------------------------------------------------------------
# Auth helpers
# ----------------------------------------------------------------------------

def make_token(user_id, typ, email=None):
    payload = {"sub": user_id, "typ": typ, "email": email,
               "iat": datetime.now(timezone.utc), "exp": datetime.now(timezone.utc) + timedelta(days=30)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


async def identity(authorization: Optional[str] = Header(None)):
    """Resolve identity from Bearer token. Returns dict or None (public)."""
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    token = authorization.split(" ", 1)[1]
    try:
        data = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        return {"user_id": data["sub"], "typ": data.get("typ", "anonymous"), "email": data.get("email")}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def require_identity(ident=Depends(identity)):
    if not ident:
        raise HTTPException(status_code=401, detail="Authentication required")
    return ident


async def require_customer(ident=Depends(identity)):
    if not ident or ident["typ"] != "customer":
        raise HTTPException(status_code=401, detail="Please sign in to continue")
    return ident

# ----------------------------------------------------------------------------
# Models
# ----------------------------------------------------------------------------
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    display_name: Optional[str] = None
    anon_token: Optional[str] = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str
    anon_token: Optional[str] = None


class CartItemIn(BaseModel):
    product_id: str
    variant_id: Optional[str] = None
    qty: int = 1


class CartDeltaIn(BaseModel):
    product_id: str
    variant_id: Optional[str] = None
    delta: int


class CartRemoveIn(BaseModel):
    product_id: str
    variant_id: Optional[str] = None


class ToggleFavIn(BaseModel):
    product_id: str


class RoutineIn(BaseModel):
    steps: list


class QuoteIn(BaseModel):
    shipping_method: str = "regular"


class PlaceOrderIn(BaseModel):
    email: EmailStr
    phone: Optional[str] = ""
    full_name: str
    address: str
    city: str
    province: str
    postal_code: str
    shipping_method: str = "regular"


class ProfileIn(BaseModel):
    display_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None

# ----------------------------------------------------------------------------
# Cart service (server-authoritative)
# ----------------------------------------------------------------------------
async def get_cart_doc(user_id):
    doc = await db.carts.find_one({"user_id": user_id}, {"_id": 0})
    if not doc:
        doc = {"user_id": user_id, "items": [], "created_at": now_iso(), "updated_at": now_iso()}
        await db.carts.insert_one(dict(doc))
    return doc


def detail_cart(items):
    detailed = []
    subtotal = 0
    for it in items:
        product = CATALOG_BY_ID.get(it["product_id"])
        if not product:
            continue
        price, label = variant_price(product, it.get("variant_id"))
        line = price * it["qty"]
        subtotal += line
        detailed.append({
            "product_id": it["product_id"], "variant_id": it.get("variant_id"),
            "qty": it["qty"], "price": price, "line_total": line,
            "variant_label": label,
            "product": {"id": product["id"], "slug": product["slug"], "name": product["name"],
                        "short_name": product["short_name"], "image": product["image"],
                        "match_score": product["match_score"]},
        })
    count = sum(i["qty"] for i in items)
    return {"items": detailed, "subtotal": subtotal, "count": count}


async def save_cart(user_id, items):
    await db.carts.update_one({"user_id": user_id}, {"$set": {"items": items, "updated_at": now_iso()}}, upsert=True)

# ----------------------------------------------------------------------------
# Routes: config & catalog
# ----------------------------------------------------------------------------
@api.get("/")
async def root():
    return {"message": "YAGI API", "status": "ok"}


@api.get("/config")
async def config():
    return {"feature_flags": FEATURE_FLAGS, "bank_account": BANK_ACCOUNT, "tiers": TIERS,
            "shipping": list(SHIPPING.values())}


@api.get("/products")
async def products(q: str = "", concern: str = "", category: str = "", sort: str = "recommended",
                   limit: int = 50, skip: int = 0):
    items = list(CATALOG)
    if concern and concern != "For you":
        items = [p for p in items if concern in p["skin_concerns"]]
    if category and category != "All":
        items = [p for p in items if p["category"] == category]
    if q:
        ql = q.lower()
        items = [p for p in items if ql in p["name"].lower() or ql in p["purpose"].lower()
                 or any(ql in c.lower() for c in p["skin_concerns"])]
    if sort == "price_asc":
        items.sort(key=lambda x: x["price"])
    elif sort == "price_desc":
        items.sort(key=lambda x: -x["price"])
    elif sort == "best_selling":
        items.sort(key=lambda x: -x["review_count"])
    else:
        items.sort(key=lambda x: -x["match_score"])
    total = len(items)
    return {"items": items[skip:skip + limit], "total": total}


@api.get("/products/{slug}")
async def product_detail(slug: str):
    for p in CATALOG:
        if p["slug"] == slug:
            return p
    raise HTTPException(status_code=404, detail="Product not found")

# ----------------------------------------------------------------------------
# Routes: auth / identity
# ----------------------------------------------------------------------------
@api.post("/auth/anon")
async def auth_anon():
    uid = "anon_" + uuid.uuid4().hex
    return {"token": make_token(uid, "anonymous"), "identity": "anonymous", "user_id": uid}


async def _merge_from_anon(anon_token, customer_id):
    """Merge anonymous cart/favorites/routine into the customer's records."""
    if not anon_token:
        return
    try:
        data = jwt.decode(anon_token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.PyJWTError:
        return
    anon_id = data.get("sub")
    if not anon_id or anon_id == customer_id or not anon_id.startswith("anon_"):
        return
    # Cart merge (sum quantities, dedupe by product+variant)
    anon_cart = await db.carts.find_one({"user_id": anon_id}, {"_id": 0})
    if anon_cart and anon_cart.get("items"):
        cust = await get_cart_doc(customer_id)
        merged = {(i["product_id"], i.get("variant_id")): i["qty"] for i in cust.get("items", [])}
        for i in anon_cart["items"]:
            key = (i["product_id"], i.get("variant_id"))
            merged[key] = merged.get(key, 0) + i["qty"]
        items = [{"product_id": k[0], "variant_id": k[1], "qty": v} for k, v in merged.items()]
        await save_cart(customer_id, items)
        await db.carts.delete_one({"user_id": anon_id})
    # Favorites union
    anon_fav = await db.favorites.find_one({"user_id": anon_id}, {"_id": 0})
    if anon_fav and anon_fav.get("product_ids"):
        cust_fav = await db.favorites.find_one({"user_id": customer_id}, {"_id": 0}) or {"product_ids": []}
        union = list(set(cust_fav.get("product_ids", [])) | set(anon_fav["product_ids"]))
        await db.favorites.update_one({"user_id": customer_id}, {"$set": {"product_ids": union}}, upsert=True)
        await db.favorites.delete_one({"user_id": anon_id})
    # Routine: adopt anon draft only if customer has none
    anon_routine = await db.routines.find_one({"user_id": anon_id}, {"_id": 0})
    if anon_routine and anon_routine.get("steps"):
        cust_routine = await db.routines.find_one({"user_id": customer_id}, {"_id": 0})
        if not cust_routine or not cust_routine.get("steps"):
            await db.routines.update_one({"user_id": customer_id}, {"$set": {"steps": anon_routine["steps"]}}, upsert=True)
        await db.routines.delete_one({"user_id": anon_id})


async def _user_public(user):
    la = await db.loyalty_accounts.find_one({"user_id": user["id"]}, {"_id": 0}) or {"lifetime_points": 0, "available_points": 0}
    tier, _ = tier_for(la.get("lifetime_points", 0))
    return {"id": user["id"], "email": user["email"], "display_name": user.get("display_name"),
            "first_name": user.get("first_name"), "last_name": user.get("last_name"),
            "phone": user.get("phone"), "member_code": user.get("member_code"),
            "tier": tier["name"], "points": la.get("available_points", 0)}


@api.post("/auth/register")
async def register(body: RegisterIn):
    existing = await db.users.find_one({"email": body.email.lower()})
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists. Try signing in.")
    uid = "cust_" + uuid.uuid4().hex
    user = {"id": uid, "email": body.email.lower(), "password_hash": pwd.hash(body.password),
            "display_name": body.display_name or body.email.split("@")[0],
            "member_code": "YG-" + uuid.uuid4().hex[:6].upper(),
            "is_permanent": True, "created_at": now_iso(), "updated_at": now_iso()}
    await db.users.insert_one(dict(user))
    await db.loyalty_accounts.insert_one({"user_id": uid, "available_points": 0, "pending_points": 0,
                                          "lifetime_points": 0, "updated_at": now_iso()})
    await _merge_from_anon(body.anon_token, uid)
    return {"token": make_token(uid, "customer", user["email"]), "user": await _user_public(user)}


@api.post("/auth/login")
async def login(body: LoginIn):
    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not pwd.verify(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    await _merge_from_anon(body.anon_token, user["id"])
    return {"token": make_token(user["id"], "customer", user["email"]), "user": await _user_public(user)}


@api.get("/auth/me")
async def me(ident=Depends(identity)):
    if not ident:
        return {"identity": "public", "user": None}
    if ident["typ"] == "anonymous":
        return {"identity": "anonymous", "user": None}
    user = await db.users.find_one({"id": ident["user_id"]}, {"_id": 0})
    if not user:
        return {"identity": "public", "user": None}
    return {"identity": "customer", "user": await _user_public(user)}

# ----------------------------------------------------------------------------
# Routes: cart
# ----------------------------------------------------------------------------
@api.get("/cart")
async def get_cart(ident=Depends(require_identity)):
    doc = await get_cart_doc(ident["user_id"])
    return detail_cart(doc.get("items", []))


@api.post("/cart/items")
async def add_item(body: CartItemIn, ident=Depends(require_identity)):
    product = CATALOG_BY_ID.get(body.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    variant_id = body.variant_id or product["variants"][0]["id"]
    doc = await get_cart_doc(ident["user_id"])
    items = doc.get("items", [])
    for it in items:
        if it["product_id"] == body.product_id and it.get("variant_id") == variant_id:
            it["qty"] += max(1, body.qty)
            break
    else:
        items.append({"product_id": body.product_id, "variant_id": variant_id, "qty": max(1, body.qty)})
    await save_cart(ident["user_id"], items)
    return detail_cart(items)


@api.patch("/cart/items")
async def update_item(body: CartDeltaIn, ident=Depends(require_identity)):
    doc = await get_cart_doc(ident["user_id"])
    items = doc.get("items", [])
    for it in items:
        if it["product_id"] == body.product_id and it.get("variant_id") == body.variant_id:
            it["qty"] += body.delta
            break
    items = [i for i in items if i["qty"] > 0]
    await save_cart(ident["user_id"], items)
    return detail_cart(items)


@api.delete("/cart/items")
async def remove_item(body: CartRemoveIn, ident=Depends(require_identity)):
    doc = await get_cart_doc(ident["user_id"])
    items = [i for i in doc.get("items", []) if not (i["product_id"] == body.product_id and i.get("variant_id") == body.variant_id)]
    await save_cart(ident["user_id"], items)
    return detail_cart(items)

# ----------------------------------------------------------------------------
# Routes: favorites
# ----------------------------------------------------------------------------
@api.get("/favorites")
async def get_favorites(ident=Depends(require_identity)):
    doc = await db.favorites.find_one({"user_id": ident["user_id"]}, {"_id": 0})
    return {"product_ids": doc.get("product_ids", []) if doc else []}


@api.post("/favorites/toggle")
async def toggle_favorite(body: ToggleFavIn, ident=Depends(require_identity)):
    doc = await db.favorites.find_one({"user_id": ident["user_id"]}, {"_id": 0}) or {"product_ids": []}
    ids = set(doc.get("product_ids", []))
    if body.product_id in ids:
        ids.remove(body.product_id)
    else:
        ids.add(body.product_id)
    await db.favorites.update_one({"user_id": ident["user_id"]}, {"$set": {"product_ids": list(ids)}}, upsert=True)
    return {"product_ids": list(ids)}

# ----------------------------------------------------------------------------
# Routes: routine
# ----------------------------------------------------------------------------
@api.get("/routine")
async def get_routine(ident=Depends(require_identity)):
    doc = await db.routines.find_one({"user_id": ident["user_id"]}, {"_id": 0})
    return {"steps": doc.get("steps", []) if doc else []}


@api.put("/routine")
async def put_routine(body: RoutineIn, ident=Depends(require_identity)):
    await db.routines.update_one({"user_id": ident["user_id"]},
                                 {"$set": {"steps": body.steps, "updated_at": now_iso()}}, upsert=True)
    return {"steps": body.steps}

# ----------------------------------------------------------------------------
# Routes: checkout & orders
# ----------------------------------------------------------------------------
@api.post("/checkout/quote")
async def checkout_quote(body: QuoteIn, ident=Depends(require_identity)):
    doc = await get_cart_doc(ident["user_id"])
    detail = detail_cart(doc.get("items", []))
    if not detail["items"]:
        raise HTTPException(status_code=400, detail="Your bag is empty")
    ship = SHIPPING.get(body.shipping_method, SHIPPING["regular"])["price"]
    return {"subtotal": detail["subtotal"], "shipping": ship, "discount": 0,
            "total": detail["subtotal"] + ship, "count": detail["count"]}


@api.post("/orders")
async def place_order(body: PlaceOrderIn, ident=Depends(require_customer)):
    doc = await get_cart_doc(ident["user_id"])
    detail = detail_cart(doc.get("items", []))
    if not detail["items"]:
        raise HTTPException(status_code=400, detail="Your bag is empty")
    ship = SHIPPING.get(body.shipping_method, SHIPPING["regular"])
    subtotal = detail["subtotal"]
    total = subtotal + ship["price"]
    order_number = "YG-" + datetime.now().strftime("%y%m%d") + "-" + uuid.uuid4().hex[:4].upper()
    points_earned = total // 1000  # 1 point per Rp1.000, server-computed
    lower_waste_items = sum(1 for i in detail["items"] if CATALOG_BY_ID.get(i["product_id"], {}).get("lower_waste"))

    order = {
        "order_number": order_number, "user_id": ident["user_id"],
        "status": "pending", "payment_status": "awaiting_transfer", "fulfillment_status": "unfulfilled",
        "currency": "IDR", "subtotal": subtotal, "shipping_total": ship["price"], "discount_total": 0,
        "grand_total": total,
        "items": [{"product_id": i["product_id"], "variant_id": i["variant_id"], "name": i["product"]["name"],
                    "short_name": i["product"]["short_name"], "image": i["product"]["image"],
                    "variant_label": i["variant_label"], "unit_price": i["price"], "qty": i["qty"],
                    "line_total": i["line_total"]} for i in detail["items"]],
        "shipping_method": ship["name"], "shipping_eta": ship["eta"],
        "contact": {"email": body.email, "phone": body.phone},
        "shipping_address": {"full_name": body.full_name, "address": body.address, "city": body.city,
                              "province": body.province, "postal_code": body.postal_code},
        "bank_account": BANK_ACCOUNT,
        "impact": {"lower_waste_items": lower_waste_items, "plastic_avoided": lower_waste_items},
        "points_earned": points_earned,
        "placed_at": now_iso(), "created_at": now_iso(), "updated_at": now_iso(),
    }
    await db.orders.insert_one(dict(order))

    # Immutable loyalty ledger entry (pending until payment confirmed). Server-only.
    await db.loyalty_ledger.insert_one({
        "id": uuid.uuid4().hex, "user_id": ident["user_id"], "event_type": "purchase",
        "points_delta": points_earned, "status": "pending", "order_number": order_number,
        "created_at": now_iso(),
    })
    la = await db.loyalty_accounts.find_one({"user_id": ident["user_id"]}, {"_id": 0}) or {"available_points": 0, "pending_points": 0, "lifetime_points": 0}
    await db.loyalty_accounts.update_one(
        {"user_id": ident["user_id"]},
        {"$set": {"pending_points": la.get("pending_points", 0) + points_earned, "updated_at": now_iso()}},
        upsert=True,
    )
    # Impact ledger
    await db.impact_ledger.insert_one({
        "id": uuid.uuid4().hex, "user_id": ident["user_id"], "order_number": order_number,
        "plastic_avoided": lower_waste_items, "created_at": now_iso(),
    })

    await save_cart(ident["user_id"], [])  # cart converted
    order.pop("_id", None)
    return order


@api.get("/orders")
async def list_orders(ident=Depends(require_customer)):
    orders = await db.orders.find({"user_id": ident["user_id"]}, {"_id": 0}).sort("placed_at", -1).to_list(100)
    return {"items": orders}


@api.get("/orders/{order_number}")
async def order_detail(order_number: str, ident=Depends(require_customer)):
    order = await db.orders.find_one({"order_number": order_number, "user_id": ident["user_id"]}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

# ----------------------------------------------------------------------------
# Routes: loyalty & profile
# ----------------------------------------------------------------------------
@api.get("/loyalty")
async def loyalty(ident=Depends(require_customer)):
    la = await db.loyalty_accounts.find_one({"user_id": ident["user_id"]}, {"_id": 0}) or {"available_points": 0, "pending_points": 0, "lifetime_points": 0}
    ledger = await db.loyalty_ledger.find({"user_id": ident["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    tier, nxt = tier_for(la.get("lifetime_points", 0))
    impact = await db.impact_ledger.find({"user_id": ident["user_id"]}, {"_id": 0}).to_list(200)
    plastic = sum(i.get("plastic_avoided", 0) for i in impact)
    return {"available": la.get("available_points", 0), "pending": la.get("pending_points", 0),
            "lifetime": la.get("lifetime_points", 0), "tier": tier["name"],
            "next_tier": nxt["name"] if nxt else None,
            "points_to_next": (nxt["threshold"] - la.get("lifetime_points", 0)) if nxt else 0,
            "ledger": ledger, "impact": {"plastic_avoided": plastic, "purchases": len(impact)}}


@api.get("/profile")
async def get_profile(ident=Depends(require_customer)):
    user = await db.users.find_one({"id": ident["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Profile not found")
    return await _user_public(user)


@api.put("/profile")
async def update_profile(body: ProfileIn, ident=Depends(require_customer)):
    upd = {k: v for k, v in body.model_dump().items() if v is not None}
    upd["updated_at"] = now_iso()
    await db.users.update_one({"id": ident["user_id"]}, {"$set": upd})
    user = await db.users.find_one({"id": ident["user_id"]}, {"_id": 0})
    return await _user_public(user)


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
