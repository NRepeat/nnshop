# nnshop — Pre-Launch Hardening

## What This Is

A Next.js 16 e-commerce storefront for a Ukrainian fashion brand, built on Shopify Storefront/Admin APIs + Sanity CMS. The shop supports bilingual browsing (uk/ru), anonymous-to-authenticated cart merging, LiqPay payments, and Nova Poshta delivery. The codebase is feature-complete but has a documented set of bugs, security issues, type safety problems, and reliability gaps that must be resolved before going live.

## Core Value

The checkout-to-order flow works reliably and securely for every user — anonymous or authenticated — without data leaks, silent failures, or broken UI.

## Requirements

### Validated

- ✓ Product browsing by gender/collection with Shopify Storefront API — existing
- ✓ Product detail pages with photoswipe gallery and variant display — existing
- ✓ Quick-buy modal — existing (variant selection hardcoded, see Active)
- ✓ Cart management — anonymous cart + authenticated merge flow — existing
- ✓ Multi-step checkout: contact info, delivery (Nova Poshta), payment (LiqPay) — existing
- ✓ User authentication: email/password, Google OAuth, anonymous sessions — existing
- ✓ Shopify order creation with database state tracking — existing
- ✓ Transactional emails via Resend (order confirmations, password reset) — existing
- ✓ i18n (uk default, ru) with next-intl — existing
- ✓ Sanity CMS content: pages, blog, site settings, hero, redirects — existing
- ✓ Favorites system UI (client-side Zustand store) — existing
- ✓ Sanity Studio at /studio — existing
- ✓ SEO: metadata generation, JSON-LD, OG images — existing

### Active

**Bugs (visible to users):**
- [ ] Favorites API is stubbed — add/remove does not persist to database
- [ ] Viber contact link in announcement bar uses placeholder phone number
- [ ] Quick-buy always orders first variant — selected options ignored
- [ ] Cart state undefined in rapid checkout flows (defensive fix)
- [ ] Promise.allSettled hardcoded indices give misleading errors on account linking failure

**Security:**
- [ ] Remove all console.log calls exposing user IDs, emails, cart tokens in production
- [ ] Add DOMPurify sanitization to product description HTML rendering
- [ ] Document and verify CSRF protection for all Server Actions
- [ ] Implement token rotation and audit logging for Shopify OAuth tokens

**Reliability (fragile core flows):**
- [ ] Cart merge flow: add error logging, idempotency, database transaction rollback on Shopify API failure
- [ ] Order creation (318-line function): add compensating transactions, retry logic, clear phase comments
- [ ] Account linking: replace Promise.allSettled indices with named destructuring; add transactional updates

**Type Safety:**
- [ ] Replace `as any` casts in UkrPoshtaForm, HeroPageBuilder, AnnouncementBar with proper types
- [ ] Replace `Record<string, any>` in cart buyer identity update and session extensions with typed interfaces
- [ ] Fix Promise.allSettled hardcoded array index access in auth.ts

**Memory & Resource Cleanup:**
- [ ] Audit all addEventListener calls; ensure removeEventListener in every useEffect cleanup
- [ ] Store all setTimeout IDs in refs; clear on unmount across NovaPoshtaButton, QuickBuyModal, LanguageSwitcher, SyncedCarousels

**Performance:**
- [ ] Conditional filter fetching in getCollection — only fetch when filter UI is rendered
- [ ] Quick-buy variant selection — pass selected variant from parent; store in modal state
- [ ] Cart merge — fetch cart data once and reuse; eliminate duplicate Shopify API calls

**Observability:**
- [ ] Integrate Sentry for error tracking (Next.js SDK)
- [ ] Replace debug console.logs with structured error-only logging

**Scaling:**
- [ ] Dynamic pagination limits replacing hardcoded `first: 250` and `first: 10`
- [ ] Streaming or on-demand handle generation for large collections
- [ ] Audit all Prisma queries for N+1; add explicit include/select

### Out of Scope

- Offline support / service worker — e-commerce checkout requires network; not a priority at launch
- E2E test suite — no test framework; setting up Playwright from scratch is post-launch
- Unit/integration tests — deferred; fix code first, add tests in next milestone
- New feature development — this milestone is exclusively remediation of CONCERNS.md

## Context

- **Codebase map:** `.planning/codebase/` — full architecture, stack, concerns, conventions, integrations, structure
- **Current state:** Feature-complete; the CONCERNS.md audit identified 36 issues across 7 categories
- **Deployment target:** Vercel + PostgreSQL + Shopify + Sanity
- **Market:** Ukrainian e-commerce (uk/ru locales); LiqPay payments, Nova Poshta delivery
- **Auth:** better-auth with anonymous sessions that merge to authenticated on sign-in — this flow is the most fragile

## Constraints

- **Tech stack:** Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, Prisma v7, better-auth — no stack changes
- **No new features:** Scope is 100% remediation; new capabilities belong in the next milestone
- **No test framework:** Tests are out of scope; CONCERNS.md testing gaps deferred post-launch
- **Shopify API:** Storefront API 2025-10; Admin API with OAuth tokens cached in Prisma

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Sentry for error tracking | Industry standard, excellent Next.js integration, generous free tier | — Pending |
| DOMPurify for HTML sanitization | Belt-and-suspenders even for trusted Shopify source | — Pending |
| No test infrastructure this milestone | Code fixes are the priority; tests would double scope | — Pending |
| Fix fragile flows without full rewrite | Minimize blast radius; add logging, transactions, idempotency within existing structure | — Pending |

---
*Last updated: 2026-02-23 after initialization*
