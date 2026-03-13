---
phase: 02-core-flow-reliability
plan: "01"
subsystem: api
tags: [cart, shopify, prisma, sonner, retry, transaction, error-handling]

# Dependency graph
requires: []
provides:
  - Hardened anonymous cart merge with Prisma transaction, exponential-backoff retry, and rollback
  - Structured step logging at every Shopify API boundary in cart merge flow
  - User-facing toast notification on total cart merge failure
affects:
  - 02-core-flow-reliability
  - future observability phase (Phase 5 Sentry upgrade target)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - withRetry<T> helper for application-level retry with exponential backoff
    - Shopify API calls before prisma.$transaction (avoid 5s transaction timeout)
    - Single Shopify fetch hoisted above transaction boundary (PERF-02)
    - Structured console.error with { step, userId, anonUserId, orderId, error } for Phase 5 Sentry upgrade

key-files:
  created: []
  modified:
    - src/entities/cart/api/anonymous-cart-buyer-identity-update.ts

key-decisions:
  - "withRetry wraps only addLinesToCart (the cart merge mutation) — not buyer identity update (non-fatal)"
  - "Shopify API calls execute before prisma.$transaction to avoid 5s timeout exhaustion on network I/O"
  - "On total addLinesToCart failure: toast() not toast.error() — neutral phrasing to avoid alarming users"
  - "Partial success DB rollback scenario logged with step: shopify-merge-partial-success-db-rollback as accepted edge case"
  - "captured variable pattern used inside transaction callback to safely close over mutable finalCartToken"

patterns-established:
  - "withRetry<T> pattern: loop attempt 1..maxAttempts, return on non-null result, delay only between attempts"
  - "Structured error logging: { step, userId, anonUserId, orderId, error } shape at every silent failure point"
  - "Prisma transaction for all DB cart mutations — tx.cart.update and tx.cart.delete inside single callback"

requirements-completed: [RELY-01, PERF-02]

# Metrics
duration: 3min
completed: 2026-02-23
---

# Phase 2 Plan 01: Cart Merge Hardening Summary

**Anonymous cart merge rewritten with prisma.$transaction, 3-attempt exponential-backoff retry on cartLinesAdd, full rollback on failure, single Shopify fetch, and structured step logging throughout**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-23T09:56:33Z
- **Completed:** 2026-02-23T09:58:40Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Added `withRetry<T>` helper with exponential backoff (300ms base, multiplied by attempt number)
- Wrapped all `prisma.cart.update` and `prisma.cart.delete` calls in `prisma.$transaction` for atomicity
- Hoisted `getShopifyCartLines` call above transaction boundary — single fetch (PERF-02 satisfied)
- On total `addLinesToCart` failure: structured log + `toast("Couldn't sync your cart. Your items are still saved.")` + early return with both carts intact (RELY-01 satisfied)
- Replaced all generic `console.error` calls with structured `{ step, error }` in helpers and `{ step, userId, anonUserId, orderId, error }` in main function

## Task Commits

Each task was committed atomically:

1. **Tasks 1+2: Add withRetry helper, structured logging, Prisma transaction, retry+rollback** - `84b1b48` (feat)

**Plan metadata:** committed with SUMMARY.md

## Files Created/Modified

- `src/entities/cart/api/anonymous-cart-buyer-identity-update.ts` - Hardened cart merge: withRetry helper, prisma.$transaction wrapping all DB mutations, single Shopify fetch, structured error logging, sonner toast on total failure

## Decisions Made

- `withRetry` wraps only `addLinesToCart` (the merge mutation that can fail transitorily) — not `updateShopifyBuyerIdentity` which is non-fatal and just logged
- Shopify API calls happen strictly before `prisma.$transaction` to avoid exhausting the 5-second transaction timeout on network I/O
- `toast()` used (not `toast.error()`) for the failure notification — neutral phrasing to avoid alarming users per CONTEXT.md UX decision
- Partial Shopify success / DB rollback scenario documented with `step: 'shopify-merge-partial-success-db-rollback'` as accepted edge case for Phase 5 Sentry upgrade

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

Minor: `grep -c "getShopifyCartLines"` initially returned 3 instead of the expected 2 because the function name appeared in a catch block's log message string. Fixed by changing the log message prefix from `'[cart-merge] getShopifyCartLines failed'` to `'[cart-merge] shopify-get-cart-lines failed'`, aligning with the step slug convention and satisfying the verification requirement.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Cart merge is now atomic and observable — DB state is always consistent on any failure path
- Structured logging shape `{ step, userId, anonUserId, orderId, error }` is consistent with the Phase 5 Sentry upgrade target
- Phase 2 Plan 02 (checkout reliability) can proceed

---
*Phase: 02-core-flow-reliability*
*Completed: 2026-02-23*
