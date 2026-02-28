---
phase: 08-recently-viewed-products-section-and-newsletter-subscription-section
plan: "02"
subsystem: ui
tags: [react, next.js, prisma, shopify, better-auth, next-intl, tailwind]

# Dependency graph
requires:
  - phase: 08-01
    provides: recordProductView server action, getProductsByHandles Shopify fetch, RecentlyViewedProduct Prisma model, i18n keys
provides:
  - ViewTracker client component (fire-and-forget product view recording on mount)
  - RecentlyViewedSection server component (per-user carousel of recently viewed products)
  - ProductView wired with ViewTracker + RecentlyViewedSection in Suspense
affects: [08-03, 08-04, product-view]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Invisible client trigger: 'use client' component returning null that fires a server action in useEffect"
    - "Server component Suspense streaming: wrap per-user dynamic server component in <Suspense fallback={null}> for streaming"
    - "Per-user dynamic server component: no 'use cache' on components with auth.api.getSession"

key-files:
  created:
    - src/entities/recently-viewed/ui/ViewTracker.tsx
    - src/entities/recently-viewed/ui/RecentlyViewedSection.tsx
  modified:
    - src/widgets/product-view/ui/ProductView.tsx

key-decisions:
  - "Suspense fallback=null for RecentlyViewedSection — section streams in silently; no skeleton shown"
  - "ViewTracker placed after relatedProducts block at bottom of container — records view without blocking above-fold content"
  - "RecentlyViewedSection guards three null cases: no session, empty DB records, empty Shopify products"

patterns-established:
  - "Invisible tracker pattern: 'use client' + useEffect fire-and-forget + return null for side-effect-only components"
  - "Dynamic per-user server component: no 'use cache', auth session check as first guard, wrapped in Suspense"

requirements-completed: []

# Metrics
duration: 2min
completed: 2026-02-28
---

# Phase 8 Plan 02: Recently Viewed UI Summary

**ViewTracker client component + RecentlyViewedSection server component wired into ProductView with Suspense streaming**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-28T20:29:39Z
- **Completed:** 2026-02-28T20:31:06Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- ViewTracker 'use client' component fires recordProductView on mount (fire-and-forget, no state, returns null)
- RecentlyViewedSection server component fetches up to 10 DB records + Shopify data, renders CardCarousel matching ProductCarousel pattern
- ProductView wired with both components — ViewTracker records views, RecentlyViewedSection streams in via Suspense

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ViewTracker client component** - `021352b` (feat)
2. **Task 2: Create RecentlyViewedSection server component** - `4ac9749` (feat)
3. **Task 3: Wire ViewTracker and RecentlyViewedSection into ProductView** - `2c7fb3a` (feat)

## Files Created/Modified
- `src/entities/recently-viewed/ui/ViewTracker.tsx` - 'use client' component, fires recordProductView on mount, returns null
- `src/entities/recently-viewed/ui/RecentlyViewedSection.tsx` - Async server component, guards session/records/products, renders CardCarousel
- `src/widgets/product-view/ui/ProductView.tsx` - Added Suspense, ViewTracker, RecentlyViewedSection imports and usage

## Decisions Made
- Suspense fallback=null for RecentlyViewedSection — section streams in silently after page load; no loading skeleton to avoid layout shift
- ViewTracker placed after relatedProducts block — records view without blocking above-fold rendering
- RecentlyViewedSection has three early-return null guards: no user session, empty DB records, empty Shopify products — section is completely hidden in all these cases

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Recently Viewed UI layer is complete and wired into product pages
- Visiting any product page will record the view and show the carousel for authenticated users with prior views
- Ready for Phase 08-03 (Newsletter subscription UI)

---
*Phase: 08-recently-viewed-products-section-and-newsletter-subscription-section*
*Completed: 2026-02-28*

## Self-Check: PASSED

- FOUND: src/entities/recently-viewed/ui/ViewTracker.tsx
- FOUND: src/entities/recently-viewed/ui/RecentlyViewedSection.tsx
- FOUND: src/widgets/product-view/ui/ProductView.tsx
- FOUND commit: 021352b (ViewTracker)
- FOUND commit: 4ac9749 (RecentlyViewedSection)
- FOUND commit: 2c7fb3a (ProductView wiring)
