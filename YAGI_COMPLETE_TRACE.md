# YAGI — COMPLETE APPLICATION TRACE
### Full feature, capability, mock-status & future-feature audit

| Field | Value |
|---|---|
| **App** | YAGI — eczema / sensitive-skin care commerce & care platform (Indonesia) |
| **Snapshot taken** | **2026-09-15** (Tuesday), 07:15 UTC |
| **Repo root** | `/app` |
| **Git HEAD** | `a5265e3` — "Auto-generated changes" (2026-09-15 04:30:12 +0000) |
| **Branch** | `main` |
| **Job / build ID** | `cdf9bc84-3f03-4479-bb9d-15a09cf3bba4` |
| **Runtime** | Node v20.20.2 · Python 3.11.16 · MongoDB (local) · Yarn 1.22.22 |
| **Live URLs (today)** | Frontend `:3000` (HTTP 200) · Backend `:8001` (HTTP 200) · Mongo `:27017` |
| **Working tree** | Clean except two untracked lockfiles (`yarn.lock`, `frontend/yarn.lock`) |

> **How to read the status tags used in this document**
> - 🟢 **LIVE** — wired end-to-end, frontend calls backend, data persists in MongoDB. Verified working today.
> - 🟡 **PARTIAL** — backend is real and live, but the frontend does not call it (orphan), or the UI uses a hardcoded local value while the real API exists.
> - 🔴 **MOCK / STUB** — UI-only. `toast()` stub, no handler, or dead button. No backend behind it.
> - ⚪ **DISABLED** — real code exists but is behind a flag/config set to OFF.

---

## 1. Executive summary

YAGI is a **4-phase, mobile-first (440 px device frame) e-commerce + skin-care platform** for eczema-prone skin.

**What is genuinely real today (🟢):** account system with anonymous→customer identity merge, server-authoritative cart, favorites, persisted routine with wellness scoring, manual bank-transfer checkout with proof upload + admin approval releasing loyalty points, loyalty ledger + tiers, impact ledger with published methodology, reviews tied to paid orders, product catalog with admin CRUD, superadmin console (analytics, impact, users, orders, knowledge base, feature flags, CSV export), and a **live, grounded LLM care assistant ("Ask YAGI")** running against Shiteru (`deepseek-v4-flash`) with retrieval from a seeded dermatology knowledge base, citation surfacing, rate limiting and a medical-escalation safety path.

**What is NOT real (🔴 the skin scan is the big one):** the "AI Skin Scan" hero, "Start scan" CTA and the centre tab of the bottom navigation are **pure UI theatre**. There is no camera, no model, no `/api/scan` endpoint, and the `skin_scans` collection is a designed-for-but-empty dependency. Consequently `scan_engagement` in the wellness score is permanently 0, and the "Why this fits you" ± `match_score` personalization is **hardcoded editorial copy**, not computed.

**Sharpest headline risks:**
1. The **AI skin scan** — the single most prominent trust promise in the product — does not exist. `skin_analyzer_enabled: false` is the only acknowledgement, and it is not surfaced as "off" in the UI.
2. **Secrets are committed and live** in `backend/.env`: a working `SHITERU_API_KEY` (`sk_live_…`) and the `JWT_SECRET` are in the repository. This is an active credential leak.
3. **No payment gateway.** All revenue depends on manual bank transfer + human admin approval.
4. **Reviews are 3-layer dead**: no review-write UI exists, `POST /api/reviews` is never called, and the DB has **0 reviews** — so every published rating (4.6–4.9) and review count (88–302) on every product card is **fabricated seed data**.
5. **Points only spend on a BFF (Bank Feed Feature) that has no UI.** `GET /api/rewards` + `POST /api/rewards/redeem` are fully implemented; no page renders them.

**Current data reality (2026-09-15):** 5 users · 6 products · 3 orders (2 awaiting transfer, 1 paid) · **0 reviews** · **0 addresses** · **0 reward redemptions** · 6 AI conversations · 1 knowledge source + 6 chunks · feature-flag override doc **empty**.

---

## 2. Architecture & stack

```
/app
├── backend/                 FastAPI + Motor(MongoDB) — SINGLE FILE, 1,769 LOC
│   ├── server.py            ALL routes, models, services, seed data
│   ├── .env                 ⚠️ live secrets committed
│   ├── requirements.txt
│   └── pytest.ini
├── frontend/                React 19 + CRA 5 + CRACO + Tailwind 3 + Radix (shadcn)
│   ├── src/
│   │   ├── App.js           15 routes (App.js:21-41)
│   │   ├── store/YagiContext.jsx    single global provider (242 LOC)
│   │   ├── lib/api.js       156 LOC — ONLY place that talks to the backend
│   │   ├── pages/           14 feature pages
│   │   ├── components/yagi/ 16 bespoke components
│   │   ├── components/ui/   46 shadcn primitives (only 6 are imported!)
│   │   ├── data/products.js static fallback catalog (300 LOC)
│   │   └── constants/testIds/ only auth + home test IDs
│   ├── build/               stale production build (Sep 2)
│   └── plugins/health-check webpack health endpoints (gated, DISABLED)
├── .emergent/               platform metadata + cron watcher
├── memory/                  test_credentials.md (EMPTY)
├── test_reports/pytest/     EMPTY
└── tests/                   __init__.py only — ZERO tests
```

**Backend entry:** `uvicorn server:app --host 0.0.0.0 --port 8001 --reload`
**Frontend entry:** `craco start` on `:3000`
**API prefix:** `/api` · **CORS:** `allow_origins = CORS_ORIGINS` (currently `"*"`), credentials enabled, all methods/headers
**Auth:** stateless JWT (HS256), 30-day expiry, `typ ∈ {anonymous, customer}`
**Doc style:** `application.title = "YAGI API"`, no OpenAPI docs path overridden (default `/docs` under FastAPI root, *not* under `/api`)

> ⚠️ **Architecture smell:** everything the backend needs lives in one 1,769-line module: static config, catalog seed, auth, cart, orders, loyalty, impact, wellness, AI/RAG, admin, analytics, CSV export. There is no `routers/`, no `services/`, no schema layer, no migrations.

---

## 3. Environment & configuration (as of today)

### 3.1 `backend/.env`
| Key | Current value | Note |
|---|---|---|
| `MONGO_URL` | `mongodb://localhost:27017` | local, unauthenticated |
| `DB_NAME` | `test_database` | ⚠️ still named "test" in live use |
| `CORS_ORIGINS` | `*` | ⚠️ wide open |
| `JWT_SECRET` | `yagi_203cc6ac…e88732ac2cdf15` | 🔴 **committed secret** |
| `SHITERU_API_KEY` | `sk_live_X2kRCx…V8` | 🔴 **live LLM credential committed** |
| `SHITERU_BASE_URL` | `https://shiteru.id/v1` | OpenAI-compatible |
| `SHITERU_MODEL` | `deepseek-v4-flash` | |
| `SUPERADMIN_EMAILS` | `readgrou@gmail.com` | promoted at register time |
| `AI_ANON_REQUESTS_PER_HOUR` | `15` | in-process counter |
| `AI_USER_REQUESTS_PER_HOUR` | `60` | in-process counter |
| `AI_MAX_OUTPUT_TOKENS` | `700` | |
| `AI_MAX_HISTORY_MESSAGES` | `8` | conversation window |
| `SEED_DEMO_DATA` | `0` | ✅ demo seeding correctly OFF |

### 3.2 `frontend/.env`
| Key | Value |
|---|---|
| `REACT_APP_BACKEND_URL` | `https://yagi-mobile-home.preview.emergentagent.com` |
| `WDS_SOCKET_PORT` | `443` |
| `ENABLE_HEALTH_CHECK` | `false` ⚪ |

### 3.3 Server-side feature flags — `FEATURE_FLAGS` (server.py:45-53)
| Flag | Value today | Effect in code |
|---|---|---|
| `skin_analyzer_enabled` | **false** | ⚪ *Not read anywhere in the backend.* Decorative. |
| `skin_agent_enabled` | true | Same — decorative. |
| `loyalty_enabled` | true | Decorative. |
| `impact_dashboard_enabled` | true | Decorative. |
| `routine_gamification_enabled` | true | Decorative. |
| `require_auth_before_payment` | true | Decorative — auth gating is unconditional in `require_customer`. |
| `reviews_enabled` | true | Decorative. |

> 🔴 **Critical finding:** these flags are exposed via `GET /api/config` and are **toggleable in the Superadmin UI**, but **no backend route and no frontend component reads them to change behaviour.** Toggling a switch persists to `feature_flags` and shows a toast — and changes nothing. The `feature_flags` collection is currently **empty** (no overrides saved yet).

### 3.4 Frontend feature flags — hardcoded inline (not from API)
| Capability | Where | Value |
|---|---|---|
| Skin analyzer card | `Routine.jsx:286` | `live: false` → renders "Coming soon" chip |
| Ask YAGI card | `Routine.jsx:287` | `live: true` → navigates `/ask-yagi` |
| Bottom nav "Scan" tab | `BottomNavigation.jsx:68` | `navigate("/")` — no scan action |

### 3.5 Business config (server-authoritative)
```json
BANK_ACCOUNT = { "bank": "BCA", "account_number": "1470 8899 021",
                 "account_name": "PT YAGI Care Indonesia" }

SHIPPING = {
  "regular": { "eta": "Arrives 17 Sep–19 Sep", "price": 18000 },   // computed = today +2..+4
  "express": { "eta": "Arrives 16 Sep",        "price": 31000 }    // computed = today +1
}

TIERS = [ Seed:0 , Leaf:500 , Canopy:2000 , Forest:5000 ]   // lifetime points
```
> ✅ **Verified today:** `GET /api/config` returns exactly the ETAs above, i.e. the delivery estimate is **computed relative to the current date** (`_eta_label`, server.py:60-67) — it is not stale hardcoded text. Good.

---

## 4. Domain model & database state

### 4.1 MongoDB collections & live counts (2026-09-15)
| Collection | Docs | Status |
|---|---:|---|
| `users` | 5 | 🟢 |
| `products` | 6 | 🟢 (seeded) |
| `carts` | 14 | 🟢 |
| `orders` | 3 | 🟢 |
| `loyalty_accounts` | 5 | 🟢 |
| `loyalty_ledger` | 3 | 🟢 |
| `impact_ledger` | 3 | 🟢 |
| `routine_activity` | 1 | 🟢 |
| `routines` | 10 | 🟢 |
| `ai_conversations` | 6 | 🟢 |
| `ai_messages` | 11 | 🟢 |
| `ai_usage_events` | 5 | 🟢 |
| `knowledge_sources` | 1 | 🟢 |
| `knowledge_chunks` | 6 | 🟢 |
| `audit_logs` | 1 | 🟢 |
| **`favorites`** | **0** | 🟢 wired, no data |
| **`skin_scans`** | **0** | 🔴 **designed-for-feature-that-does-not-exist** |
| **`reviews`** | **0** | 🔴 **fabricated ratings source of truth is empty** |
| **`addresses`** | **0** | 🟡 API live, no UI, no data |
| **`onboarding`** | **0** | 🟡 API live, no UI, no data |
| **`reward_redemptions`** | **0** | 🟡 API live, no UI, no data |
| `feature_flags` | 0 | 🟢 wired, no overrides |
| `reward_redemptions` | 0 | 🟡 |

### 4.2 Indexes created at startup (`_seed_and_index`, server.py:990-1008)
`users.email` (unique) · `orders.order_number` (unique) · `orders(user_id, placed_at desc)` · `carts.user_id` · `ai_conversations(identity_id, updated_at desc)` · `ai_messages(conversation_id, created_at)` · `knowledge_chunks.search_text` (**text index**) · `addresses.user_id` · `products.id` · `products.slug` (**unique**) · `reviews(product_id, created_at desc)` · `impact_ledger(user_id, created_at desc)` · `routine_activity(user_id, date)` · `skin_scans(user_id, created_at desc)`
> Index failures are swallowed into a `logging.warning` — a broken unique index would go unnoticed.

### 4.3 Users in the live DB today
| Email | Display name | Member code | Role |
|---|---|---|---|
| `dul1787536248@gmail.com` | dul1787536248 | YG-3A3400 | customer |
| `dul1787536676@gmail.com` | Dul | YG-CE3F77 | customer |
| `sari1787536728@gmail.com` | Sari | YG-05CFC9 | customer |
| **`readgrou@gmail.com`** | readgrou | YG-EDC171 | **superadmin** |
| `buyer1787537668@gmail.com` | buyer1787537668 | YG-EBC906 | customer |

### 4.4 Orders in the live DB today
| Order | Placed | Status | Payment | Total | Points | Contact |
|---|---|---|---:|---:|---|
| `YG-260824-4231` | 2026-08-24 01:50 | pending | `awaiting_transfer` | 396,000 | 396 | dul1787536248@… |
| `YG-260824-5557` | 2026-08-24 01:58 | pending | `awaiting_transfer` | 107,000 | 107 | **guest@yagi.co** ⚠️ |
| `YG-260824-DB1C` | 2026-08-24 02:14 | confirmed | `paid` | 177,000 | 177 | buyer1787537668@… |

> ⚠️ Order #2 has the placeholder contact `guest@yagi.co` (from `Checkout.jsx:72` fallback) and its `.env` `SUPERADMIN_EMAILS`-matched admin approved #3 (audit log: `approve_transfer`).

### 4.5 Loyalty accounts today
| User | available | pending | lifetime |
|---|---:|---:|---:|
| cust_7571… | 0 | **396** | 0 |
| cust_b214… | 0 | **107** | 0 |
| cust_1ac4… | 0 | 0 | 0 |
| cust_503b… (admin) | 0 | 0 | 0 |
| cust_8092… (buyer) | **177** | 0 | **177** |

> Only the admin-approved order released points. This confirms the pending→available lifecycle works end-to-end.

---

## 5. Backend API — complete route inventory

**Total: 51 endpoints**, all under `/api`. Every row is verified against source, not assumed.

### 5.1 Config & catalog
| Method | Path | Auth | Status | Notes |
|---|---|---|---|---|
| GET | `/` | public | 🟢 | health: `{"message":"YAGI API","status":"ok"}` |
| GET | `/config` | public | 🟢 | flags + bank + tiers + shipping |
| GET | `/products` | public | 🟢 | `q, concern, category, sort, limit=50, skip=0` · sorts: `price_asc, price_desc, best_selling, recommended(default=match_score)` |
| GET | `/products/{slug}` | public | 🟢 | 404 if unknown |

> ⚠️ `GET /products` **does not filter `active: false`**. A hidden product still appears in the public catalog endpoint (only `/recommendations` respects `active`).

### 5.2 Auth / identity
| Method | Path | Auth | Status | Notes |
|---|---|---|---|---|
| POST | `/auth/anon` | public | 🟢 | issues `anon_<hex>` token |
| POST | `/auth/register` | public | 🟢 | bcrypt; auto-superadmin if email in `SUPERADMIN_EMAILS`; creates loyalty account; merges anon state |
| POST | `/auth/login` | public | 🟢 | returns 401 "Incorrect email or password." |
| GET | `/auth/me` | optional | 🟢 | returns `identity ∈ {public, anonymous, customer}` |

**Anonymous→customer merge** (`_merge_from_anon`, server.py:429-464) — 🟢 genuinely implemented:
- cart: quantity sum, deduped by `(product_id, variant_id)`
- favorites: set union
- routine: anon draft adopted **only if** customer has none
- then anon docs are deleted

> ⚠️ No password reset, no email verification, no refresh token, no logout endpoint (client just drops the token), no account deletion, no rate limit on login/register (brute-force exposure).

### 5.3 Cart (server-authoritative)
| Method | Path | Auth | Status |
|---|---|---|---|
| GET | `/cart` | identity | 🟢 |
| POST | `/cart/items` | identity | 🟢 |
| PATCH | `/cart/items` | identity | 🟢 |
| DELETE | `/cart/items` | identity | 🟢 (body-based DELETE) |

Prices are **always** re-derived from the server catalog (`variant_price`, server.py:223-228). ✅ Client prices are never trusted.
> ⚠️ `variant_price` **silently falls back to `variants[0]`** for an unknown `variant_id` — a bad variant ID is accepted, not rejected.

### 5.4 Favorites
| Method | Path | Auth | Status |
|---|---|---|---|
| GET | `/favorites` | identity | 🟢 |
| POST | `/favorites/toggle` | identity | 🟢 |

### 5.5 Routine
| Method | Path | Auth | Status |
|---|---|---|---|
| GET | `/routine` | identity | 🟢 |
| PUT | `/routine` | identity | 🟢 — also writes `_record_routine_activity` |

### 5.6 Checkout & orders
| Method | Path | Auth | Status | Notes |
|---|---|---|---|---|
| POST | `/checkout/quote` | identity | 🟢 | `discount` hardcoded `0` |
| POST | `/orders` | **customer only** | 🟢 | anon → `401 "Please sign in to continue"` (verified live) |
| GET | `/orders` | customer | 🟢 | |
| GET | `/orders/{order_number}` | customer | 🟢 | |

**Order placement side effects (server.py:612-671):** creates order · loyalty ledger `pending` · increments `pending_points` · writes `impact_ledger` · **empties the cart**.
- `order_number` = `YG-YYMMDD-XXXX`
- `points_earned = total // 1000` (1 pt / Rp1,000) — server-computed ✅
- `lower_waste_items` counted from `CATALOG_BY_ID[...]["lower_waste"]`

> ⚠️ **No stock/inventory concept anywhere.** Unlimited orders on unlimited stock.
> ⚠️ No idempotency key on `POST /orders` — a double-tap could create two orders (UI does disable the button while placing).

### 5.7 Loyalty, profile, wellness
| Method | Path | Auth | Status | Notes |
|---|---|---|---|---|
| GET | `/loyalty` | customer | 🟢 | balance + tier + next tier + ledger(50) + impact summary |
| GET | `/profile` | customer | 🟢 | |
| PUT | `/profile` | customer | 🟢 | |
| GET | `/wellness` | identity | 🟢 | computed score + 7-day series |

**Documented wellness model (server.py:746-830)** — *the only genuinely derived "AI-like" score in the app*:
```
score = routine_consistency(0–60) + purchase_engagement(0–25) + scan_engagement(0–15)   cap 100
routine_consistency = round(routine_completed/routine_total over last 7d × 60)
purchase_engagement = 25 if ≥2 paid orders in 30d, else 15 if ≥1, else 0
scan_engagement = 15 if a scan exists in the last 7d, else 0     ← PERMANENTLY 0 (no scan feature)
labels: ≥85 "Calmer today" / ≥60 "Steady progress" / else "Getting started"
```
> ⚠️ **`timezone.utc` is used for day boundaries** while the business is `WIB (UTC+7)`. A routine completed at 06:00 WIB lands on the *previous* UTC day. The Routine week-strip (`Routine.jsx:317-323`) mixes `new Date()` **local** components with `toISOString()` **UTC** slicing — a real off-by-one-day display bug near midnight.
> ⚠️ **Wellness "delta" is meaningless-percentage-comparable:** `delta = today.routine% − yesterday.routine%` is presented as "+N pts" next to a 0–100 score. Different units.

### 5.8 Phase 4 — Ask YAGI, ops, admin
| Method | Path | Auth | Status | Notes |
|---|---|---|---|---|
| POST | `/ai/chat` | identity | 🟢 | live LLM, verified today |
| GET | `/ai/conversations` | identity | 🟢 | |
| GET | `/ai/conversations/{cid}` | identity | 🟢 | ownership-checked |
| POST | `/orders/{n}/proof` | customer | 🟢 | base64 data URL, **max 4 MB**, sets `under_review` |
| GET | `/addresses` | customer | 🟡 | postman-only; no UI |
| POST | `/addresses` | customer | 🟡 | postman-only; no UI |
| DELETE | `/addresses/{aid}` | customer | 🟡 | postman-only; no UI |
| GET | `/rewards` | customer | 🟡 | **backend live, ZERO UI** |
| POST | `/rewards/redeem` | customer | 🟡 | **backend live, ZERO UI** |
| GET | `/superadmin/products` | superadmin | 🟢 | |
| POST | `/superadmin/products` | superadmin | 🟢 | 409 on duplicate slug |
| PUT | `/superadmin/products/{pid}` | superadmin | 🟢 | |
| DELETE | `/superadmin/products/{pid}` | superadmin | 🟢 | |
| GET | `/superadmin/users` | superadmin | 🟢 | excludes `password_hash` ✅ |
| PATCH | `/superadmin/users/{uid}/role` | superadmin | 🟢 | `customer/admin/superadmin` |
| GET | `/superadmin/knowledge` | superadmin | 🟢 | |
| POST | `/superadmin/knowledge` | superadmin | 🟢 | |
| PATCH | `/superadmin/knowledge` | superadmin | 🟢 | activate/deactivate source + chunks |
| GET | `/superadmin/orders` | superadmin | 🟢 | **excludes `payment_proof`** ✅ |
| GET | `/superadmin/orders/{n}/proof` | superadmin | 🟢 | explicit proof fetch only |
| POST | `/superadmin/orders/approve` | superadmin | 🟢 | **idempotent** — early-returns if already `paid` ✅ |
| POST | `/superadmin/orders/reject` | superadmin | 🟢 | reason required |
| POST | `/superadmin/ai-test` | superadmin | 🟢 | **backend live, ZERO UI** |
| GET | `/impact` | customer | 🟢 | |
| GET | `/impact/methodology` | public | 🟢 | |
| POST | `/reviews` | customer | 🟡 | **backend live, ZERO UI** |
| GET | `/reviews/product/{id}` | public | 🟢 | consumed by ProductDetail |
| PUT | `/onboarding` | customer | 🟡 | **backend live, ZERO UI** |
| GET | `/onboarding` | customer | 🟡 | **backend live, ZERO UI** |
| GET | `/recommendations` | customer | 🟡 | **backend live, ZERO UI** |
| GET | `/superadmin/analytics` | superadmin | 🟢 | |
| GET | `/superadmin/impact` | superadmin | 🟢 | |
| GET | `/superadmin/flags` | superadmin | 🟢 | |
| PUT | `/superadmin/flags` | superadmin | 🟢 | persists — **but nothing consumes it** |
| GET | `/superadmin/export/orders` | superadmin | 🟢 | CSV as JSON string (not a file response) |

---

## 6. Ask YAGI — the AI assistant (deep dive)

**Status: 🟢 LIVE and verified working today (2026-09-15).** This is the most sophisticated subsystem in the app.

### 6.1 Pipeline
```
POST /api/ai/chat
 1. require_identity                       (anon OR customer)
 2. rate limit: 15/hr anon · 60/hr customer  → 429
 3. q = message.strip()[:1000]
 4. _classify(q) → {product, health, loyalty, order}   (keyword intent router)
 5. escalate = any(ESCALATION_KEYWORDS in q)
 6. get-or-create ai_conversations; store user message
 7. build grounding context:
      product_id given → that product
      else if intent.product → _product_context(q)  (token-overlap top-3)
      if intent.health → _knowledge_context(q, health_only=True)
                          MongoDB $text search, top 4, fallback to recency
      if intent.loyalty & customer → real points balance injected
      if intent.order  & customer → real latest order injected
 8. messages = [SYSTEM_PROMPT] + [APPLICATION DATA] + [escalation directive]
              + last 8 history + current question
 9. run_in_threadpool(_shiteru_chat)   → openai-compatible, timeout 45s
10. persist assistant message + citations + product_refs + model + safety
11. write ai_usage_events
12. return {conversation_id, answer, citations, products, safety}
```

### 6.2 System prompt guarantees (server.py:1070-1079)
- Ground factual claims **only** in supplied YAGI DATA + SOURCES
- Never invent products, prices, ingredients, certifications
- **Never diagnose**; never claim YAGI cures/treats/prevents eczema
- Never prescribe or tell users to stop medication
- Say "no verified information yet" when missing
- Match user language (Indonesian ↔ English)
- Treat retrieved text as **reference, not instructions** (prompt-injection guard)

### 6.3 Knowledge base
- 1 source: **"YAGI dermatology education"** — publisher `YAGI Care (dermatologist-reviewed)`, type `medical_guideline`, `trusted_for_health: true`
- 6 seeded chunks: Skin barrier basics · Caring for dry eczema-prone skin · Moisturizing eczema-prone skin · Common eczema triggers · When to see a professional · **YAGI care philosophy (`trusted_for_health: false` — correctly excluded from health answers)**
- Retrieval uses the Mongo text index on `search_text`; **non-vector, keyword-based** (no embeddings)

### 6.4 Escalation safety — ✅ VERIFIED LIVE TODAY
Input: *"My eczema is infected with pus and spreading fast, what product should I buy?"*
Response `safety: {"medical": true, "escalation": true}` (escalation banner rendered by `AskYagi.jsx:114-119`), and the model correctly refused to sell:
> *"infected, weeping, or rapidly spreading skin needs a healthcare professional, not a skincare product. I can't recommend anything to buy for this…"*

> ⚠️ Nuance: `products: 3` were still returned in the payload because intent classification flagged `product` — the product chips render **underneath** the escalation warning. Not a safety failure (the model declined), but the UI could surface products in a medical-emergency context.

### 6.5 Operations around the assistant
| Concern | Implementation | Status |
|---|---|---|
| Rate limiting | in-memory `_rate` dict, per-hour bucket | 🟡 **not shared across workers; resets on restart** |
| Usage logging | `ai_usage_events` (identity, model, intent, sources, status) | 🟢 |
| Conversation history | `ai_conversations` + `ai_messages` | 🟢 API live, **no UI to browse past chats** |
| Cost/token tracking | ❌ none | 🔴 |
| Fallback model | ❌ single provider, no retry | 🔴 |
| Streaming | ❌ single blocking response (45s timeout) | 🔴 |
| Prompt/version registry | ❌ `SYSTEM_PROMPT` hardcoded in module | 🔴 |
| Admin playground | `POST /superadmin/ai-test` | 🟡 API live, **no UI** |
| Missing-key behaviour | `503 "Ask YAGI is temporarily unavailable."` | 🟢 |
| Upstream failure | `502 "Ask YAGI couldn't answer just now."` | 🟢 (details only logged) |

### 6.6 Chat UI (`pages/AskYagi.jsx`, 176 LOC)
🟢 Product deep-link context chip ("Asking about …") · 5 suggested prompts · user bubbles · assistant glass cards · pulsing "YAGI is thinking…" · collapsible **Sources · N** list · inline product cards with View + quick-add · safety banner · sticky auto-grow textarea (Enter sends, Shift+Enter newlines) · disclaimer footer.
> ⚠️ **No conversation history sidebar** — leaving the page loses the thread visually (server still has it).
> ⚠️ **No "ask about my routine/order" affordance**, though the backend supports both intents.
> ⚠️ Quick-add from chat calls `addToCart(p.id, undefined, 1)` → backend silently picks `variants[0]`, which may not be the size the user saw.

---

## 7. Frontend route & screen inventory

### 7.1 Routes (`App.js:21-41`) — 15 routes
| Path | Component | LOC | Guard |
|---|---|---:|---|
| `/` | Home | 62 | none |
| `/landing` | Onboarding | 255 | **orphan — no link/navigation reaches it** |
| `/shop` | Shop | 392 | none |
| `/product/:slug` | ProductDetail | 595 | none |
| `/cart` | Cart | 194 | none |
| `/checkout` | Checkout | 316 | AuthGate inline |
| `/checkout/success` | CheckoutSuccess | 151 | redirects to `/` if no `lastOrder` |
| `/routine` | Routine | 539 | none |
| `/auth` | Auth | 84 | none |
| `/profile` | Profile | 127 | renders signed-out state |
| `/profile/orders` | Orders | 108 | renders sign-in prompt |
| `/rewards` | Rewards | 133 | renders sign-in prompt |
| `/impact` | Impact | 127 | renders sign-in prompt |
| `/ask-yagi` | AskYagi | 176 | none (anon allowed) |
| `/superadmin` | Superadmin | **779** | client-side role check + server 403 |

> ⚠️ **No 404 route.** Any unknown URL renders a blank page.
> ⚠️ **Onboarding is unreachable from the UI** — `/` goes straight to Home. There is no `yagi_onboarded` first-run check anywhere, though `Onboarding.jsx:63` writes that key.

### 7.2 Screen-by-screen breakdown

#### 🏠 Home (`/`) — 🟢 mostly live, 🔴 scan CTA
| Section | Component | Status |
|---|---|---|
| Header (search / bell / avatar) | `AppHeader` | 🔴 search input has **no handler**; bell **no handler**; avatar is a **hardcoded Unsplash model photo** |
| Skin wellness card | `SkinWellnessCard` → `WellnessChart` | 🟢 live `/api/wellness`; falls back to fake `[72,74,73,78,81,84,88]` while loading |
| Quick actions (Scan / Routine / Shop) | `QuickActions` | 🟡 Routine + Shop navigate; **Scan = toast only** |
| AI skin scan hero | `SkinScanHero` | 🔴 **pure mock** — "Start scan" → toast; "Analyzing" pulse badge; decorative SVG face-mesh overlay |
| Insight cards (Routine / Recommended / Consult expert) | `InsightCards` | 🟡 routine count is live; **all three tap targets route to `/routine`** — "Consult expert" (shows "Online" green dot) is fake |
| Recommended for you | `ProductGrid` | 🟢 live products, add-to-cart + favourite work |

#### 🛍 Shop (`/shop`) — 🟢 live data, 🟡 dead search, 🟡 fake personalisation
🟢 Live catalog · concern chips · category chips · 4-group filter bottom sheet (concern / type / routine / preference) · sort sheet (5 options) · applied-filter chips · empty state with reset · wishlist · quick add · impact card · award card.
🔴 **Search bar is a styled input with no `value`/`onChange`** (`Shop.jsx:115-119`) — typing does nothing. Server-side search (`/products?q=`) is fully implemented but unused.
🟡 "Recommended for your skin · Barrier support · Dryness · Sensitive" is a **hardcoded string**; the button just sets concern = "Skin barrier".
🔴 "Why it fits you" sheet prints a hardcoded narrative *"Your latest scan shows dryness and a weakened barrier"* — **there is no scan**.
🔴 "Impact methodology" and "ASEAN SEDP 2025" → toast only.
⚠️ `filters.routine` (Morning/Evening/Anytime) is collected but **never applied** in the `filtered` memo. Dead filter group.
⚠️ `Shop.jsx:84` contains a tautological ternary — logically inert code.
⚠️ `sort === "Newest"` (offered in the UI) has **no implementation** — selecting it silently falls through.
⚠️ Client-side filtering/sorting re-implements logic the backend already exposes and never calls `sort=`/`concern=`/`category=` params for filtering.

#### 💄 Product Detail (`/product/:slug`) — 🟢 live with heavy ⚠️ copy
🟢 Gallery + thumbnails + fullscreen viewer · variants · sticky add-to-bag with qty · favourite · cart badge · **live reviews fetch** · add-to-routine · accordions · impact card · pairs-well-with.
🟡 `AddToRoutine` ignores its own `period` argument quirk in callers but works.
🔴 "Share" → `toast("Link copied")` — **nothing is copied** (`ProductDetail.jsx:190`).
🔴 Hardcoded copy that pretends to be data: the **full ingredient list** (Aqua/Cocos Nucifera/Shea/Patchouli…) is the same for every product; "**Ready to ship**" stock pill is always green with **no inventory model**; "Who it is for"; "Shipping & returns" (14-day, unenforced); "If you buy this" trio.
🟡 `shippingEta` derives from `/api/config` ✅ (no longer stale).
> ⚠️ `ProductDetail.jsx:80` falls back to `products[0]` when a slug is unknown — **a bad URL silently shows the first product instead of a 404**. Same for `data/products.js:getProductBySlug`.
> ⚠️ Review filter chips (Eczema-prone / Dry skin / Texture / Repurchase) filter on `r.tag`, but the backend review schema has **no `tag` field** → every filter except "All" shows an empty list.
> ⚠️ "View all reviews" → toast; review cards show `r.title` as the *reviewer name*.

#### 🧺 Cart (`/cart`) — 🟢 core, 🔴 voucher
🟢 Live server cart · qty ± · remove · save-for-later · "Complete your routine" recs · totals from config.
🔴 **Voucher input + Apply are inert** (`Cart.jsx:161-169`) — no state, no handler. Backend has no voucher endpoint at all.
🟡 "Your order's impact" panel hardcodes item count and shows static "Refill-ready / Supported".
⚠️ Empty-state cart shows a "Save for later" heart on each line, but the action **toggles wishlist**, not real "save for later" (no such model).

#### 💳 Checkout (`/checkout`) — 🟢 real, 🔴 payment rail is manual
🟢 4-step stepper (Contact → Delivery → Payment → Review) · guest browsing · **AuthGate** modal at step 1→2 when not signed in · shipping method choice from `/api/config` with **live date ETAs** · review-step edit links · impact panel.
🔴 "Bank transfer · Manual transfer to YAGI's account" is the **only** payment method — no gateway, no card, no VA, no e-wallet, no QRIS.
⚠️ **"Continue as guest" card is decorative** — the flow still hard-requires an account at step 2.
⚠️ "+ Add apartment or unit" renders an input with `value=""` and `onChange={() => {}}` — **types nothing**.
⚠️ `doPlaceOrder` substitutes placeholders (`guest@yagi.co`, `YAGI Customer`, `-`) for empty required fields — this is how `YG-260824-5557` got the `guest@yagi.co` contact. **No form validation exists.**
⚠️ `PUT /api/addresses` exists but checkout **never offers saved addresses**.
⚠️ Checkout totals are computed client-side; the server recomputes authoritatively on `POST /orders` (✅ no mismatch risk, but no quote-confirmation step either).

#### ✅ Checkout Success (`/checkout/success`) — 🟢 real
🟢 Animated confirmation · **bank account + copy-to-clipboard** · exact transfer amount · points-pending reveal · impact strip · "Add all to routine" · track-order CTA.
🟡 Copy says *"Your order confirms automatically once we receive your transfer"* — **false**: confirmation requires a human admin to click Approve.
🟡 Acknowledge-copy line is inconsistent with the manual-approval reality.

#### 💧 Routine (`/routine`) — 🟢 real persistence, mixed honesty
🟢 Server-persisted steps · morning/evening segmented · per-step toggle · progress ring + bar · **real weekly activity dots from `/api/wellness`** · reorder/remove/add-step sheet with cancel-restore · contextual wellness metrics.
🔴 **"Skin analyzer" card = "Coming soon"** → opens a "We're building this carefully" sheet.
🟡 "Ask YAGI" card → `/ask-yagi` ✅ live.
🔴 "View progress" → toast · "Step skipped for today" → toast · "View impact details" → toast · "Join early access" → just closes the sheet.
🟡 Header Calendar / Notifications / Profile icons have **no handlers**.
🔴 Award strip "YAGI · 1st place ASEAN SEDP 2025" is hardcoded, non-verifiable in-app.
⚠️ `removeStep` / `move` persist immediately, but the sheet's **Cancel** restores the snapshot — consistency is timing-dependent.
⚠️ Week strip date bug noted in §5.7.

#### 👤 Profile (`/profile`) — 🟢 identity, 🔴 half the menu
🟢 Real identity card (name, email, member code, tier) · points module → `/rewards` · superadmin console entry (role-gated) · sign-out.
🔴 Menu: **"Addresses", "Help", "Settings" → `toast("Coming soon")`**.
🔴 Signed-out menu: Help / Impact story / Privacy / Terms / About YAGI — **all dead buttons**.
⚠️ "Saved products" just routes to `/shop` — there is **no saved-products page**, so wishlist has no home.

#### 🎁 Rewards (`/rewards`) — 🟢 loyalty is real, 🔴 redemption unreachable
🟢 Live points, pending points, tier, progress bars, full tier ladder with "Current" marker, real points-history ledger with signed deltas.
🔴 **`REWARDS_CATALOG` (3 rewards) and `POST /rewards/redeem` exist server-side and are never rendered.** Points accumulate but **cannot be spent in the UI**.
🟡 "Earn / Grow / Redeem" trio is decorative.

#### 🌱 My Impact (`/impact`) — 🟢 the most honest data page (and it's in Indonesian)
🟢 Live `/api/impact` aggregate · 30-day Recharts line · 4 equivalence cards · published methodology paragraph.
⚠️ Only `/impact` and the superadmin Impact panel are Indonesian; the rest of the app is English. **Inconsistent localisation.**
⚠️ `/api/impact/methodology` exists but the page hardcodes the methodology text.

#### 📦 Orders (`/profile/orders`) — 🟢 real, 🔴 tracking is the weak link
🟢 Live order list · payment-status chips · item thumbnails · points + total · **transfer-proof upload** (`FileReader` → base64 → 4 MB cap) · "under review" state.
🟡 The 6-stage timeline (`Order placed → Transfer submitted → Payment confirmed → Preparing → Shipped → Delivered`) is **cosmetic**: stages 3–5 have no backend event producer. `o.status === "shipped" / "delivered"` is never set by any code path — only read.
🔴 **No address/courier/tracking number, no `tracking_url`, no courier integration.** Order status vocabulary across code is inconsistent (`pending`, `payment_review`, `confirmed`, `pending_payment`, plus unreachable `shipped`/`delivered`).
⚠️ Proof upload accepts `application/pdf` in the file picker but the backend expects an image data URL — a PDF would be stored raw.

#### 🤖 Ask YAGI (`/ask-yagi`) — 🟢 live (see §6.6)

#### 🛠 Superadmin (`/superadmin`) — 🟢 the largest and most complete screen
8 tabs: **Overview · Analytics · Impact · Products · Users · Orders · Knowledge · Feature flags**
🟢 Real Recharts revenue line + category bar · top-10 products table · 6-stage funnel · impact aggregates + per-product lower-waste table · product CRUD with variants editor · user role switcher · order approve/reject · knowledge source add + activate toggle · flags UI · CSV export (order id, date, statuses, money, points, item count, email, city).
🔴 **Bypassed-by-design screens:** there is no UI for `POST /superadmin/ai-test`, no dedicated payment-proof viewer (the `GET /superadmin/orders/{n}/proof` endpoint is never called — proof images **cannot be seen by the admin who must approve them**), and no use of `/superadmin/export/orders` beyond the CSV button.
⚠️ All 46 shadcn UI primitives exist but the console is hand-rolled with raw Tailwind — a separate visual language from the mobile app.
⚠️ `deleteProduct` uses `window.confirm`, `reject` uses `window.prompt` — browser-dialog UX.
⚠️ Client-side role check only (`user.role`) — server 403 is the real boundary ✅.

#### 🌿 Onboarding (`/landing`) — 🟡-orphan, carries 🔴 claims
🟢 Beautiful static landing (pillars, featured products, impact band, feature grid).
🔴 **Unreachable** — no nav item, no redirect.
🔴 Marketing claims not backed by code: *"Guided routines, an **AI skin scan**…"*, *"Marketing that **learns, follows up and optimises itself**"*, *"Support & customer care"*, *"Marketing intelligence"*.
🔴 **Contest copy with a date that is in the past relative to today**: *"Submissions close 05 Sept 2026 · 23:59 WIB"* and event window *"10 Aug – 05 Sept"* — today is **15 Sept 2026**, i.e. the advertised window has already closed.
🔴 Featured product prices (`Rp189k/Rp249k/Rp159k`) are **hardcoded** while the server catalog is authoritative.
⚠️ Writes `yagi_onboarded` on "Enter Yagi" — but nothing reads it.

### 7.3 Navigation shell
`MobileShell` = 440 px device frame + scroll area + optional bottom nav / sticky bar.
`BottomNavigation` — 5 items: Home · Shop · **Scan (centre, raised)** · Routine · Profile.
🔴 **The centre "Scan" button navigates to `/`.** `onScan` is never passed by `MobileShell`. **The most prominent affordance in the entire app is a no-op.**
`TopBar` — back + title/wordmark + right slot ✅.
`BottomSheet` — spring-animated glass sheet, body-scroll lock, footer slot ✅.

---

## 8. Master status matrix — everything, honestly tagged

### 8.1 🟢 LIVE (real, end-to-end)
1. Anonymous identity issuance + persistent token · 2. Register/login (bcrypt + JWT) · 3. Anonymous→customer state merge (cart/favourites/routine) · 4. Server-authoritative catalog with prices · 5. Server-authoritative cart (add/patch/remove) · 6. Favourites toggle · 7. Routine persistence + reorder/remove · 8. Daily routine-activity capture · 9. **Computed wellness score** (documented model) · 10. Free shipping quote w/ live date ETAs · 11. Order placement (**customer-gated**) · 12. Loyalty pending→available lifecycle (idempotent approval) · 13. Loyalty ledger + 4 tiers + progress · 14. Impact ledger + aggregates + 30-day series (user & global) · 15. Published impact methodology · 16. Profile read/update · 17. **Ask YAGI live LLM** w/ retrieval, citations, escalation, rate limit, usage log · 18. Transfer-proof upload → review state · 19. Admin approve/reject transfer · 20. Admin product CRUD (DB + cache refresh + audit log) · 21. Admin user role management · 22. Admin knowledge base CRUD + activate toggle · 23. Admin analytics (revenue, AOV, top products, categories, funnel) · 24. Admin impact analytics · 25. Feature-flag persistence · 26. CSV order export · 27. Audit logging (5 action types) · 28. Review **read** path on ProductDetail · 29. Onboarding survey storage (API) · 30. Recommendation scorer (API) · 31. Rewards catalogue + redemption + voucher issuance (API)

### 8.2 🟡 PARTIAL — backend real, frontend missing or faked
| # | Capability | Backend | Frontend |
|---|---|---|---|
| 1 | **Rewards redemption** | `/rewards`, `/rewards/redeem` 🟢 | **no UI** — points are unspendable |
| 2 | **Reviews (write)** | `/reviews` 🟢 full validation | **no UI at all** |
| 3 | **Saved addresses** | `/addresses` CRUD 🟢 | **no UI**; checkout never offers them |
| 4 | **Onboarding survey** | `PUT/GET /onboarding` 🟢 | `Onboarding.jsx` never calls it |
| 5 | **Personalised recommendations** | `/recommendations` 🟢 | never called; Shop uses hardcoded copy |
| 6 | Product search | `/products?q=` 🟢 | search inputs have **no handlers** |
| 7 | Server-side sort/filter | `/products?sort=&concern=&category=` 🟢 | all filtering re-done client-side |
| 8 | Conversation history | `/ai/conversations` 🟢 | no history UI |
| 9 | AI sandbox | `/superadmin/ai-test` 🟢 | no UI |
| 10 | Proof viewing | `/superadmin/orders/{n}/proof` 🟢 | **no UI** — admins approve blind |
| 11 | Wellness series | `/wellness` 🟢 real | chart falls back to fake data while loading |
| 12 | Skin-scan engagement | `skin_scans` index + scoring hook 🟢 | **no scan feature exists** → always 0 |
| 13 | Feature flags | GET/PUT 🟢 persisted | **no code reads them** |

### 8.3 🔴 MOCK / STUB — UI-only, no backend
| # | Feature | Location | What actually happens |
|---|---|---|---|
| 1 | **AI skin scan** | `Home.jsx:24`, `SkinScanHero.jsx`, `BottomNavigation.jsx:68` | toast / navigate to `/` |
| 2 | Bottom-nav centre Scan | `BottomNavigation.jsx` | navigates home |
| 3 | Home search bar | `AppHeader.jsx` | uncontrolled, no handler |
| 4 | Home notification bell | `AppHeader.jsx` | no handler |
| 5 | Home avatar photo | `AppHeader.jsx` | hardcoded Unsplash stranger |
| 6 | "Consult expert" insight | `InsightCards.jsx:37` | routes to `/routine`; fake "Online" dot |
| 7 | Shop search | `Shop.jsx:115` | uncontrolled, no handler |
| 8 | Voucher code | `Cart.jsx:161-169` | no state, no handler, no endpoint |
| 9 | Share product | `ProductDetail.jsx:190` | toast "Link copied"; nothing copied |
| 10 | "View all reviews" | `ProductDetail.jsx:509` | toast |
| 11 | Match-details profile tags | `ProductDetail.jsx:547` | hardcoded ["Dryness","Sensitive","Barrier support"] |
| 12 | Full ingredient list | `ProductDetail.jsx:400` | identical hardcoded text for every product |
| 13 | "Ready to ship" stock pill | `ProductDetail.jsx:279-281` | always green; no inventory model |
| 14 | Shipping & returns policy | `ProductDetail.jsx:417` | copy only; no returns system |
| 15 | Checkout "+ apartment" field | `Checkout.jsx:181` | `value="" onChange={()=>{}}` |
| 16 | "Continue as guest" | `Checkout.jsx:154` | decorative; auth still forced |
| 17 | Order tracking timeline | `Orders.jsx:78-91` | stages 3–5 have no producer |
| 18 | Routine "View progress" | `Routine.jsx:275` | toast |
| 19 | Routine "Skin analyzer" | `Routine.jsx:286` | "Coming soon" sheet |
| 20 | Routine "Join early access" | `Routine.jsx:467` | closes sheet |
| 21 | Routine "Skip step" | `Routine.jsx:115` | toast; nothing skipped |
| 22 | Routine header icons ×3 | `Routine.jsx:179` | no handlers |
| 23 | Impact "View details" | `Routine.jsx:437` | toast |
| 24 | Profile Addresses/Help/Settings | `Profile.jsx:92` | `toast("Coming soon")` |
| 25 | Profile legal links ×5 | `Profile.jsx:52` | dead buttons |
| 26 | "Saved products" | `Profile.jsx:13` | routes to `/shop`; no saved page |
| 27 | Rewards "Earn/Grow/Redeem" | `Rewards.jsx:75` | static trio |
| 28 | Impact methodology in-page | `Impact.jsx:119` | hardcoded; API exists |
| 29 | ASEAN SEDP 2025 award | `Impact.jsx:444`, `Shop.jsx:277`, `ProductDetail.jsx:447` | toast / static claim |
| 30 | CheckoutSuccess "auto-confirm" | `CheckoutSuccess.jsx:83` | false — manual admin approval |
| 31 | `Onboarding.jsx` contest dates | `Onboarding.jsx:224-228` | window closed as of today |
| 32 | `Onboarding.jsx` feature promises | `Onboarding.jsx:45-50` | "AI skin scan", "Marketing intelligence" absent |
| 33 | Toast-based "share/open/learn" | many | ~20 `toast()` stubs total |
| 34 | **All product ratings & review counts** | seed data | `reviews` collection is **empty** |

### 8.4 ⚪ DISABLED
`ENABLE_HEALTH_CHECK=false` (webpack `/health`, `/health/detailed` off) · `SEED_DEMO_DATA=0` (demo seeder inert) · `skin_analyzer_enabled=false` (decorative) · `LocalStack/AWS` libs installed (`boto3`, `emergentintegrations`) but **zero code usage**.

---

## 9. Code-health, coupling & dead-code map

| Finding | Detail |
|---|---|
| Unused UI kit | **40 of 46** shadcn primitives are never imported (`accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button(_partially_), calendar, card, carousel, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, skeleton, slider, switch, table, tabs, textarea, toaster, toggle-group, tooltip`). Only `button, dialog, label, sonner, toast, toggle` are used. |
| Duplicate catalog | `frontend/src/data/products.js` (300 LOC) duplicates the backend catalog as a loading fallback → **two sources of truth**; client edits do not persist. |
| Duplicate product shape | `normalizeProduct` in `api.js` maps snake_case→camelCase, but `Shop.jsx`/`ProductDetail.jsx` still read raw `impact?.lowerWaste` (always `undefined` for API products since the server returns `impact.lower_waste`). |
| No tests | `tests/` = `__init__.py` only. `test_reports/pytest/` empty. `pytest.ini` exists. `yarn test` (CRA) unused. test_result.md contains **only protocol boilerplate, no data**. |
| Dead test IDs | `constants/testIds/` defines only auth + home IDs; **no component renders any `data-testid`** → the automated QA agent cannot drive any screen. |
| `memory/test_credentials.md` | **empty stub** — no demo/admin credentials recorded. |
| Placeholder root README | `/app/README.md` = `# Here are your Instructions` (29 bytes). |
| Backend secrets | `.env` committed with `JWT_SECRET` + live `SHITERU_API_KEY`. |
| No `.env.example` | neither backend nor frontend. |
| Monolith | 1,769-line `server.py`. |
| No migrations | schema lives implicitly in code + first-boot seeding. |
| No input sanitisation beyond pydantic | `description`, `title`, `body` stored raw → XSS risk if ever rendered with `dangerouslySetInnerHTML` (currently safe: React escapes). |
| `payment_proof` stored inline | base64 image stored **inside the order document** (4 MB cap) → will bloat `orders` scans; no object storage. |
| Corrupt CSS | `index.css:296` — `.filter-chip[data-active=\"true\"]` has **literal backslashes** in the selector, so the active-chip style **never applies**. Confirmed by reading the file. |
| Stale build | `frontend/build/` is from **Sep 2**, unrelated to current `src/`. |
| No CI, no linter config wired | `black/isort/flake8/mypy` in requirements, no config files or hooks. |
| No error tracking / APM | only `logging.warning` in three places. |

---

## 10. Security & compliance posture (as of today)

| Area | State | Severity |
|---|---|---|
| Secrets in git | `JWT_SECRET`, live `SHITERU_API_KEY` in `backend/.env` | 🔴 **critical** |
| CORS | `*` with `allow_credentials=True` | 🔴 high |
| Rate limiting on auth | none | 🔴 high |
| Rate limiting on AI | in-memory, per-worker, resets on restart | 🟡 medium |
| Password policy | min 6 chars only | 🟡 medium |
| Password reset / email verify | absent | 🟡 medium |
| Token invalidation / revocation | absent (30-day JWT, no blacklist) | 🟡 medium |
| Admin authorisation | server-enforced (`require_superadmin`) ✅ | 🟢 |
| Cross-user data isolation | every user query is `user_id`-scoped ✅ | 🟢 |
| Proof endpoint leakage | list endpoint strips `payment_proof` ✅ | 🟢 |
| Users endpoint leakage | strips `password_hash` ✅ | 🟢 |
| Approve idempotency | ✅ early-return prevents double points | 🟢 |
| Medical safety | refuse-to-sell + escalation ✅ (verified live) | 🟢 |
| Prompt injection | system prompt guards retrieved text ✅ | 🟢 |
| Audit trail | 5 admin actions logged ✅ (no login/order events) | 🟡 |
| PDP / GDPR / UU PDP Indonesia | **no** consent capture, data export, deletion, or retention policy | 🔴 high |
| Content claims | "dermatologist-reviewed", "BPOM", "Halal", "Ecocert", "ASEAN SEDP 2025" claims are unverified in-app | 🟡 medium |
| Payment PCI scope | avoided (manual transfer) ✅ | 🟢 |

---

## 11. Future features — everything referenced but not built

### 11.1 Explicitly promised inside the product (🔴)
1. **AI skin scan / skin analyzer** — hero CTA, bottom-nav centre tab, Routine "Coming soon" card, Home insight.
2. **Consult an expert / online dermatologist chat** — "Online" indicator, no service.
3. **Voucher / promo codes** — cart input, no backend.
4. **Auto payment confirmation** — success page claim; reality is manual.
5. **Courier tracking** — timeline stages "Shipped"/"Delivered", no producer.
6. **Self-optimising marketing** — Onboarding copy, nothing in code.
7. **Email / push notification lifecycle** — Home bell, no notifications system.
8. **Saved products page** — `saved` state exists, no destination.
9. **Address book** — backend done, UI missing.
10. **Product reviews by customers** — backend done, UI missing.
11. **Rewards redemption UI** — backend done, UI missing.
12. **Articles / Learn hub** — knowledge base is admin-only, no public reading surface.

### 11.2 Naturally implied by the architecture (🟡 recommended roadmap)
| Priority | Item | Why |
|---|---|---|
| **P0** | Rotate `SHITERU_API_KEY` + `JWT_SECRET`, move to a secret manager, add `.env.example`, restrict CORS, add auth rate limiting | active credential leak |
| **P0** | **Truth-in-UI pass**: remove/repair the scan CTA and bottom-nav centre tab, fix checkout-success auto-confirm copy, fix the PDF-vs-image proof mismatch, fix the corrupt `.filter-chip[data-active]` CSS | credibility + correctness |
| **P1** | Ship the 4 orphaned backend features as UI: **reviews write**, **rewards redemption**, **saved addresses**, **onboarding survey → `/recommendations`** | highest cost-per-value; code already exists |
| **P1** | Wire search (`q`), server-side sort/filter, and delete the duplicated client filter logic | dead inputs are user-visible bugs |
| **P1** | Admin **payment-proof viewer** + reject-reason display to the customer | admins currently approve blind |
| **P1** | Replace fabricated ratings/review counts with honest "New" state until real reviews exist | compliance / trust |
| **P2** | Payment gateway (Midtrans/Xendit QRIS + VA + e-wallet), webhook-driven auto-confirmation | removes the manual bottleneck |
| **P2** | Inventory/stock model + low-stock signals | currently unbounded |
| **P2** | Courier integration (RajaOngkir / Biteship) for real ETAs, tracking numbers, webhooks | unlocks real "Shipped/Delivered" |
| **P2** | Object storage (S3/Cloudflare R2) for payment proofs + product images | stop bloating Mongo docs |
| **P2** | Admin AI playground UI + conversation browser UI + AI cost/token dashboards | operability of the flagship feature |
| **P2** | Actually enforce feature flags in both backend and frontend | currently a placebo console |
| **P3** | Embedding-based RAG (replace `$text` keyword search), streaming responses, multi-provider fallback | answer quality + latency |
| **P3** | Password reset, email verification, refresh tokens, session revocation, 2FA for admins | account security |
| **P3** | PDP/UU-PDP: consent capture, data export, account deletion, retention policy | legal |
| **P3** | Test suite (pytest for the 51 routes, RTL for pages), CI, migrations, real `test_result.md` state | the whole QA loop is currently empty |
| **P3** | i18n (the app is inconsistently English/Indonesian), currency/locale consolidation | Indonesia-first product |
| **P3** | Fold the Superadmin console into the mobile design system; replace `window.confirm/prompt` | cohesion |
| **P4** | Real skin-scan capability (on-device or API) — only if it can be done credibly | the current mock is the brand's weakest promise |
| **P4** | Subscriptions / auto-refill, referral program, community, Learn hub, PWA/offline, multi-warehouse | growth surface |

---

## 12. Current condition — day-by-day operational reality (2026-09-15)

| Aspect | Observed today |
|---|---|
| Frontend | `:3000` → HTTP **200**, healthy (CRA dev server) |
| Backend | `:8001` → HTTP **200**, `/api/` returns ok |
| Database | `mongodb://localhost:27017` reachable, 18 collections, indexes built |
| Catalog | **6 products**, all seeded, `active` field **absent** on all (treated as active) |
| Users | 5 (1 superadmin: `readgrou@gmail.com`) |
| Orders | 3 — **2 stuck in `awaiting_transfer`** (since 2026-08-24), 1 approved |
| Reviews | **0** — yet catalogue shows 4.6–4.9 ★ / 88–302 reviews |
| Addresses / Onboarding / Redemptions | **0 / 0 / 0** |
| AI | **Working** — live Shiteru call returned a grounded Indonesian answer and a correct escalation refusal |
| AI conversations | 6 stored, all from anonymous identities, none from customers |
| Feature-flag overrides | **none saved** |
| Demo seeder | off (`.env` `SEED_DEMO_DATA=0`) |
| Health-check plugin | off |
| Tests | **none exist**; `test_reports/pytest/` empty |
| `test_result.md` | protocol boilerplate only — **no task rows at all** |
| Provenance | `Auto-generated changes` commit at 04:30 today; before that 3 phase commits (Phase 3 backend, Phase 4 Ask YAGI) |
| Delivery ETAs shown to users | **correctly regenerated for today**: regular "Arrives 17 Sep–19 Sep", express "Arrives 16 Sep" |
| Contest banner shown | "closes 05 Sept 2026" — **already past** |

---

## 13. Final verdict

**YAGI is ~70% a real product and ~30% a beautifully-crafted mock — and the mock is placed exactly where the marketing is loudest.**

- The **commerce spine is genuine**: identity, cart, checkout, orders, loyalty ledger, impact ledger, admin ops and analytics all persist and behave correctly. Server-side price authority and the idempotent point-release are better than many production apps.
- The **AI assistant is the standout**: real model, real retrieval, real citations, real rate limits, real escalation safety — verified working live today.
- The **skin scan is entirely fictional**, and it is load-bearing: it powers the hero, the bottom-nav centre tab, the "Coming soon" card, the "Why this fits you" narrative, the match scores, and 15 of the 100 wellness points — **none of which are computed.**
- **Four finished backend features have no user interface** (reviews, rewards redemption, addresses, onboarding/recommendations) while **two UI features have no backend** (voucher, scan). The product is simultaneously ahead of and behind itself.
- **Zero tests, zero test IDs, zero CI, empty QA state** — nothing here is regression-protected.
- **Live secrets are committed.** This should be fixed before anything else ships.

**If only five things get done next (in order):** rotate the leaked credentials → make the UI stop claiming things that don't exist (scan, auto-confirm, ratings) → ship the four orphaned backend features → add the admin proof viewer → start a test suite. Those five move YAGI from "impressive demo" to "shippable product" faster than any new feature.

---

*Document generated 2026-09-15 from a full read of `backend/server.py` (1,769 LOC), all 14 frontend pages, all 16 bespoke components, `lib/api.js`, `store/YagiContext.jsx`, all configs, plus live probing of `:8001`, `:3000` and the MongoDB `test_database`.*
