---
phase: 11-analyze-project-and-prepare-for-production-integrate-posthog-monitoring
plan: "04"
subsystem: ui
tags: [posthog, analytics, funnel, ecommerce, events]

# Dependency graph
requires:
  - phase: 11-03
    provides: PostHog provider and page view tracking wired into Next.js layout
provides:
  - product_viewed event in ViewTracker on product page mount
  - add_to_cart event in AddToCartButton after confirmed Shopify add success
  - remove_from_cart event in RemoveItemButton after confirmed cart remove success
  - checkout_started event in ContactInfoForm on checkout entry mount
  - payment_initiated event in PaymentForm before createOrder call
  - order_placed event in PaymentForm after confirmed order success with order_id and amount
affects: [posthog-dashboards, funnel-analysis, conversion-tracking]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "PostHog funnel events: import usePostHog, call posthog?.capture() with optional chaining after confirmed success"
    - "checkout_started fires on ContactInfoForm mount (checkout entry client component)"

key-files:
  created: []
  modified:
    - src/entities/recently-viewed/ui/ViewTracker.tsx
    - src/entities/product/ui/AddToCartButton.tsx
    - src/features/header/cart/ui/RemoveItemButton.tsx
    - src/features/checkout/payment/ui/PaymentForm.tsx
    - src/features/checkout/contact-info/ui/ContactInfoForm.tsx

key-decisions:
  - "checkout_started placed in ContactInfoForm (not a non-existent CheckoutEntry.tsx) — this is the first client component the user sees when entering checkout"
  - "posthog?.capture() optional chaining used throughout — safe if PostHog fails to initialize"
  - "Events fire only on confirmed success paths (result.success, orderResult.success) — no events on error paths"
  - "add_to_cart captures product_id, variant_id, quantity=1 — price omitted (not in scope at success point)"
  - "order_placed captures order_id, order_name, amount, currency, payment_method — full funnel data"

patterns-established:
  - "PostHog event placement: import usePostHog -> const posthog = usePostHog() -> posthog?.capture() at confirmed-success point"
  - "Funnel event order: product_viewed -> add_to_cart -> checkout_started -> payment_initiated -> order_placed"

requirements-completed: [PROD-11-04]

# Metrics
duration: 2min
completed: 2026-03-08
---

# Phase 11 Plan 04: PostHog Checkout Funnel Events Summary

**Six PostHog funnel events wired across 5 existing client components: product_viewed, add_to_cart, remove_from_cart, checkout_started, payment_initiated, order_placed**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-08T07:36:38Z
- **Completed:** 2026-03-08T07:38:17Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Full product_viewed -> add_to_cart -> checkout_started -> payment_initiated -> order_placed funnel instrumented
- All 6 events use posthog?.capture() optional chaining — safe if PostHog fails to init
- Events only fire on confirmed success paths, never on error paths
- remove_from_cart added as supplementary funnel signal (cart abandonment tracking)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add product_viewed, add_to_cart, and remove_from_cart events** - `0d4843e` (feat)
2. **Task 2: Add checkout_started, payment_initiated, order_placed events** - `76690b2` (feat)

## Files Created/Modified

- `src/entities/recently-viewed/ui/ViewTracker.tsx` - Added product_viewed capture on mount
- `src/entities/product/ui/AddToCartButton.tsx` - Added add_to_cart capture after result.success
- `src/features/header/cart/ui/RemoveItemButton.tsx` - Added remove_from_cart capture after result.success
- `src/features/checkout/contact-info/ui/ContactInfoForm.tsx` - Added checkout_started capture on mount (checkout entry)
- `src/features/checkout/payment/ui/PaymentForm.tsx` - Added payment_initiated (before createOrder) and order_placed (after confirmed success)

## Decisions Made

- `checkout_started` placed in `ContactInfoForm` (the first client component of the checkout flow) rather than the non-existent `CheckoutEntry.tsx`. The plan specified to find the checkout entry client component, and `ContactInfoForm` is the first interactive client component on the `/checkout/info` route.
- `add_to_cart` does not include price — it is not in scope at the success callback point. product_id, variant_id, and quantity=1 are captured.
- `order_placed` captures the full set: order_id, order_name, amount, currency, payment_method.

## Deviations from Plan

None — plan executed exactly as written (CheckoutEntry.tsx substitution was anticipated by the plan itself).

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Full e-commerce funnel is instrumented in PostHog
- PostHog dashboards can now track: product views, add-to-cart rate, checkout initiation, payment attempts, and order completion rate
- No blockers for production readiness

---
*Phase: 11-analyze-project-and-prepare-for-production-integrate-posthog-monitoring*
*Completed: 2026-03-08*
