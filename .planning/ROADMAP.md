# Roadmap: nnshop Pre-Launch Hardening

## Overview

This milestone remediates all documented bugs, security issues, reliability gaps, and code quality problems identified in the CONCERNS.md audit before the shop goes live. Work proceeds from highest-risk (security and data leaks) through core flow reliability, visible user-facing bugs, code correctness, and finally production observability and scaling.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Security** - Stop data leaks and close attack surface before the shop goes live (completed 2026-02-23)
- [ ] **Phase 2: Core Flow Reliability** - Make cart merge, order creation, and account linking bulletproof
- [ ] **Phase 3: Visible Bug Fixes** - Eliminate the remaining user-facing defects
- [ ] **Phase 4: Code Quality** - Remove unsafe type casts and fix memory leaks
- [ ] **Phase 5: Observability & Scaling** - Add production error tracking and remove hardcoded limits

## Phase Details

### Phase 1: Security
**Goal**: No PII is logged, user-supplied HTML is sanitized, and CSRF protection is verified active
**Depends on**: Nothing (first phase)
**Requirements**: BUG-03, SEC-01, SEC-02
**Success Criteria** (what must be TRUE):
  1. No user IDs, emails, or cart tokens appear in server logs or browser console in production builds
  2. Product descriptions rendered via dangerouslySetInnerHTML are visibly sanitized by DOMPurify before rendering (verified by injecting a test XSS payload into a Shopify product description)
  3. CSRF protection on all Server Actions is verified active and documented in code comments; a cross-origin POST to a Server Action is rejected
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Remove PII console.log from auth, cart, and order files (BUG-03)
- [ ] 01-02-PLAN.md — Install DOMPurify and sanitize product HTML; verify CSRF protection (SEC-01, SEC-02)

### Phase 2: Core Flow Reliability
**Goal**: The cart merge, checkout, and order creation flows handle partial failures without data loss or orphaned state
**Depends on**: Phase 1
**Requirements**: BUG-05, RELY-01, RELY-02, RELY-03, PERF-02
**Success Criteria** (what must be TRUE):
  1. A user who adds items and immediately checks out does not land on a broken or empty cart page
  2. If Shopify cart merge fails mid-flow, the database is not left in an inconsistent state; the error is logged with the step that failed
  3. If order creation succeeds in Shopify but email delivery fails, the order is still saved in the database and the user sees a success state (not an error)
  4. Cart merge makes exactly one Shopify API call for cart data; no duplicate fetches visible in logs during login
  5. Account linking results are accessed by name, not index, and database updates are wrapped in a transaction
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — Harden cart merge with Prisma transaction, retry+rollback, step logging, single Shopify fetch (RELY-01, PERF-02)
- [ ] 02-02-PLAN.md — Fix null-safe cart.delivery access and isolate DB save failure from Shopify order success (BUG-05, RELY-02)
- [ ] 02-03-PLAN.md — Fix Promise.allSettled result handling and re-throw Prisma errors in account linking (RELY-03)

### Phase 3: Visible Bug Fixes
**Goal**: All user-facing defects are resolved — favorites persist, quick-buy orders the right variant, and the announcement bar uses a real phone number
**Depends on**: Phase 2
**Requirements**: BUG-01, BUG-02, BUG-04
**Success Criteria** (what must be TRUE):
  1. A logged-in user can add a product to favorites, close the browser, reopen, and see the favorite still selected
  2. A user can remove a favorite and it stays removed after page reload
  3. A user on the quick-buy modal can select a specific variant (size/color), add to cart, and the cart contains that exact variant — not the first one
  4. The Viber link in the announcement bar opens a real phone number from Sanity or environment config, not a placeholder
**Plans**: TBD

### Phase 4: Code Quality
**Goal**: All unsafe type casts and memory leaks are eliminated; the codebase compiles cleanly with proper types
**Depends on**: Phase 3
**Requirements**: TYPE-01, TYPE-02, TYPE-03, MEM-01, MEM-02
**Success Criteria** (what must be TRUE):
  1. No `as any` casts exist in UkrPoshtaForm, HeroPageBuilder, or AnnouncementBar; TypeScript strict mode produces no new errors in those files
  2. Cart buyer identity and session extension code uses named typed interfaces; no `Record<string, any>` in those paths
  3. Promise.allSettled results in auth.ts are destructured by name, not array index
  4. Every component that calls addEventListener also calls removeEventListener in its useEffect cleanup; verified by code review
  5. NovaPoshtaButton, QuickBuyModal, LanguageSwitcher, and SyncedCarousels store setTimeout IDs in refs and clear them on unmount
**Plans**: TBD

### Phase 5: Observability & Scaling
**Goal**: Sentry captures unhandled errors in production, filter fetching is conditional, and hardcoded pagination limits are gone
**Depends on**: Phase 4
**Requirements**: OBS-01, PERF-01, SCALE-01, SCALE-02
**Success Criteria** (what must be TRUE):
  1. An unhandled runtime error in any route triggers a Sentry event with context (user session type, route) visible in the Sentry dashboard
  2. Source maps are uploaded on deploy; Sentry error stack traces point to original source lines, not minified output
  3. Collection pages with no active filter UI do not trigger a Shopify filter data request (verified by network inspection)
  4. Shopify GraphQL queries no longer contain hardcoded `first: 250` or `first: 10`; limits are derived from actual data needs
  5. `getCollectionHandles` does not load all handles into memory at once for collections above a defined threshold
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Security | 2/2 | Complete   | 2026-02-23 |
| 2. Core Flow Reliability | 0/3 | Not started | - |
| 3. Visible Bug Fixes | 0/TBD | Not started | - |
| 4. Code Quality | 0/TBD | Not started | - |
| 5. Observability & Scaling | 0/TBD | Not started | - |
