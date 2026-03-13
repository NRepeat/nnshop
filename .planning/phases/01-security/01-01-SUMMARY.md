---
phase: 01-security
plan: "01"
subsystem: auth
tags: [better-auth, prisma, shopify, pii, logging, security]

# Dependency graph
requires: []
provides:
  - PII-free server logging in auth, cart-merge, and order-creation flows
affects: [02-error-tracking, 03-sanitization, 04-resilience, 05-checkout]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "console.log removed from server flows that handle user IDs, emails, and cart tokens; console.error preserved in catch blocks for error observability"

key-files:
  created: []
  modified:
    - src/features/auth/lib/auth.ts
    - src/features/auth/lib/on-link-account.ts
    - src/entities/cart/api/anonymous-cart-buyer-identity-update.ts
    - src/features/order/api/create.ts

key-decisions:
  - "Empty databaseHooks.user.create.after handler kept as async () => {} rather than removed, to maintain hook registration for future use"
  - "onLinkAccount retains Promise.allSettled to ensure both cart and data migrations are attempted even if one fails"
  - "No functional changes made — pure log removal with zero behavior change"

patterns-established:
  - "Server actions handling PII must not use console.log; use console.error only in catch blocks"

requirements-completed: [BUG-03]

# Metrics
duration: 3min
completed: 2026-02-23
---

# Phase 1 Plan 01: Remove PII-Bearing console.log from Auth and Cart Flows Summary

**Removed all PII-bearing console.log calls (user IDs, emails, partial cart tokens) from four high-risk server files while preserving console.error in catch blocks for error observability.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-02-23T09:14:33Z
- **Completed:** 2026-02-23T09:17:37Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Eliminated console.log statements logging user IDs, email addresses, and partial cart tokens from `auth.ts` databaseHooks and `onLinkAccount` handler
- Removed all debug tracing console.log calls from `linkAnonymousDataToUser` Prisma transaction (13 calls)
- Removed all debug tracing console.log calls from `anonymousCartBuyerIdentityUpdate` (12 calls including partial cart token logging)
- Removed order name console.log from `createOrder` in `create.ts`
- TypeScript compiles clean (tsc --noEmit exits 0); no new lint errors introduced

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove PII console.log from auth.ts and on-link-account.ts** - `8c1c78a` (fix)
2. **Task 2: Remove PII console.log from cart and order files** - `cfbb1a7` (fix)
3. **Task 3: Verify build passes (fix unused parameter)** - `b336755` (fix)

## Files Created/Modified
- `src/features/auth/lib/auth.ts` - Removed console.log from databaseHooks.user.create.after and onLinkAccount; console.error preserved
- `src/features/auth/lib/on-link-account.ts` - Removed 13 console.log calls from linkAnonymousDataToUser; console.error preserved
- `src/entities/cart/api/anonymous-cart-buyer-identity-update.ts` - Removed 12 console.log calls including partial cart token logging; all console.error in helpers preserved
- `src/features/order/api/create.ts` - Removed 1 console.log logging order name; all console.error preserved

## Decisions Made
- Empty `databaseHooks.user.create.after` handler retained as `async () => {}` (parameter removed to avoid lint error) rather than deleted, preserving hook registration point for future observability additions
- `onLinkAccount` simplified to just `Promise.allSettled` without logging — both operations still run in parallel and failures are swallowed silently (existing behavior, intentional for auth flow resilience)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused `_user` parameter from empty async handler**
- **Found during:** Task 3 (build verification)
- **Issue:** Changed `async (user) => { console.log(...) }` to `async (_user) => {}`, but `_user` was then flagged as unused by ESLint — introducing a new lint error not present in original file
- **Fix:** Changed to `async () => {}` (no parameter) since the handler body is empty and the parameter is not needed
- **Files modified:** src/features/auth/lib/auth.ts
- **Verification:** `npm run lint` no longer shows `_user` error; lint error count unchanged at 74
- **Committed in:** `b336755` (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug fix)
**Impact on plan:** Necessary correction to avoid introducing new lint errors. No scope creep.

## Issues Encountered
- Pre-existing lint errors (74 problems, 46 errors) exist across the codebase; none in the four target files after fixes. The `createShopifyCustomer` unused import in auth.ts was pre-existing and out of scope.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- BUG-03 closed: all four high-risk files now have zero PII-bearing console.log calls
- Console.error error observability intact in all files — ready for Phase 1 Plan 02 (error tracking / Sentry)
- No regressions; TypeScript clean; lint error count not increased

---
*Phase: 01-security*
*Completed: 2026-02-23*
