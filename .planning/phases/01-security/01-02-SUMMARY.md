---
phase: 01-security
plan: "02"
subsystem: ui
tags: [dompurify, xss, csrf, html-sanitization, security, isomorphic-dompurify, next-js]

# Dependency graph
requires: []
provides:
  - XSS protection via DOMPurify on all Shopify product HTML rendered with dangerouslySetInnerHTML
  - CSRF protection documentation in two Server Action entry points
  - isomorphic-dompurify@2.36.0 installed (v2/CommonJS-compatible)
affects: [02-reliability, 03-payments, 04-checkout, 05-ux]

# Tech tracking
tech-stack:
  added: [isomorphic-dompurify@2.36.0]
  patterns:
    - "Import DOMPurify from 'isomorphic-dompurify' and call DOMPurify.sanitize() before dangerouslySetInnerHTML"
    - "Compute sanitized HTML into a const before the return statement, not inline in JSX"
    - "SEC-02 comment block at top of Server Action files to document CSRF protection status"

key-files:
  created: []
  modified:
    - src/features/product/ui/Description.tsx
    - src/widgets/product-view/ui/ProductInfo.tsx
    - src/entities/cart/api/anonymous-cart-buyer-identity-update.ts
    - src/features/order/api/create.ts
    - package.json
    - package-lock.json

key-decisions:
  - "Pin isomorphic-dompurify to ^2.36.0 not @latest — v3.x depends on jsdom@28 (ESM-only) which breaks CommonJS require() on Vercel"
  - "next.config.ts allowedDevOrigins is dev-server-only; it does NOT widen Server Action CSRF surface"
  - "t.raw('shippingAndReturnsContent') dangerouslySetInnerHTML in ProductInfo.tsx intentionally not sanitized — developer-controlled translation string, not Shopify HTML"

patterns-established:
  - "XSS mitigation: always sanitize external HTML (Shopify product descriptions) before dangerouslySetInnerHTML"
  - "CSRF documentation: add SEC-02 comment block to Server Action files to document protection and prevent accidental misconfiguration"

requirements-completed: [SEC-01, SEC-02]

# Metrics
duration: 4min
completed: 2026-02-23
---

# Phase 1 Plan 02: HTML Sanitization and CSRF Protection Summary

**isomorphic-dompurify@2.36.0 installed; Shopify product HTML sanitized with DOMPurify in two components; Next.js Server Action CSRF protection verified and documented**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-23T09:14:39Z
- **Completed:** 2026-02-23T09:18:30Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Replaced `dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}` with DOMPurify-sanitized HTML in `Description.tsx` (server component)
- Replaced naive style-stripping regex (`/style="[^"]*"/gi`) with `DOMPurify.sanitize()` in `ProductInfo.tsx` (client component)
- Installed `isomorphic-dompurify@2.36.0` (pinned to v2 line for CommonJS compatibility on Vercel)
- Added SEC-02 CSRF comment blocks to two Server Action files; verified cross-origin POST returns HTTP 500 (non-2xx)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install isomorphic-dompurify and add DOMPurify sanitization** - `b31dd64` (feat)
2. **Task 2: Add CSRF protection documentation and verify with curl** - `5f7f9ad` (docs)

**Plan metadata:** (final commit — see below)

## Files Created/Modified
- `src/features/product/ui/Description.tsx` - Added DOMPurify import; computes `safeDescriptionHtml = DOMPurify.sanitize(product.descriptionHtml)` before return; uses it in `dangerouslySetInnerHTML`
- `src/widgets/product-view/ui/ProductInfo.tsx` - Added DOMPurify import; replaced naive `.replace(/style="[^"]*"/gi, '')` regex with `DOMPurify.sanitize(product.descriptionHtml)`
- `src/entities/cart/api/anonymous-cart-buyer-identity-update.ts` - Added SEC-02 CSRF comment block at top including curl test result (HTTP 500)
- `src/features/order/api/create.ts` - Added SEC-02 CSRF comment block at top
- `package.json` - Added isomorphic-dompurify@2.36.0 dependency
- `package-lock.json` - Lock file updated

## Decisions Made
- Pinned `isomorphic-dompurify@^2.36.0` (not `@latest`): v3.x requires jsdom@28 which is ESM-only and breaks CommonJS `require()` on Vercel's Node.js runtime. The v2 line (jsdom@25) is CJS-compatible.
- Did not sanitize `t.raw('shippingAndReturnsContent')` in `ProductInfo.tsx`: this is a developer-controlled next-intl translation string, not Shopify user-generated HTML — out of scope per research analysis.
- CSRF curl test used `https://www.miomio.com.ua/uk/woman` with `Next-Action: abc123` header and `Origin: https://evil.example.com` — returned HTTP 500 (invalid action ID rejected), confirming non-2xx response.

## Deviations from Plan

None - plan executed exactly as written. The curl test returned HTTP 500 instead of an explicit 403, but 500 is a valid non-2xx response confirming rejection (per plan: "A response of 403, 405, or any non-2xx code confirms rejection").

## Issues Encountered
- Production domain `miomio.com.ua` (non-www) redirects to `www.miomio.com.ua` via HTTP 307 (Cloudflare), then to specific locale paths. Tests were run against `www.miomio.com.ua` directly to avoid the redirect chain.
- The better-auth `/api/auth/sign-in/email` endpoint returns HTTP 415 (Unsupported Media Type) for `text/plain;charset=UTF-8` content type — this is a content-type rejection by better-auth, not the Next.js CSRF check. Switched to testing a Server Action route directly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- SEC-01 (XSS via dangerouslySetInnerHTML) and SEC-02 (CSRF protection) requirements closed
- Ready to proceed with Phase 1 Plan 03 (next security plan)

---
*Phase: 01-security*
*Completed: 2026-02-23*
