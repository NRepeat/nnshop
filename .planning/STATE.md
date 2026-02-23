# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-23)

**Core value:** The checkout-to-order flow works reliably and securely for every user — anonymous or authenticated — without data leaks, silent failures, or broken UI.
**Current focus:** Phase 3 — Visible Bug Fixes

## Current Position

Phase: 3 of 5 (Visible Bug Fixes)
Plan: 3 of TBD in current phase
Status: In progress
Last activity: 2026-02-23 — Completed 03-03 (quick-view variant selection fixed, useCartUIStore created, CartSheetController RSC composition pattern)

Progress: [████░░░░░░] 40%

## Performance Metrics

**Velocity:**
- Total plans completed: 3
- Average duration: 2.7 min
- Total execution time: 0.13 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-security | 2 | 7 min | 3.5 min |
| 02-core-flow-reliability | 1 | 1 min | 1 min |

**Recent Trend:**
- Last 5 plans: 01-01 (3 min), 01-02 (4 min), 02-03 (1 min)
- Trend: Consistent (3 plans)

*Updated after each plan completion*
| Phase 02-core-flow-reliability P02 | 2 | 3 tasks | 2 files |
| Phase 02-core-flow-reliability P01 | 3 | 2 tasks | 1 files |
| Phase 03-visible-bug-fixes P01 | 1 | 1 tasks | 1 files |
| Phase 03-visible-bug-fixes P02 | 8 | 2 tasks | 4 files |
| Phase 03-visible-bug-fixes P03 | 6 | 2 tasks | 6 files |
| Phase 04-code-quality P03 | 4 | 2 tasks | 1 files |
| Phase 04-code-quality P04 | 4 | 2 tasks | 4 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Init]: Sentry chosen for error tracking (excellent Next.js integration, generous free tier)
- [Init]: DOMPurify adopted for HTML sanitization (belt-and-suspenders even for trusted Shopify source)
- [Init]: No test infrastructure this milestone; code fixes are the priority
- [Init]: Fix fragile flows without full rewrite — add logging, transactions, idempotency within existing structure
- [01-01]: Empty databaseHooks.user.create.after handler kept as async () => {} — no parameter, preserves hook registration point for future use
- [01-01]: Server actions handling PII must not use console.log; use console.error only in catch blocks
- [01-02]: isomorphic-dompurify pinned to ^2.36.0 (not @latest); v3.x uses ESM-only jsdom@28 which breaks CommonJS require() on Vercel
- [01-02]: t.raw('shippingAndReturnsContent') dangerouslySetInnerHTML in ProductInfo.tsx not sanitized — developer-controlled translation string, not external HTML
- [01-02]: next.config.ts allowedDevOrigins is dev-server-only and does NOT affect Server Action CSRF protection
- [02-03]: Remove outer try/catch around Promise.allSettled — allSettled never rejects; the catch was dead code masking real errors
- [02-03]: Re-throw after logging in linkAnonymousDataToUser — satisfies CONTEXT.md decision: propagate Prisma transaction errors up to caller
- [02-03]: orderId: undefined included in rejection log shape for consistency with error-logging convention
- [Phase 02-02]: Used @features/auth/lib/client for useSession import (not auth-client.ts which doesn't export it) — consistent with codebase pattern
- [Phase 02-02]: DB save catch logs structured { step, userId, orderId, error } shape for Phase 5 Sentry upgrade compatibility — does not re-throw
- [Phase 02-01]: withRetry wraps only addLinesToCart — buyer identity update is non-fatal and logged but not retried
- [Phase 02-01]: Shopify API calls execute before prisma.$transaction to avoid 5s timeout exhaustion on network I/O
- [Phase 02-01]: toast() not toast.error() for cart merge failure — neutral phrasing per CONTEXT.md UX decision
- [Phase 03-01]: Removed console.error from FavSession catch block — Phase 1 decision states client handlers should not log to console; toast is the user-facing signal
- [Phase 03-01]: Used toast() (neutral) not toast.error() for FavSession error feedback — consistent with Phase 2 UX pattern for cart merge failure
- [Phase 03-visible-bug-fixes]: VIBER_PHONE_NUMBER env var has no NEXT_PUBLIC_ prefix — AnnouncementBar is a Server Component, phone number must not be exposed to client bundle
- [Phase 03-visible-bug-fixes]: Viber phone resolution priority: Sanity viberPhone -> VIBER_PHONE_NUMBER env -> null (link hidden when both empty)
- [Phase 03-03]: CartSheetController uses children pattern not direct import — required for RSC compatibility; functions cannot cross server/client boundary
- [Phase 03-03]: Cart Sheet outer wrapper moved to CartSheetController; CartSheet renders only SheetTrigger+content fragment; onOpenChange handles both open (openCart) and close (closeCart) in controlled mode
- [Phase 03-03]: AddToCartButton onSuccess called after result.success — fires only on confirmed Shopify add success, not on error paths
- [Phase 04-code-quality]: Unexported inline interfaces AnonymousUserArg and NewUserArg used instead of T & Record<string, any> for cart buyer identity update parameters

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-02-23
Stopped at: Completed 03-03-PLAN.md — quick-view variant selection fixed with useCartUIStore, CartSheetController RSC composition pattern, and post-add modal close + cart open flow
Resume file: None
