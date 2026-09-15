# YAGI Deployment Checklist

## Runtime Configuration
- [ ] Set `APP_ENV=production`.
- [ ] Set non-local `MONGO_URL` and a non-test `DB_NAME`.
- [ ] Set a strong, unique `JWT_SECRET`; the API refuses insecure production defaults.
- [ ] Set exact `CORS_ORIGINS` for the deployed frontend. Wildcards are rejected in production.
- [ ] Set `REACT_APP_BACKEND_URL` to the backend origin, without `/api`.
- [ ] Configure `SHITERU_API_KEY`, `SHITERU_BASE_URL`, and `SHITERU_MODEL` if live Ask YAGI is required.
- [ ] Set `SUPERADMIN_EMAILS` to the owner-controlled bootstrap allowlist.
- [ ] Confirm static manual bank-transfer details are correct before launch.
- [ ] Keep `SEED_DEMO_DATA=0` in production.

## Build And Start
- [ ] Frontend build: `cd frontend && yarn build`.
- [ ] Serve `frontend/build` with SPA fallback to `index.html` so direct application routes resolve.
- [ ] Backend start: `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT`.
- [ ] Configure the hosting runtime port through its `PORT` setting or launch argument.
- [ ] Probe `GET /api/health`; it returns service status only and does not expose secrets.

## Post-Deploy Smoke Test
- [ ] Open `/`, `/shop`, a product route, `/cart`, `/auth`, `/care-loop`, and an invalid route directly.
- [ ] Confirm the configured frontend origin can call the API and an unlisted origin cannot.
- [ ] Confirm security headers are present: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, and CSP frame ancestors.
- [ ] Verify a normal customer cannot access Superadmin endpoints.
- [ ] Verify manual proof submission remains `under_review` until Superadmin approval.
- [ ] Verify `/care-loop` works logged out and its evidence response is aggregate-only.

## Owner-Side Operations
- [ ] VERIFY DATABASE BACKUP / RESTORE POLICY with the managed database provider.
- [ ] Rotate/revoke any credential previously exposed in historical local files or deployment logs; this repository cannot perform external rotation.
- [ ] Verify domain, DNS, TLS/SSL, and reverse-proxy SPA fallback on the chosen host.
- [ ] Supply competition URL, official wording, deadline, organization/team name, and any legitimate social destination if required.
