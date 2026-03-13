# Requirements: nnshop Pre-Launch Hardening

**Defined:** 2026-02-23
**Core Value:** The checkout-to-order flow works reliably and securely for every user — anonymous or authenticated — without data leaks, silent failures, or broken UI.

## v1 Requirements

### Bugs

- [x] **BUG-01**: User can add/remove favorite products and the selection persists across sessions (implement FavoriteProduct DB writes)
- [x] **BUG-02**: Announcement bar Viber link uses a real phone number fetched from Sanity or environment variable, not the placeholder
- [x] **BUG-03**: No user PII (user IDs, emails, cart tokens) is logged to console or server logs in production
- [x] **BUG-04**: User can select a variant in quick-buy modal and the selected variant is what gets ordered (not hardcoded first variant)
- [x] **BUG-05**: Checkout does not enter broken state when user adds items and checks out rapidly (defensive null-check hardening)

### Reliability

- [x] **RELY-01**: Cart merge flow logs each step's success/failure, uses idempotency keys, and rolls back database state if Shopify API call fails
- [x] **RELY-02**: Order creation function uses compensating transactions so partial failures (Shopify succeeds, email fails) don't leave orphaned orders; has retry logic for idempotent operations
- [x] **RELY-03**: Account linking uses named result destructuring from Promise.allSettled (no hardcoded indices) and performs database updates transactionally

### Type Safety

- [ ] **TYPE-01**: `as any` type casts removed from UkrPoshtaForm, HeroPageBuilder, and AnnouncementBar; replaced with proper typed interfaces using Sanity-generated types
- [x] **TYPE-02**: `Record<string, any>` removed from cart buyer identity update and session extensions; replaced with typed User and Session interfaces
- [x] **TYPE-03**: Promise.allSettled array index access in auth.ts replaced with named destructuring via a result interface

### Memory & Cleanup

- [x] **MEM-01**: Every `addEventListener` call in the codebase has a matching `removeEventListener` in its useEffect cleanup function
- [x] **MEM-02**: All `setTimeout` calls in NovaPoshtaButton, QuickBuyModal, LanguageSwitcher, and SyncedCarousels store IDs in refs and are cleared on component unmount

### Performance

- [ ] **PERF-01**: Collection page only fetches filter data from Shopify when the filter UI is rendered; cached separately with longer revalidation
- [x] **PERF-02**: Cart merge flow fetches cart data exactly once from Shopify and reuses it; no duplicate API calls during login

### Security

- [x] **SEC-01**: Product descriptions rendered via dangerouslySetInnerHTML are passed through DOMPurify before rendering
- [x] **SEC-02**: Next.js Server Actions CSRF protection verified to be active; assumptions documented in code comments; cross-origin requests tested and rejected

### Observability

- [ ] **OBS-01**: Sentry is integrated via Next.js SDK; unhandled errors are captured with context; source maps uploaded on deploy

### Scaling

- [ ] **SCALE-01**: Hardcoded `first: 250` (variants) and `first: 10` (line items) replaced with dynamic limits based on actual data needs; cursor-based pagination used for large result sets
- [ ] **SCALE-02**: `getCollectionHandles` uses streaming or on-demand generation instead of building a full handle set in memory; handles large collections (10k+ products) without OOM risk

### SEO

- [ ] **SEO-01**: Product and collection pages render a unique `<meta name="description">` tag derived from Shopify product description / collection description

### Accessibility

- [ ] **A11Y-01**: All interactive elements have accessible names — hamburger menu button and icon-only social/navigation links have `aria-label` attributes
- [ ] **A11Y-02**: Footer copyright text meets WCAG 2.1 AA contrast ratio (≥ 4.5:1); currently failing at 3.83:1
- [x] **A11Y-03**: HTML structure is valid — `<li>` elements reside inside `<ul>/<ol>` parents; heading levels follow sequential descending order

### Quality

- [ ] **QUAL-01**: React hydration error #419 eliminated from production console; no browser errors logged during normal product page load
- [ ] **QUAL-02**: Product page LCP element (hero image) has Next.js `priority` prop so the browser fetches it early; target LCP improvement toward &lt; 4.0 s

## v2 Requirements

### Security

- **SEC-V2-01**: Shopify OAuth tokens have a rotation policy; token refresh has rate limiting; token usage is audit-logged

### Observability

- **OBS-V2-01**: Structured logging replaces all remaining console.error calls; logs include request IDs and redact PII

### Performance

- **PERF-V2-01**: Prisma queries audited for N+1 patterns; all relations use explicit include/select

### Testing

- **TEST-V2-01**: Integration tests for cart merge flow (anonymous-to-authenticated, partial failures)
- **TEST-V2-02**: Integration tests for order creation flow (cart validation → Shopify order → DB state → email)
- **TEST-V2-03**: E2E test suite covering browsing → cart → checkout → order
- **TEST-V2-04**: Tests for favorites feature (add, remove, session persistence)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Offline support / service worker | E-commerce checkout requires network; not meaningful for this shop |
| New product features | This milestone is exclusively remediation |
| OAuth token rotation (v1) | Current mitigation (expiry buffer, server-only) is acceptable at launch |
| Prisma N+1 audit (v1) | Performance acceptable at launch scale; defer to v2 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BUG-01 | Phase 3 | Complete |
| BUG-02 | Phase 3 | Complete |
| BUG-03 | Phase 1 | Complete |
| BUG-04 | Phase 3 | Complete |
| BUG-05 | Phase 2 | Complete |
| RELY-01 | Phase 2 | Complete |
| RELY-02 | Phase 2 | Complete |
| RELY-03 | Phase 2 | Complete |
| TYPE-01 | Phase 4 | Pending |
| TYPE-02 | Phase 4 | Complete |
| TYPE-03 | Phase 4 | Complete |
| MEM-01 | Phase 4 | Complete |
| MEM-02 | Phase 4 | Complete |
| PERF-01 | Phase 5 | Pending |
| PERF-02 | Phase 2 | Complete |
| SEC-01 | Phase 1 | Complete |
| SEC-02 | Phase 1 | Complete |
| OBS-01 | Phase 5 | Pending |
| SCALE-01 | Phase 5 | Pending |
| SCALE-02 | Phase 5 | Pending |
| SEO-01 | Phase 7 | Pending |
| A11Y-01 | Phase 7 | Pending |
| A11Y-02 | Phase 7 | Pending |
| A11Y-03 | Phase 7 | Complete |
| QUAL-01 | Phase 7 | Pending |
| QUAL-02 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0

---
*Requirements defined: 2026-02-23*
*Last updated: 2026-02-23 — traceability populated after roadmap creation*
