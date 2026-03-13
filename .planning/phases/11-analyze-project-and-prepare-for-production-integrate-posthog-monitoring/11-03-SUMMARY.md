---
phase: 11-analyze-project-and-prepare-for-production-integrate-posthog-monitoring
plan: 03
subsystem: infra
tags: [posthog, analytics, monitoring, pageview, identify, error-tracking]

# Dependency graph
requires:
  - phase: 11-analyze-project-and-prepare-for-production-integrate-posthog-monitoring
    provides: PostHog API key in env, production checklist context
provides:
  - PostHog client-side initialization with SSR guard
  - Manual pageview tracking on every App Router navigation
  - User identify/reset tied to better-auth session state
  - PostHog exception capture in the global error boundary
affects: [11-04-checkout-funnel-events]

# Tech tracking
tech-stack:
  added: [posthog-js ^1.359.1]
  patterns:
    - PostHogProvider as outermost client provider with typeof window SSR guard
    - AnalyticsIdentifier child component pattern to call hooks inside PostHogProvider context
    - Suspense boundary wrapping PostHogPageView for App Router useSearchParams compliance

key-files:
  created:
    - src/shared/lib/posthog/PostHogProvider.tsx
    - src/shared/lib/posthog/PostHogPageView.tsx
    - src/shared/lib/posthog/usePostHogIdentify.ts
  modified:
    - src/app/providers/index.tsx
    - app/[locale]/(frontend)/layout.tsx
    - app/[locale]/(frontend)/error.tsx

key-decisions:
  - "PostHogProvider wraps NextIntlClientProvider as outermost provider — ensures PostHog context available to all client components"
  - "AnalyticsIdentifier inline component calls usePostHogIdentify inside PostHogProvider — hooks cannot be called in non-hook context"
  - "capture_pageview: false in posthog.init() prevents double-counting — PostHogPageView fires $pageview manually"
  - "posthog._isIdentified() guards prevent redundant identify/reset calls on every session re-render"
  - "error.tsx uses posthog?.captureException (optional chain) — safe when PostHog not yet initialized"

patterns-established:
  - "PostHog SSR guard: typeof window !== 'undefined' wraps posthog.init() in module scope"
  - "Pageview tracking: useEffect on [pathname, searchParams, posthog] fires $pageview with full URL"
  - "Auth identify pattern: useSession → identify on sign-in, reset on sign-out"

requirements-completed: [PROD-11-03]

# Metrics
duration: 5min
completed: 2026-03-08
---

# Phase 11 Plan 03: PostHog Provider Infrastructure Summary

**posthog-js installed with SSR-safe init, App Router pageview tracking, better-auth user identification, and exception capture in error boundary**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-08T07:34:00Z
- **Completed:** 2026-03-08T07:39:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- PostHog initialized client-side with SSR guard — no crash on server render
- Every route navigation fires `$pageview` event via PostHogPageView in Suspense boundary
- Authenticated users identified by better-auth userId/email; anonymous users get posthog.reset() on sign-out
- Global error boundary reports exceptions to PostHog via captureException instead of console.error

## Task Commits

1. **Task 1: Install posthog-js and create PostHog provider files** - `0e513c0` (feat)
2. **Task 2: Wire PostHog into Providers and layout, update error boundary** - `4330bfd` (feat)

## Files Created/Modified

- `src/shared/lib/posthog/PostHogProvider.tsx` - Client component with SSR guard and posthog.init(); exports PostHogProvider
- `src/shared/lib/posthog/PostHogPageView.tsx` - Manual pageview tracking for App Router using usePathname/useSearchParams
- `src/shared/lib/posthog/usePostHogIdentify.ts` - Hook linking better-auth session to PostHog identify/reset
- `src/app/providers/index.tsx` - PostHogProvider added as outermost wrapper; AnalyticsIdentifier calls usePostHogIdentify
- `app/[locale]/(frontend)/layout.tsx` - PostHogPageView added inside Suspense fallback={null} inside Providers
- `app/[locale]/(frontend)/error.tsx` - captureException replaces console.error; imports usePostHog

## Decisions Made

- PostHogProvider is outermost wrapper in Providers component — ensures PostHog context is available to all nested client components including AnalyticsIdentifier
- AnalyticsIdentifier inline component pattern — usePostHogIdentify cannot be called from Providers directly (not inside PHProvider context); child component solves this cleanly
- capture_pageview: false — prevents PostHog's automatic pageview from double-counting with manual PostHogPageView
- posthog._isIdentified() guards — prevents redundant identify/reset calls on every session change re-render
- Optional chain posthog?.captureException — safe when PostHog not yet initialized (e.g., env key missing in dev)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

Add these environment variables before deploying:

```
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

Both are available in the PostHog project settings dashboard.

## Next Phase Readiness

- PostHog foundation complete — Plan 04 (checkout funnel event tracking) can now call posthog.capture() from any client component
- All page views tracked automatically on navigation
- Users identified on sign-in; ready for funnel analysis by user segment

---
*Phase: 11-analyze-project-and-prepare-for-production-integrate-posthog-monitoring*
*Completed: 2026-03-08*
