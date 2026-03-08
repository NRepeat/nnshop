---
phase: 11-analyze-project-and-prepare-for-production-integrate-posthog-monitoring
plan: 01
subsystem: infra
tags: [robots, seo, security, env-vars, sanity, webhooks]

# Dependency graph
requires: []
provides:
  - Production-correct robots.txt allowing crawlers on public routes
  - Server-only SANITY_REVALIDATE_SECRET (no NEXT_PUBLIC_ prefix)
  - layout.tsx metadata without noindex — site is indexable by default
affects: [seo, sanity-webhooks, production-deploy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Webhook secrets use server-only env vars (no NEXT_PUBLIC_ prefix)"
    - "robots.ts: allow '/' + targeted disallows for internal paths"

key-files:
  created: []
  modified:
    - app/robots.ts
    - app/[locale]/(frontend)/layout.tsx
    - src/shared/sanity/env.ts
    - app/api/revalidate/menu/route.ts
    - app/api/revalidate/path/route.ts

key-decisions:
  - "SANITY_REVALIDATE_SECRET (no NEXT_PUBLIC_) is server-only — used in API routes and env.ts; intentionally unavailable in client bundle"
  - "robots.ts: disallow array covers /api/, /studio/, /uk/auth/, /ru/auth/, /checkout/ — all other paths crawlable"
  - "layout.tsx: robots field omitted entirely (not set to 'index') — Next.js default allows indexing without explicit declaration"
  - "Three debug console.log calls removed from path/route.ts — logged req object and revalidation arrays to server output"

patterns-established:
  - "Webhook secrets: never use NEXT_PUBLIC_ prefix; read via process.env or assertValue in server-only env.ts"

requirements-completed: [PROD-11-01]

# Metrics
duration: 5min
completed: 2026-03-08
---

# Phase 11 Plan 01: Production Blocking Fixes Summary

**robots.ts unblocked from disallow-all, NEXT_PUBLIC_ webhook secret moved to server-only, and noindex metadata removed — site is now search-engine indexable**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-08T07:23:00Z
- **Completed:** 2026-03-08T07:28:51Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- robots.ts now allows all public routes and only disallows `/api/`, `/studio/`, `/uk/auth/`, `/ru/auth/`, `/checkout/`
- NEXT_PUBLIC_SANITY_REVALIDATE_SECRET renamed to SANITY_REVALIDATE_SECRET in env.ts and menu/route.ts; no longer exposed to client bundle
- `robots: 'noindex'` removed from layout.tsx metadata — indexing enabled by Next.js default
- Three debug console.log calls removed from path/route.ts (logged req, revalidatedPaths, revalidatedTags)

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix robots.ts and remove noindex from layout metadata** - `dc19ff3` (fix)
2. **Task 2: Rename NEXT_PUBLIC_SANITY_REVALIDATE_SECRET to server-only SANITY_REVALIDATE_SECRET** - `61d9587` (fix)

## Files Created/Modified
- `app/robots.ts` - Fixed from disallow-all to allow public + targeted disallows
- `app/[locale]/(frontend)/layout.tsx` - Removed `robots: 'noindex'` from metadata export
- `src/shared/sanity/env.ts` - revalidateSecret now reads SANITY_REVALIDATE_SECRET (no NEXT_PUBLIC_)
- `app/api/revalidate/menu/route.ts` - SECRET reads SANITY_REVALIDATE_SECRET directly
- `app/api/revalidate/path/route.ts` - Removed 3 debug console.log calls

## Decisions Made
- SANITY_REVALIDATE_SECRET kept as server-only — both API routes are server-side, no client access needed
- robots field omitted entirely from layout.tsx (not set to `'index'`) — omission uses Next.js default which allows indexing
- Vercel environment variable must be manually renamed in the dashboard from NEXT_PUBLIC_SANITY_REVALIDATE_SECRET to SANITY_REVALIDATE_SECRET before next deploy

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required

**Vercel dashboard action required before deploying:** Rename the environment variable `NEXT_PUBLIC_SANITY_REVALIDATE_SECRET` to `SANITY_REVALIDATE_SECRET` in the Vercel project settings. The code now reads the server-only name; if the old Vercel var still uses the NEXT_PUBLIC_ prefix, both revalidate routes will receive an empty string and return 401 for all webhook calls.

## Next Phase Readiness
- Site is now indexable and robots.txt is production-correct
- Sanity webhook secret is server-side only — no client bundle exposure
- Ready to continue Phase 11 plans (PostHog integration, remaining production readiness work)

---
*Phase: 11-analyze-project-and-prepare-for-production-integrate-posthog-monitoring*
*Completed: 2026-03-08*
