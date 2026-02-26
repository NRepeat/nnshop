# Roadmap: nnshop Pre-Launch Hardening

## Overview

This milestone remediates all documented bugs, security issues, reliability gaps, and code quality problems identified in the CONCERNS.md audit before the shop goes live. Work proceeds from highest-risk (security and data leaks) through core flow reliability, visible user-facing bugs, code correctness, and finally production observability and scaling.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Security** - Stop data leaks and close attack surface before the shop goes live (completed 2026-02-23)
- [x] **Phase 2: Core Flow Reliability** - Make cart merge, order creation, and account linking bulletproof (completed 2026-02-23)
- [ ] **Phase 3: Visible Bug Fixes** - Eliminate the remaining user-facing defects
- [ ] **Phase 4: Code Quality** - Remove unsafe type casts and fix memory leaks
- [ ] **Phase 5: Observability & Scaling** - Add production error tracking and remove hardcoded limits
- [ ] **Phase 7: Lighthouse Audit Fixes** - Resolve SEO, accessibility, and quality issues surfaced by Lighthouse audit

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
- [x] 02-03-PLAN.md — Fix Promise.allSettled result handling and re-throw Prisma errors in account linking (RELY-03)

### Phase 3: Visible Bug Fixes
**Goal**: All user-facing defects are resolved — favorites persist, quick-buy orders the right variant, and the announcement bar uses a real phone number
**Depends on**: Phase 2
**Requirements**: BUG-01, BUG-02, BUG-04
**Success Criteria** (what must be TRUE):
  1. A logged-in user can add a product to favorites, close the browser, reopen, and see the favorite still selected
  2. A user can remove a favorite and it stays removed after page reload
  3. A user on the quick-buy modal can select a specific variant (size/color), add to cart, and the cart contains that exact variant — not the first one
  4. The Viber link in the announcement bar opens a real phone number from Sanity or environment config, not a placeholder
**Plans**: 3 plans

Plans:
- [ ] 03-01-PLAN.md — Fix FavSession error paths: add toast on DB error and exception (BUG-01)
- [ ] 03-02-PLAN.md — Add viberPhone to Sanity schema + GROQ + announcement bar component (BUG-02)
- [ ] 03-03-PLAN.md — Wire variant selection in ProductQuickView + create useCartUIStore for post-add cart open (BUG-04)

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
**Plans**: 5 plans

Plans:
- [ ] 04-01-PLAN.md — Replace as-any in UkrPoshtaForm (typed form context) and AnnouncementBar (string narrowing) (TYPE-01)
- [ ] 04-02-PLAN.md — Replace as-any in HeroPageBuilder with Sanity type assertions; narrow HeroSwiper props (TYPE-01)
- [ ] 04-03-PLAN.md — Replace Record&lt;string, any&gt; in cart buyer identity update with inline interfaces; verify TYPE-03 and MEM-01 already satisfied (TYPE-02, TYPE-03, MEM-01)
- [ ] 04-04-PLAN.md — Add setTimeout refs with clearTimeout cleanup to NovaPoshtaButton, QuickBuyModal, LanguageSwitcher, SyncedCarousels (MEM-02)
- [ ] 04-05-PLAN.md — Full build verification and human-verify checkpoint (TYPE-01, TYPE-02, TYPE-03, MEM-01, MEM-02)

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

### Phase 6: Pre-Launch UI Polish
**Goal**: Complete the visible UI gaps before launch — favicon, currency display as "грн", CMS-managed footer (social links, hours, address, payment icons), and language switcher cleanup
**Depends on**: Phase 4 (can run parallel with Phase 5)
**Requirements**: UI-01, UI-02, UI-03, UI-04
**Success Criteria** (what must be TRUE):
  1. Browser tab shows a branded favicon icon (not the browser default)
  2. All price displays show amounts in "грн" format (e.g., "1 234 грн"), not "₴"
  3. Footer renders CMS-managed social links, work hours, address, and payment method badges when configured in Sanity Studio; falls back gracefully when fields are empty
  4. Language switcher button has no invisible/dead CSS hover classes; visual behavior is intentional
**Plans**: 3 plans

Plans:
- [ ] 06-01-PLAN.md — Add favicon (app/icon.tsx) and currency utility (₴ → грн across 11 files) (UI-01, UI-02)
- [ ] 06-02-PLAN.md — Expand footerSettings schema, register in siteSettings, add FOOTER_QUERY, update Footer component (UI-03)
- [ ] 06-03-PLAN.md — Language switcher button cleanup + build verification gate (UI-04)

### Phase 7: Lighthouse Audit Fixes
**Goal**: All Lighthouse-identified SEO, accessibility, and quality issues resolved — meta descriptions on product/collection pages, accessible interactive elements, valid HTML structure, hydration error eliminated, product hero image loads with priority
**Depends on**: Phase 4 (can run parallel with Phase 5)
**Requirements**: SEO-01, A11Y-01, A11Y-02, A11Y-03, QUAL-01, QUAL-02
**Success Criteria** (what must be TRUE):
  1. Product pages and collection pages render a unique `<meta name="description">` tag visible in page source
  2. Hamburger menu button and icon-only social/navigation links have `aria-label` attributes (verified by Lighthouse accessibility audit)
  3. Footer copyright text contrast ratio ≥ 4.5:1 (updated color passes WCAG AA)
  4. All `<li>` elements reside inside valid `<ul>/<ol>` parents; heading levels on product page follow sequential order
  5. No browser errors logged during normal product page load (React hydration error #419 eliminated)
  6. Product page LCP element has `priority` prop; LCP improves from 6.6s baseline
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Security | 2/2 | Complete   | 2026-02-23 |
| 2. Core Flow Reliability | 3/3 | Complete   | 2026-02-23 |
| 3. Visible Bug Fixes | 1/3 | In Progress|  |
| 4. Code Quality | 2/5 | In Progress|  |
| 5. Observability & Scaling | 0/TBD | Not started | - |
| 6. Pre-Launch UI Polish | 3/3 | Complete   | 2026-02-26 |
| 7. Lighthouse Audit Fixes | 0/TBD | Not started | - |
