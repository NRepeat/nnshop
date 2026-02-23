# Phase 2: Core Flow Reliability - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Make cart merge, checkout, and order creation resilient to partial failures — no data loss, no orphaned DB state, no broken pages. This phase fixes reliability and error handling within existing flows. New features (analytics, admin tooling, etc.) belong in other phases.

</domain>

<decisions>
## Implementation Decisions

### Cart Merge Conflict Resolution
- When both anonymous and authenticated carts exist on login: **merge both** — combine all items, summing quantities for duplicate products
- If Shopify cart merge API fails: **retry automatically, up to 3 times** with exponential backoff
- If all retries fail: **full rollback** — both carts remain intact, nothing is changed, no orphaned state
- Race condition (checkout triggered before merge completes): **block checkout** with a disabled button + spinner until merge finishes

### Transactions
- Account linking DB operations (contact info, delivery info, payment info, orders, favorites): **all-or-nothing** — wrap in a single Prisma transaction; if any step fails, roll back entirely
- Prisma transaction results currently accessed by array index: **fix silently** — use named destructuring instead (no behavior change, just safe)
- If a Prisma transaction fails: **propagate the error up** — user sees an error and can retry; no silent partial state

### Shopify API Retry Behavior
- For interactive flows (cart operations, login): **retry once** on transient errors (502/503), then surface the error to the user
- No silent multi-retry for interactive paths — user waits too long without feedback

### Error UX — What Users See
- Order succeeds in Shopify but DB save fails: **show success** — order is confirmed, DB failure logged with full context via `console.error`
- Email delivery fails after successful order: **show success** — email failure logged silently, user is not alarmed by a third-party failure
- Cart merging after login: **checkout button shows spinner/disabled state** — non-blocking, clear that something is happening
- Cart merge fails after all retries: **toast notification** — "Couldn't sync your cart. Your items are still saved." Non-blocking, reassuring

### Observability for Silent Failures
- Phase 2 approach: structured `console.error` with full context (orderId, userId, step name, error message) at every silent failure point
- Sentry installation deferred to Phase 5 (scoped as the observability phase) — Phase 5 will upgrade these `console.error` calls to `Sentry.captureException()`

### Claude's Discretion
- Exact toast notification component to use (assume existing shadcn/ui toast or sonner)
- Specific retry timing / backoff intervals for the 3-retry cart merge path
- Exact error log structure (as long as orderId, userId, step, and error are all present)

</decisions>

<specifics>
## Specific Ideas

- The "Couldn't sync your cart. Your items are still saved." toast copy is confirmed — use this exact phrasing
- Structured logging should include enough context for Phase 5 Sentry upgrade: at minimum `{ step, userId, orderId, error }` shape

</specifics>

<deferred>
## Deferred Ideas

- Sentry installation and configuration — Phase 5 (Observability & Scaling)

</deferred>

---

*Phase: 02-core-flow-reliability*
*Context gathered: 2026-02-23*
