# YAGI Release Checklist

## Pre-Deploy
- [ ] Run `pytest -q tests/test_phase4_integrity.py tests/test_care_loop_evidence.py tests/test_phase6_hardening.py`.
- [ ] Run `cd frontend && yarn build`.
- [ ] Run `git diff --check`.
- [ ] Confirm no `.env`, build output, test database data, or credentials are staged for release.
- [ ] Confirm `SEED_DEMO_DATA=0` and a non-production test guard is retained.

## Deploy
- [ ] Apply production environment configuration from `DEPLOYMENT_CHECKLIST.md`.
- [ ] Deploy backend and frontend with SPA fallback.
- [ ] Verify `GET /api/health`.

## Post-Deploy
- [ ] Run customer smoke path: browse -> bag -> checkout -> transfer instructions.
- [ ] Confirm only Superadmin can approve payment.
- [ ] Verify Care Loop direct-load and evidence insufficient-data presentation if applicable.
- [ ] Verify protected-route expiry returns a safe authentication error.

## Competition Demo
- [ ] Open `/care-loop` in a fresh logged-out browser session.
- [ ] Confirm the Sari journey is visibly labeled seeded and fictional.
- [ ] Confirm evidence does not include demo data and Shop CTA resolves.
- [ ] Treat live Ask YAGI as optional; use the labeled deterministic safety chapter if its provider is unavailable.

## Rollback / Recovery
- [ ] Use the hosting platform's documented previous-deployment rollback action if a release regression occurs.
- [ ] Do not run destructive database resets for demo recovery.
- [ ] Restore data only through the verified owner/provider backup process.
