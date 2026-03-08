---
phase: 11-analyze-project-and-prepare-for-production-integrate-posthog-monitoring
plan: 05
subsystem: infra
tags: [security, headers, env, next.config, hsts, csp]

# Dependency graph
requires:
  - phase: 11-01
    provides: SANITY_REVALIDATE_SECRET rename completed, robots.ts fixed
provides:
  - Security headers (X-Content-Type-Options, X-Frame-Options SAMEORIGIN, Referrer-Policy, Permissions-Policy, HSTS) on all responses via next.config.ts
  - .env.example documenting all required environment variables with safe placeholder values
affects: [deployment, vercel-config, all-http-responses]

# Tech tracking
tech-stack:
  added: []
  patterns: [Next.js headers() function for security hardening, .env.example as deployment documentation]

key-files:
  created: [.env.example]
  modified: [next.config.ts]

key-decisions:
  - "X-Frame-Options SAMEORIGIN (not DENY) — preserves LiqPay payment iframe compatibility"
  - "Permissions-Policy includes geolocation=(self) — required for Nova Poshta widget's navigator.geolocation usage"
  - "No CSP in this phase — deferred due to complexity with Shopify CDN, LiqPay, Nova Poshta, Sanity Studio, PostHog"
  - ".env.example force-committed past .gitignore (.env*) — it is documentation, not secrets"
  - "HSTS max-age=63072000 (2 years) with includeSubDomains and preload — production-grade enforcement"

patterns-established:
  - "Security headers pattern: async headers() in nextConfig alongside async redirects()"
  - "Env documentation pattern: .env.example at repo root with comment blocks per category"

requirements-completed: [PROD-11-05]

# Metrics
duration: 6min
completed: 2026-03-08
---

# Phase 11 Plan 05: Security Headers + Env Documentation Summary

**HTTP security headers (HSTS, X-Frame-Options SAMEORIGIN, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) added to all routes via next.config.ts; .env.example created documenting all 30+ required variables**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-08T07:42:00Z
- **Completed:** 2026-03-08T07:48:33Z
- **Tasks:** 1 auto (checkpoint pending human verification)
- **Files modified:** 2

## Accomplishments
- Security headers applied to all routes via `async headers()` in next.config.ts — protects against clickjacking, MIME sniffing, and information leakage
- X-Frame-Options set to SAMEORIGIN (not DENY) to preserve LiqPay payment iframe
- Permissions-Policy includes `geolocation=(self)` to allow Nova Poshta widget geolocation
- .env.example created at repo root documenting all 30+ required environment variables with safe placeholder values
- SANITY_REVALIDATE_SECRET correctly documented (not NEXT_PUBLIC_) in .env.example

## Task Commits

Each task was committed atomically:

1. **Task 1: Add security headers to next.config.ts and create .env.example** - `378ff71` (feat)

**Plan metadata:** pending (docs commit after state updates)

## Files Created/Modified
- `next.config.ts` - Added async headers() function returning 5 security headers on source: `/(.*)`
- `.env.example` - New file documenting all required env vars with safe placeholders and category comments

## Decisions Made
- X-Frame-Options SAMEORIGIN not DENY — LiqPay payment iframe runs in same-site context, DENY would break payments
- Permissions-Policy geolocation=(self) — NovaPoshtaButton.tsx uses navigator.geolocation for delivery address detection
- No CSP in this phase — deferred; too complex with Shopify CDN, LiqPay, Nova Poshta, Sanity Studio, PostHog all requiring separate directives
- .env.example force-committed with `git add -f` because `.gitignore` has `.env*` pattern — this file is intentional documentation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Restored SANITY_REVALIDATE_SECRET in sanity/env.ts and menu/route.ts**
- **Found during:** Task 1 (pre-commit git status review)
- **Issue:** Working tree showed `src/shared/sanity/env.ts` and `app/api/revalidate/menu/route.ts` reverted to `NEXT_PUBLIC_SANITY_REVALIDATE_SECRET` (security regression from plan 11-01)
- **Fix:** Re-applied plan 11-01's rename — both files now use `SANITY_REVALIDATE_SECRET` (server-only)
- **Files modified:** src/shared/sanity/env.ts, app/api/revalidate/menu/route.ts
- **Verification:** `grep -r "NEXT_PUBLIC_SANITY_REVALIDATE_SECRET" src/ app/` returns no output
- **Note:** Files matched HEAD after fix (git diff showed clean) — changes were included in task 1 commit

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug: security regression)
**Impact on plan:** Fix was critical for security — prevents webhook secret from being exposed to client bundle.

## Issues Encountered
- `.env.example` blocked by `.gitignore` `.env*` pattern — resolved with `git add -f` since .env.example is intentional documentation not real secrets

## User Setup Required
None - security headers apply automatically at runtime. Copy `.env.example` to `.env.local` and fill in real values.

## Next Phase Readiness
- Phase 11 production readiness complete: robots.txt fixed (plan 01), console.log cleanup (plan 02), PostHog provider + pageview tracking (plan 03), checkout funnel events (plan 04), security headers + env docs (plan 05)
- Ready for build verification and final human review checkpoint
- Checkpoint 2 in this plan requires: `npm run lint`, `npm run build`, visual verification of robots.txt

---
*Phase: 11-analyze-project-and-prepare-for-production-integrate-posthog-monitoring*
*Completed: 2026-03-08*
