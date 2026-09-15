import os
import subprocess
import sys
import time
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest
import requests
from pymongo import MongoClient
from backend.safety import validate_test_database_target


ROOT = Path(__file__).resolve().parents[1]
PORT = 8015
BASE = f"http://127.0.0.1:{PORT}/api"
DB_NAME = f"yagi_evidence_test_{uuid.uuid4().hex[:10]}"


@pytest.fixture(scope="module")
def app_server():
    env = os.environ.copy()
    env.update({
        "MONGO_URL": "mongodb://127.0.0.1:27017", "DB_NAME": DB_NAME,
        "APP_ENV": "development", "JWT_SECRET": "evidence-test-secret",
        "SEED_DEMO_DATA": "0", "SHITERU_API_KEY": "",
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
            raise AssertionError(process.stdout.read().decode(errors="replace"))
        yield MongoClient("mongodb://127.0.0.1:27017")[DB_NAME]
    finally:
        process.terminate()
        process.wait(timeout=10)
        validate_test_database_target(env["MONGO_URL"], env["DB_NAME"], env["APP_ENV"])
        MongoClient("mongodb://127.0.0.1:27017").drop_database(DB_NAME)


@pytest.fixture(autouse=True)
def clear_evidence_collections(app_server):
    for name in ("orders", "care_checkins", "routine_activity", "phase4_events", "ai_conversations", "ai_messages", "reviews", "impact_ledger"):
        app_server[name].delete_many({})


def evidence():
    response = requests.get(BASE + "/care-loop/evidence", timeout=15)
    assert response.status_code == 200, response.text
    return response.json()


def paid_order(number, user_id, confirmed_at, classification="real"):
    return {
        "order_number": number, "user_id": user_id, "payment_status": "paid",
        "payment_confirmed_at": confirmed_at.isoformat(),
        "data_classification": classification,
    }


def test_excludes_demo_test_and_unverifiable_legacy_data(app_server):
    now = datetime.now(timezone.utc)
    app_server.orders.insert_many([
        paid_order("real", "real-user", now - timedelta(days=8)),
        paid_order("demo", "demo-user", now - timedelta(days=8), "demo"),
        paid_order("test", "test-user", now - timedelta(days=8), "test"),
        {"order_number": "legacy", "user_id": "legacy-user", "payment_status": "paid", "payment_confirmed_at": (now - timedelta(days=8)).isoformat()},
    ])
    payload = evidence()
    assert payload["metrics"]["paid_customers"]["value"] == 1
    counts = payload["metrics"]["care_continuation_rate"]["exclusions"]["counts"]
    assert counts["demo"] == counts["test"] == counts["unverifiable_legacy"] == 1


def test_requires_paid_timestamp_maturity_and_seven_day_action_window(app_server):
    now = datetime.now(timezone.utc)
    mature_at = now - timedelta(days=8)
    app_server.orders.insert_many([
        paid_order("mature", "eligible-user", mature_at),
        paid_order("recent", "recent-user", now - timedelta(days=6)),
        {"order_number": "no-timestamp", "user_id": "missing-time", "payment_status": "paid", "data_classification": "real"},
    ])
    app_server.care_checkins.insert_many([
        {"user_id": "eligible-user", "check_in_date": "2026-09-13", "data_classification": "real", "created_at": (mature_at + timedelta(days=6)).isoformat()},
        {"user_id": "eligible-user", "check_in_date": "2026-09-14", "data_classification": "real", "created_at": (mature_at + timedelta(days=7, seconds=1)).isoformat()},
    ])
    payload = evidence()
    rate = payload["metrics"]["care_continuation_rate"]
    assert payload["metrics"]["paid_customers"]["value"] == 1
    assert rate["numerator"] == rate["denominator"] == 1
    assert rate["value"] == 1.0
    assert rate["exclusions"]["counts"]["missing_payment_timestamp"] == 1


def test_zero_denominator_and_response_never_exposes_private_records(app_server):
    app_server.orders.insert_one({
        "order_number": "private-order", "user_id": "private-customer", "payment_status": "paid",
        "contact": {"email": "private@example.com"}, "data_classification": "demo",
    })
    app_server.care_checkins.insert_one({"user_id": "private-customer", "optional_note": "private note", "data_classification": "demo"})
    payload = evidence()
    assert payload["status"] == "INSUFFICIENT_DATA"
    assert payload["metrics"]["care_continuation_rate"]["denominator"] == 0
    assert payload["metrics"]["care_continuation_rate"]["value"] is None
    rendered = str(payload)
    for private_value in ("private-customer", "private-order", "private@example.com", "private note"):
        assert private_value not in rendered
