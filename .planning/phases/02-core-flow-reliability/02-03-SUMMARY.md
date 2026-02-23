---
phase: 02-core-flow-reliability
plan: "03"
subsystem: auth
tags: [better-auth, anonymous-sessions, prisma, promise-allsettled, error-propagation]

# Dependency graph
requires: []
provides:
  - "onLinkAccount handler with named Promise.allSettled result checking in auth.ts"
  - "linkAnonymousDataToUser that re-throws Prisma transaction errors in on-link-account.ts"
affects: [auth, account-linking, error-observability]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Promise.allSettled result destructuring: capture as named variables and check each .status"
    - "Structured error logging before re-throw: log { step, error } then throw error"

key-files:
  created: []
  modified:
    - src/features/auth/lib/auth.ts
    - src/features/auth/lib/on-link-account.ts

key-decisions:
  - "Remove outer try/catch around Promise.allSettled — allSettled never rejects, wrapping it is misleading and was masking real errors"
  - "Re-throw after logging in linkAnonymousDataToUser — satisfies CONTEXT.md decision: propagate Prisma transaction errors up to caller"
  - "Log orderId: undefined in onLinkAccount rejections — field kept consistent with error shape convention even when not applicable"

patterns-established:
  - "Promise.allSettled: always destructure result into named variables and check each for rejection status"
  - "Error propagation: catch-log-rethrow pattern makes failures visible at both the source and the caller"

requirements-completed: [RELY-03]

# Metrics
duration: 1min
completed: 2026-02-23
---

# Phase 2 Plan 03: Account Linking Failure Observability Summary

**Promise.allSettled results destructured and checked by name in onLinkAccount; linkAnonymousDataToUser now re-throws Prisma transaction errors after structured logging**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-02-23T09:56:40Z
- **Completed:** 2026-02-23T09:57:29Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- `linkAnonymousDataToUser` now re-throws Prisma transaction errors after logging `{ step, error }`, making the rejection visible to `Promise.allSettled` at the caller
- `onLinkAccount` in `auth.ts` captures allSettled results as `[cartMergeResult, dataLinkResult]` and checks each individually for rejection
- Removed misleading outer `try/catch` around `Promise.allSettled` (allSettled never rejects — the old catch block was dead code that created a false impression)
- Each rejected result logs structured `{ step, userId, orderId: undefined, error }` via `console.error`

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix on-link-account.ts to re-throw Prisma transaction errors** - `54b1930` (fix)
2. **Task 2: Capture and check Promise.allSettled results in auth.ts** - `e75ff55` (fix)

## Files Created/Modified

- `src/features/auth/lib/on-link-account.ts` - Changed catch to log structured `{ step, error }` AND re-throw, so rejection surfaces to allSettled caller
- `src/features/auth/lib/auth.ts` - Replaced discarded allSettled call with named destructuring; added per-result rejection checks with structured logging; removed dead outer try/catch

## Decisions Made

- Remove outer try/catch around Promise.allSettled: allSettled never rejects, so the catch was unreachable dead code that also gave a false impression the call could throw. Partial failure handling now lives where it should — in the per-result checks.
- Re-throw after logging in `on-link-account.ts` honors the CONTEXT.md decision "If a Prisma transaction fails: propagate the error up." Without the re-throw, `Promise.allSettled` always saw a fulfilled promise even on transaction failure.
- `orderId: undefined` included in rejection log shape for consistency with the error-logging convention across the codebase.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Both changes were straightforward targeted edits; TypeScript compilation confirmed clean after both tasks.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Account linking failures are now observable via console.error logs with structured context (step, userId, error)
- Both partial failure paths (cart merge rejection and data link rejection) are independently detectable
- Ready for Phase 2 Plan 04

---
*Phase: 02-core-flow-reliability*
*Completed: 2026-02-23*
