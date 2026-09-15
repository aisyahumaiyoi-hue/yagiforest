import os
import base64
import subprocess
import sys
import time
import uuid
from pathlib import Path

import pytest
import requests
from pymongo import MongoClient
from backend.safety import validate_test_database_target


ROOT = Path(__file__).resolve().parents[1]
PORT = 8012
BASE = f"http://127.0.0.1:{PORT}/api"
DB_NAME = f"yagi_phase4_test_{uuid.uuid4().hex[:10]}"


def call(method, path, token=None, expected=None, **kwargs):
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    response = requests.request(method, BASE + path, headers=headers, timeout=15, **kwargs)
    if expected is not None:
        assert response.status_code == expected, response.text
    return response


@pytest.fixture(scope="module")
def app_server():
    env = os.environ.copy()
    env.update({
        "MONGO_URL": "mongodb://127.0.0.1:27017",
        "DB_NAME": DB_NAME,
        "APP_ENV": "development",
        "JWT_SECRET": "phase4-test-secret",
        "SUPERADMIN_EMAILS": "admin@example.com",
        "SHITERU_API_KEY": "",
        "SEED_DEMO_DATA": "0",
        "AUTH_REGISTER_ATTEMPTS_PER_HOUR": "100",
    })
    validate_test_database_target(env["MONGO_URL"], env["DB_NAME"], env["APP_ENV"])
    process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "server:app", "--host", "127.0.0.1", "--port", str(PORT)],
        cwd=ROOT / "backend", env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
    )
    try:
        for _ in range(80):
            try:
                if requests.get(BASE + "/", timeout=1).ok:
                    break
            except requests.RequestException:
                time.sleep(0.25)
        else:
            output = process.stdout.read().decode(errors="replace")
            raise AssertionError(f"test backend did not start: {output}")
        response = requests.post(BASE + "/auth/register", json={
            "email": "admin@example.com", "password": "StrongPass123!", "display_name": "Admin",
        }, timeout=15)
        assert response.status_code == 200, response.text
        yield process
    finally:
        process.terminate()
        process.wait(timeout=10)
        validate_test_database_target(env["MONGO_URL"], env["DB_NAME"], env["APP_ENV"])
        MongoClient("mongodb://127.0.0.1:27017").drop_database(DB_NAME)


@pytest.fixture
def users(app_server):
    suffix = uuid.uuid4().hex[:8]
    customers = []
    for name in ("customer-a", "customer-b"):
        response = call("POST", "/auth/register", auth=False, json={
            "email": f"{name}-{suffix}@example.com", "password": "StrongPass123!",
            "display_name": name,
        })
        assert response.status_code == 200, response.text
        customers.append(response.json())
    return customers


def token(auth_response):
    return auth_response["token"]


def customer_order(user_token, reward_id=None, key=None, add_to_cart=True):
    if add_to_cart:
        call("POST", "/cart/items", user_token, 200, json={"product_id": "p1", "variant_id": "30g", "qty": 1})
    body = {
        "email": "customer-a@example.com", "phone": "081234567890", "full_name": "Customer A",
        "address": "Jl. Test 1", "city": "Jakarta", "province": "DKI Jakarta",
        "postal_code": "12345", "shipping_method": "regular", "idempotency_key": key,
    }
    if reward_id:
        body["reward_id"] = reward_id
    response = call("POST", "/orders", user_token, 200, json=body)
    return response.json()


def test_checkout_authority_and_reward_redemption_idempotency(app_server, users):
    user_token = token(users[0])
    db = MongoClient("mongodb://127.0.0.1:27017")[DB_NAME]
    db.loyalty_accounts.update_one({"user_id": users[0]["user"]["id"]}, {"$set": {"available_points": 500}}, upsert=True)

    redeemed = call("POST", "/rewards/redeem", user_token, 200, json={"reward_id": "rw_voucher_20", "idempotency_key": "same-key"}).json()
    repeated = call("POST", "/rewards/redeem", user_token, 200, json={"reward_id": "rw_voucher_20", "idempotency_key": "same-key"}).json()
    assert repeated["redemption_id"] == redeemed["redemption_id"]
    assert db.loyalty_accounts.find_one({"user_id": users[0]["user"]["id"]})["available_points"] == 0

    call("POST", "/cart/items", user_token, 200, json={"product_id": "p1", "variant_id": "30g", "qty": 1})
    quote = call("POST", "/checkout/quote", user_token, expected=404, json={"shipping_method": "regular", "reward_id": redeemed["redemption_id"]})
    quote = call("POST", "/checkout/quote", user_token, expected=200, json={"shipping_method": "regular", "reward_id": "rw_voucher_20"}).json()
    assert quote["total"] == quote["subtotal"] + quote["shipping"] - quote["discount"]
    assert "total" not in quote or quote["total"] >= 0


def test_cross_user_ownership_and_review_truth(app_server, users):
    a, b = map(token, users)
    order = customer_order(a, key="order-a")
    assert call("GET", f"/orders/{order['order_number']}", b, 404).status_code == 404
    assert call("POST", f"/orders/{order['order_number']}/routine", b, 404, json={"product_id": "p1"}).status_code == 404
    assert call("POST", "/reviews", b, 404, json={"order_number": order["order_number"], "product_id": "p1", "rating": 5}).status_code == 404
    assert call("POST", "/reviews", a, 400, json={"order_number": order["order_number"], "product_id": "p1", "rating": 5}).status_code == 400


def test_payment_proof_is_owned_validated_and_not_payment_confirmation(app_server, users):
    a, b = map(token, users)
    order = customer_order(a, key="proof-order")
    number = order["order_number"]
    png = base64.b64encode(
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    ).decode()
    valid_proof = f"data:image/png;base64,{png}"

    call("POST", f"/orders/{number}/proof", b, 404, json={"image_data": valid_proof})
    fake_png = base64.b64encode(b"not-a-real-png-file-but-long-enough-to-parse").decode()
    call("POST", f"/orders/{number}/proof", a, 400, json={"image_data": f"data:image/png;base64,{fake_png}"})
    submitted = call("POST", f"/orders/{number}/proof", a, 200, json={"image_data": valid_proof}).json()
    assert submitted["payment_status"] == "under_review"
    assert submitted["payment_status"] != "paid"


def test_health_and_security_headers_are_public_and_safe(app_server):
    response = call("GET", "/health", auth=False, expected=200)
    assert response.json()["service"] == "yagi-api"
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert "frame-ancestors 'none'" in response.headers["Content-Security-Policy"]


def test_cross_user_reward_loyalty_checkin_and_ai_isolation(app_server, users):
    a, b = map(token, users)
    db = MongoClient("mongodb://127.0.0.1:27017")[DB_NAME]
    a_id, b_id = users[0]["user"]["id"], users[1]["user"]["id"]
    db.loyalty_accounts.update_one({"user_id": a_id}, {"$set": {"available_points": 500}}, upsert=True)
    reward = call("POST", "/rewards/redeem", a, 200, json={"reward_id": "rw_voucher_20", "idempotency_key": "a-reward"}).json()

    # Customer B may neither see nor apply Customer A's issued entitlement.
    b_rewards = call("GET", "/rewards", b, 200).json()
    assert not b_rewards["items"]
    call("POST", "/cart/items", b, 200, json={"product_id": "p1", "variant_id": "30g", "qty": 1})
    rejected = call("POST", "/checkout/quote", b, 400, json={"shipping_method": "regular", "reward_id": "rw_voucher_20"})
    assert "not available" in rejected.json()["detail"].lower()
    assert db.reward_redemptions.find_one({"id": reward["redemption_id"]})["status"] == "issued"

    # Care state and conversations are read from the validated bearer identity.
    db.care_checkins.insert_one({"id": "b-checkin", "user_id": b_id, "check_in_date": "2026-09-01", "overall_feeling": "DRIER", "created_at": "2026-09-01T00:00:00+00:00"})
    a_checkins = call("GET", "/care/checkins", a, 200).json()
    assert all(item.get("id") != "b-checkin" for item in a_checkins["items"])
    b_chat = call("POST", "/ai/chat", b, 200, json={"message": "my face is swelling and I cannot breathe", "context_type": "general"}).json()
    a_chat = call("POST", "/ai/chat", a, 200, json={"message": "my face is swelling and I cannot breathe", "conversation_id": b_chat["conversation_id"], "context_type": "general"}).json()
    assert a_chat["conversation_id"] != b_chat["conversation_id"]
    assert call("GET", f"/ai/conversations/{b_chat['conversation_id']}", a, 404).status_code == 404


def test_full_reward_checkout_journey(app_server, users):
    a = token(users[0])
    db = MongoClient("mongodb://127.0.0.1:27017")[DB_NAME]
    uid = users[0]["user"]["id"]
    db.loyalty_accounts.update_one({"user_id": uid}, {"$set": {"available_points": 500}}, upsert=True)
    redeemed = call("POST", "/rewards/redeem", a, 200,
                    json={"reward_id": "rw_voucher_20", "idempotency_key": "journey-key"}).json()
    call("POST", "/cart/items", a, 200,
         json={"product_id": "p1", "variant_id": "30g", "qty": 1})
    quote = call("POST", "/checkout/quote", a, 200,
                 json={"shipping_method": "regular", "reward_id": "rw_voucher_20"}).json()
    order = customer_order(a, reward_id="rw_voucher_20", key="reward-order", add_to_cart=False)
    assert order["grand_total"] == quote["total"]
    assert order["discount_total"] == quote["discount"]
    assert order["reward"]["redemption_id"] == redeemed["redemption_id"]
    stored = db.orders.find_one({"order_number": order["order_number"]})
    redemption = db.reward_redemptions.find_one({"id": redeemed["redemption_id"]})
    assert stored["grand_total"] == order["grand_total"]
    assert redemption["status"] == "used"


def test_paid_order_release_is_idempotent_and_review_is_verified(app_server, users):
    a = token(users[0])
    admin = call("POST", "/auth/login", auth=False, json={"email": "admin@example.com", "password": "StrongPass123!"}).json()
    order = customer_order(a, key="paid-order")
    order_number = order["order_number"]
    first = call("POST", "/superadmin/orders/approve", token(admin), 200, json={"order_number": order_number}).json()
    second = call("POST", "/superadmin/orders/approve", token(admin), 200, json={"order_number": order_number}).json()
    assert first["ok"] and second["already"]
    db = MongoClient("mongodb://127.0.0.1:27017")[DB_NAME]
    assert db.orders.count_documents({"order_number": order_number, "payment_status": "paid"}) == 1
    assert db.loyalty_ledger.count_documents({"order_number": order_number, "event_type": "purchase"}) == 1
    assert db.impact_ledger.count_documents({"order_number": order_number, "status": "released"}) == 1

    review = call("POST", "/reviews", a, 200, json={"order_number": order_number, "product_id": "p1", "rating": 5, "body": "Good"}).json()
    assert review["verified_purchase"] is True
    assert call("POST", "/reviews", a, 409, json={"order_number": order_number, "product_id": "p1", "rating": 5}).status_code == 409
    assert call("GET", "/reviews/product/p1", auth=False).json()["count"] == 1


def test_routine_reorder_and_safety(app_server, users):
    a = token(users[0])
    order = customer_order(a, key="routine-order")
    admin = call("POST", "/auth/login", auth=False, json={"email": "admin@example.com", "password": "StrongPass123!"})
    call("POST", "/superadmin/orders/approve", token(admin.json()), 200, json={"order_number": order["order_number"]})
    routine = call("POST", f"/orders/{order['order_number']}/routine", a, 200, json={"product_id": "p1"}).json()
    assert any(step["productId"] == "p1" for step in routine["steps"])
    reorder = call("GET", "/orders/reorderable", a, 200).json()
    item = next(i for i in reorder["items"] if i["order_number"] == order["order_number"])
    assert item["available"] and item["current_price"] == 119000
    safety = call("POST", "/ai/chat", a, 200, json={"message": "my face is swelling and I cannot breathe", "context_type": "general"}).json()
    assert safety["safety"]["level"] == "URGENT"
    assert "purchase" not in safety["answer"].lower()


def test_reward_orphan_recovery_reorder_matrix_and_review_moderation(app_server, users):
    a, b = map(token, users)
    db = MongoClient("mongodb://127.0.0.1:27017")[DB_NAME]
    a_id = users[0]["user"]["id"]
    admin = call("POST", "/auth/login", auth=False, json={"email": "admin@example.com", "password": "StrongPass123!"}).json()

    # A reservation without an order is lazily restored to issued before use.
    db.reward_redemptions.insert_one({"id": "orphan-reward", "user_id": a_id, "reward_id": "rw_voucher_20", "status": "reserved", "reservation_order_number": "YG-ORPHAN", "created_at": "2026-01-01T00:00:00+00:00"})
    rewards = call("GET", "/rewards", a, 200).json()
    assert all(item["redemption_id"] != "orphan-reward" for item in rewards["items"])
    # Recovery is triggered by the normal owned-reward lookup, and returns a usable entitlement.
    call("POST", "/cart/items", a, 200, json={"product_id": "p1", "variant_id": "30g", "qty": 1})
    call("POST", "/checkout/quote", a, 200, json={"shipping_method": "regular", "reward_id": "rw_voucher_20"})
    assert db.reward_redemptions.find_one({"id": "orphan-reward"})["status"] == "issued"

    order = customer_order(a, key="matrix-order", add_to_cart=False)
    call("POST", "/superadmin/orders/approve", token(admin), 200, json={"order_number": order["order_number"]})
    available = next(i for i in call("GET", "/orders/reorderable", a, 200).json()["items"] if i["order_number"] == order["order_number"])
    assert available["available"] and available["current_price"] == 119000
    # Reorder endpoint must never expose Customer A's paid order to Customer B.
    assert all(i["order_number"] != order["order_number"] for i in call("GET", "/orders/reorderable", b, 200).json()["items"])

    review = call("POST", "/reviews", a, 200, json={"order_number": order["order_number"], "product_id": "p1", "rating": 5, "body": "Controlled review"}).json()
    before_hide = call("GET", "/reviews/product/p1", auth=False, expected=200).json()["count"]
    assert before_hide >= 1
    call("PATCH", f"/superadmin/reviews/{review['id']}", token(admin), 200, json={"status": "hidden"})
    assert call("GET", "/reviews/product/p1", auth=False, expected=200).json()["count"] == before_hide - 1
    assert db.reviews.find_one({"id": review["id"]})["status"] == "hidden"
