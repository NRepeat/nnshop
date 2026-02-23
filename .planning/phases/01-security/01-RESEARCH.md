# Phase 1: Security - Research

**Researched:** 2026-02-23
**Domain:** Web application security — PII logging, HTML sanitization, CSRF verification
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BUG-03 | No user PII (user IDs, emails, cart tokens) is logged to console or server logs in production | Console audit strategy: remove `console.log` calls containing PII from 3 high-risk files; configure `compiler.removeConsole` conditionally for remaining logs |
| SEC-01 | Product descriptions rendered via `dangerouslySetInnerHTML` are passed through DOMPurify before rendering | Install `isomorphic-dompurify@2.x`; sanitize in `Description.tsx` (server component) and `ProductInfo.tsx` (client component) |
| SEC-02 | Next.js Server Actions CSRF protection verified to be active; assumptions documented; cross-origin requests tested and rejected | Origin/Host comparison is built-in and on by default in Next.js 14+; verify no misconfiguration; add code comments; test with `curl` cross-origin POST |
</phase_requirements>

---

## Summary

Phase 1 addresses three security items: PII leakage through verbose console logging, unsanitized HTML rendering, and CSRF verification for Server Actions.

**BUG-03 (PII logging):** The codebase has 159 console method calls across 55 `.ts` files and 16 `.tsx` files. The highest-risk PII exposures are in `auth.ts` (logs user IDs and emails on creation and account linking), `anonymous-cart-buyer-identity-update.ts` (logs user IDs, emails, partial cart tokens), and `on-link-account.ts` (logs user IDs throughout a transaction). The approach is: (1) remove or guard the PII-bearing `console.log` calls in these files, (2) keep `console.error` for error visibility, and (3) note that `compiler.removeConsole` is NOT supported by Turbopack (the project's default bundler in Next.js 16), so build-time stripping is not available — source-level removal is required.

**SEC-01 (HTML injection):** `dangerouslySetInnerHTML` is used in 5 files. Two render Shopify product HTML (`Description.tsx` and `ProductInfo.tsx`) which require sanitization. Two render JSON-LD structured data (`JsonLd.tsx`, `FAQ.tsx`) — JSON.stringify is safe. Two render translation strings from next-intl (`ProductInfo.tsx:353` and `SizeChartDialog.tsx`) — developer-controlled static content, not user input. Only the Shopify `descriptionHtml` usages are in scope. `isomorphic-dompurify` 2.x (NOT 3.0.0 — see note below) works in both SSR server components and client components with the same import.

**SEC-02 (CSRF):** Next.js 14+ has built-in CSRF protection for Server Actions via Origin/Host header comparison — it is **on by default** and does not require configuration. The requirement is to verify it is active, document the assumption in code comments, and demonstrate a rejected cross-origin request. The project has `trustedOrigins: [betterAuthUrl]` in better-auth and `allowedDevOrigins` in `next.config.ts` — these are for different systems and do not disable Next.js Server Action CSRF protection.

**Primary recommendation:** Remove PII-bearing console.log calls at source level; add `isomorphic-dompurify@2.x` for HTML sanitization; add verification comment + curl test for CSRF.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `isomorphic-dompurify` | `^2.x` (NOT 3.0.0) | HTML sanitization in both server and client components | Works in Node.js SSR via jsdom; same API as browser DOMPurify; widely used in Next.js ecosystem |

**CRITICAL VERSION NOTE:** `isomorphic-dompurify@3.0.0` (released 2026-02-21) requires Node.js `^20.19.0 || ^22.12.0 || >=24.0.0` due to jsdom@28. Node.js v24.13.0 is in use on this machine, which technically satisfies `>=24.0.0`, but the GitHub README warns of a jsdom@28 ESM-only dependency that breaks `require()` in Next.js on Vercel. Use `isomorphic-dompurify@^2.36.0` to avoid bundler conflicts until the Vercel/jsdom@28 issue is resolved (tracked in issue #394 on the repo).

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `dompurify` (peer dep) | bundled with isomorphic-dompurify | Core XSS sanitizer | Required by isomorphic-dompurify |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `isomorphic-dompurify` | `sanitize-html` | sanitize-html is more configurable but heavier; DOMPurify is maintained by Cure53 (security firm), the gold standard |
| `isomorphic-dompurify` | `xss` | xss is lighter but less comprehensive; DOMPurify is the ecosystem standard |
| Source-level console removal | `compiler.removeConsole` in next.config.ts | `compiler.removeConsole` is NOT supported by Turbopack (Next.js 16 default bundler). Source-level removal is required. |

**Installation:**
```bash
npm install isomorphic-dompurify
```

---

## Architecture Patterns

### Recommended Project Structure

No new directories needed. Changes are in-place edits to existing files:

```
src/
  features/
    auth/lib/auth.ts                                    # Remove PII console.log
    auth/lib/on-link-account.ts                         # Remove PII console.log
    product/ui/Description.tsx                          # Add DOMPurify sanitization
  entities/
    cart/api/anonymous-cart-buyer-identity-update.ts    # Remove PII console.log
    cart/api/*.ts                                       # Remove non-error console.log
  widgets/
    product-view/ui/ProductInfo.tsx                     # Add DOMPurify sanitization (replace naive regex)
  features/order/api/create.ts                          # Remove PII console.log
```

### Pattern 1: DOMPurify in Server Component (SSR-safe)

**What:** Import `isomorphic-dompurify` and sanitize before passing to `dangerouslySetInnerHTML`
**When to use:** Any server component that renders user-supplied or externally-sourced HTML

```typescript
// Source: https://github.com/kkomelin/isomorphic-dompurify
// Works in both Server Components (Node.js) and Client Components (browser)
import DOMPurify from 'isomorphic-dompurify';

// In a Server Component (e.g., Description.tsx):
const safeHtml = DOMPurify.sanitize(product.descriptionHtml);

return (
  <div
    className="prose prose-sm dark:prose-invert"
    dangerouslySetInnerHTML={{ __html: safeHtml }}
  />
);
```

### Pattern 2: DOMPurify in Client Component

**What:** Same import works in Client Components — `isomorphic-dompurify` resolves to browser DOMPurify client-side
**When to use:** Any Client Component that needs HTML sanitization

```typescript
// Source: https://github.com/kkomelin/isomorphic-dompurify
'use client';
import DOMPurify from 'isomorphic-dompurify';

// In a Client Component (e.g., ProductInfo.tsx):
// Replace the naive regex style-stripping with a real sanitizer
const cleanHtml = DOMPurify.sanitize(product.descriptionHtml);
```

### Pattern 3: PII-Safe Logging

**What:** Remove debug `console.log` calls that expose user data; keep `console.error` for error observability
**When to use:** All server-side files handling auth, cart, checkout, orders

```typescript
// BEFORE (exposes PII):
console.log('[onLinkAccount] START', {
  anonymousUserId: anonymousUser.user.id,
  newUserId: newUser.user.id,
  newUserEmail: newUser.user.email,  // PII: email
});

// AFTER (remove entirely, or keep a non-PII breadcrumb):
// [onLinkAccount] started — no user data logged
// console.error is kept for genuine error conditions
```

### Pattern 4: CSRF Verification Documentation

**What:** Document the built-in CSRF protection assumption in code comments where Server Actions are defined
**When to use:** Key entry points in `src/entities/cart/api/*.ts` and `src/features/checkout/**/*.ts`

```typescript
// Source: https://nextjs.org/docs/app/guides/data-security#allowed-origins-advanced
// CSRF PROTECTION: This Server Action is protected by Next.js built-in CSRF mitigation.
// Next.js compares the Origin header to the Host header on every Server Action POST.
// Cross-origin requests are rejected automatically — no CSRF token needed.
// Verified: next.config.ts does not set serverActions.allowedOrigins,
// meaning only requests from the same host (miomio.com.ua) are accepted.
'use server';
```

### Anti-Patterns to Avoid

- **Naive regex HTML cleaning:** `product.descriptionHtml.replace(/style="[^"]*"/gi, '')` (current state in `ProductInfo.tsx`) is NOT sanitization — it only strips style attributes, not `<script>` tags or event handlers. Replace with DOMPurify.
- **Using `compiler.removeConsole` with Turbopack:** This is unsupported in Next.js 16 with the default Turbopack bundler and will cause a build error. Source-level removal is the correct approach.
- **Using `isomorphic-dompurify@3.0.0` on Vercel:** jsdom@28 (required by v3) has ESM-only dependencies that break `require()` on Vercel's runtime. Pin to `^2.36.0`.
- **Removing `console.error` calls:** Keep `console.error` for production error visibility. Only remove `console.log` and `console.debug` that expose PII.
- **Assuming `trustedOrigins` in better-auth = CSRF protection for Server Actions:** `trustedOrigins` is better-auth's own allowlist for its auth API routes. It does not affect Next.js Server Action CSRF protection, which is handled separately by Next.js.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTML sanitization | Custom regex/string-replace to strip tags | `isomorphic-dompurify` | DOMPurify uses a real DOM parser; regex misses edge cases like `<scr<script>ipt>`, unicode bypasses, SVG/MathML injection vectors |
| CSRF tokens | Custom token generation and validation middleware | Next.js built-in Origin/Host comparison | Already implemented; adding a token layer adds complexity without benefit for Server Actions |

**Key insight:** HTML sanitization via regex is famously bypassable — even security experts get it wrong. DOMPurify is written by Cure53, the security consultancy. Always use a DOM-parser-based sanitizer.

---

## Common Pitfalls

### Pitfall 1: isomorphic-dompurify@3.0.0 jsdom Bundler Conflict

**What goes wrong:** `require()` of ESM-only jsdom@28 fails at runtime on Vercel / Node.js environments using CommonJS module resolution.
**Why it happens:** jsdom@28 dropped CommonJS support; `isomorphic-dompurify@3.0.0` depends on it.
**How to avoid:** Pin `isomorphic-dompurify` to `^2.36.0` in `package.json`. The v2 line uses jsdom@25 which is CommonJS-compatible.
**Warning signs:** Build error mentioning `Cannot require() an ES Module` or similar jsdom-related failures.

### Pitfall 2: Sanitizing in the Wrong Place

**What goes wrong:** Sanitizing in a Client Component means the raw HTML reaches the network and the client browser — the XSS window is before sanitization runs.
**Why it happens:** Assuming client-side sanitization is sufficient.
**How to avoid:** Sanitize in the Server Component if the component is server-rendered (e.g., `Description.tsx`). For the Client Component `ProductInfo.tsx`, sanitization still happens before `dangerouslySetInnerHTML` assignment, which is acceptable because the HTML never executes until it hits the DOM.
**Warning signs:** `__html` value is assigned without calling `DOMPurify.sanitize()` first.

### Pitfall 3: CSRF Misconfiguration via `allowedOrigins`

**What goes wrong:** Adding staging/development domains to `serverActions.allowedOrigins` in `next.config.ts` widens the CSRF surface in production if the list includes non-production origins.
**Why it happens:** Developers add `localhost` or staging domains to fix local dev CSRF errors.
**How to avoid:** Never add non-production origins to `serverActions.allowedOrigins`. For local development, Next.js already allows localhost by default. Use `allowedDevOrigins` (already configured in `next.config.ts`) for cross-origin dev server access — this is separate from Server Action CSRF protection.
**Warning signs:** `allowedOrigins: ['localhost', 'staging.example.com', 'production.example.com']` in `next.config.ts`.

### Pitfall 4: Removing console.error Along with console.log

**What goes wrong:** All console calls are removed, leaving no error signal in production when something fails silently.
**Why it happens:** Bulk-replacing all `console.*` calls.
**How to avoid:** Only remove `console.log` and `console.debug` calls that expose PII or add no value in production. Keep `console.error` in catch blocks — these are the error signals that matter.
**Warning signs:** Catch blocks with no logging after removing console statements.

### Pitfall 5: ProductInfo.tsx Already Has Partial Sanitization

**What goes wrong:** Assuming `ProductInfo.tsx` is already safe because it does `product.descriptionHtml.replace(/style="[^"]*"/gi, '')`.
**Why it happens:** The naive regex is already there, suggesting sanitization was considered.
**How to avoid:** The regex only strips `style=""` attributes. It does NOT strip `<script>`, `onerror`, `onload`, or other XSS vectors. Replace with `DOMPurify.sanitize()` entirely.
**Warning signs:** `cleanHtml` variable computed by regex, not DOMPurify.

---

## Code Examples

Verified patterns from official sources:

### DOMPurify Sanitization (Server Component)

```typescript
// Source: https://github.com/kkomelin/isomorphic-dompurify (README)
// File: src/features/product/ui/Description.tsx
import DOMPurify from 'isomorphic-dompurify';

// Inside the component:
const safeHtml = DOMPurify.sanitize(product.descriptionHtml);

return (
  <div
    className="prose prose-sm dark:prose-invert"
    dangerouslySetInnerHTML={{ __html: safeHtml }}
  />
);
```

### DOMPurify Sanitization (Client Component)

```typescript
// Source: https://github.com/kkomelin/isomorphic-dompurify (README)
// File: src/widgets/product-view/ui/ProductInfo.tsx
// Replace line 142:
// const cleanHtml = product.descriptionHtml.replace(/style="[^"]*"/gi, '');
// With:
import DOMPurify from 'isomorphic-dompurify';
const cleanHtml = DOMPurify.sanitize(product.descriptionHtml);
```

### CSRF Built-in Protection (Next.js docs)

```typescript
// Source: https://nextjs.org/docs/app/guides/data-security#allowed-origins-advanced
// How it works: On every Server Action invocation, Next.js compares:
//   Origin header (from the browser request)
//   Host header (or X-Forwarded-Host) of the server
// If they don't match → request is aborted (HTTP 403 or similar)
// This is active by default in Next.js 14+ and does not require configuration.

// Verification test (cross-origin POST should be rejected):
// curl -X POST https://miomio.com.ua/<server-action-path> \
//   -H "Origin: https://evil.com" \
//   -H "Content-Type: text/plain;charset=UTF-8" \
//   --data "$ACTION_ID"
// Expected: 403 Forbidden or similar rejection
```

### PII-Safe Logging Pattern

```typescript
// BEFORE - exposes PII in auth.ts:
console.log('[databaseHooks] User created:', {
  id: user.id,       // PII: user ID
  email: user.email, // PII: email address
  name: user.name,
  isAnonymous: (user as any).isAnonymous,
});

// AFTER - remove the log entirely; errors remain in the catch block
// The databaseHooks.user.create.after handler becomes a no-op or is removed
```

### CSRF Comment Pattern for Server Actions

```typescript
// Source: https://nextjs.org/docs/app/guides/data-security
// SEC-02: CSRF protection is active via Next.js built-in Origin/Host header
// comparison. Server Actions only accept POST requests from the same origin
// (miomio.com.ua). No serverActions.allowedOrigins is configured in
// next.config.ts, so the CSRF surface is the default (same-origin only).
'use server';
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `compiler.removeConsole` in webpack | Source-level console removal (Turbopack does not support `compiler.removeConsole`) | Next.js 16 / Turbopack stable (Oct 2025) | Must remove console.log at source, not at build time |
| `DOMPurify` (browser-only) | `isomorphic-dompurify` | Long established | Same API works in Node.js SSR and browser |
| Custom CSRF token middleware | Next.js built-in Origin/Host comparison | Next.js 14 (stable Server Actions) | No custom CSRF implementation needed |
| `middleware.ts` | `proxy.ts` | Next.js 16 | Project already uses `proxy.ts` correctly |

**Deprecated/outdated:**
- `compiler.removeConsole`: Will not work with Turbopack. Do not add it to `next.config.ts`.
- Browser-only `dompurify` package: Cannot be used in server components. Use `isomorphic-dompurify` instead.

---

## Scope: Which dangerouslySetInnerHTML Usages Require Action

| File | Source of HTML | Action Required |
|------|---------------|-----------------|
| `src/features/product/ui/Description.tsx:65` | Shopify `descriptionHtml` | YES — add DOMPurify |
| `src/widgets/product-view/ui/ProductInfo.tsx:272` | Shopify `descriptionHtml` (via naive regex) | YES — replace regex with DOMPurify |
| `src/shared/ui/JsonLd.tsx:9` | `JSON.stringify(data)` — developer-controlled | NO — JSON.stringify is XSS-safe |
| `src/entities/faq/ui/FAQ.tsx:27` | `JSON.stringify(faqData)` — Sanity CMS structured data | NO — JSON.stringify is XSS-safe |
| `src/widgets/product-view/ui/ProductInfo.tsx:353` | `t.raw('shippingAndReturnsContent')` — next-intl translation key | NO — translation strings are developer-controlled |
| `src/widgets/product-view/ui/SizeChartDialog.tsx:58` | `t.raw('shoes.description')` — next-intl translation key | NO — translation strings are developer-controlled |

---

## PII Logging Audit: High-Priority Files

The following files contain `console.log` calls that expose PII and are directly in scope for BUG-03:

| File | PII Exposed | Lines |
|------|------------|-------|
| `src/features/auth/lib/auth.ts` | user.id, user.email, anonymousUserId, newUserId, newUserEmail | 55–59, 84–87, 97–103 |
| `src/features/auth/lib/on-link-account.ts` | anonymousUserId, newUserId | 12, 15–78 |
| `src/entities/cart/api/anonymous-cart-buyer-identity-update.ts` | anonymousUserId, newUserId, newUserEmail, cartToken (partial) | 143–222 |
| `src/features/order/api/create.ts` | session.user.id (implicit via order save), order name | 297 |

Additional files with `console.log` that are lower-risk (no direct PII, but noisy in production):
- `src/shared/lib/customer-account.ts:48` — logs `mappedUserData` (may contain PII)
- `src/entities/cart/api/update-cart-delivery-preferences.ts` — logs cart API responses
- `src/entities/cart/api/update-discount-codes.ts` — logs full JSON response including cart state

---

## Open Questions

1. **isomorphic-dompurify v3.0.0 compatibility on Vercel**
   - What we know: v3.0.0 requires jsdom@28 which has ESM-only dependencies; GitHub issue #394 tracks the Vercel break
   - What's unclear: Whether the issue is resolved in the current Vercel runtime (Node.js 22.x in production vs Node.js 24.x in local dev)
   - Recommendation: Pin to `^2.36.0` and revisit after issue #394 is closed upstream

2. **CSRF verification method for SEC-02**
   - What we know: Next.js Origin/Host comparison is the mechanism; it's on by default
   - What's unclear: The exact HTTP response code when rejected (it may be implementation-specific in Next.js internals)
   - Recommendation: Test with curl using `Origin: https://evil.example.com` header against a known Server Action endpoint; document the response in a code comment

3. **Scope of console.log audit**
   - What we know: 159 console calls across 55 .ts files; 53 are `console.log`; the 4 high-PII files are clear
   - What's unclear: Whether `src/shared/lib/customer-account.ts:48` `mappedUserData` contains email/phone at runtime
   - Recommendation: Focus BUG-03 effort on the 4 high-PII files listed above; leave non-PII console.error calls in place

---

## Sources

### Primary (HIGH confidence)
- [Next.js Data Security Docs v16.1.6](https://nextjs.org/docs/app/guides/data-security) — CSRF Origin/Host mechanism, on-by-default confirmation
- [Next.js serverActions config docs v16.1.6](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions) — `allowedOrigins` option documentation
- [isomorphic-dompurify GitHub README](https://github.com/kkomelin/isomorphic-dompurify) — current version 3.0.0, Node.js requirements, Vercel compatibility warning
- [Next.js 16 release post](https://nextjs.org/blog/next-16) — Turbopack stable, compiler options status

### Secondary (MEDIUM confidence)
- [Next.js GitHub Discussion #57555](https://github.com/vercel/next.js/discussions/57555) — `compiler.removeConsole` not supported by Turbopack (unresolved as of Nov 2024, still unresolved in Next.js 16)
- [isomorphic-dompurify releases](https://github.com/kkomelin/isomorphic-dompurify/releases) — v3.0.0 released 2026-02-21, v2.36.0 is the latest stable v2

### Tertiary (LOW confidence)
- WebSearch: `compiler.removeConsole` Turbopack status 2025/2026 — multiple community sources consistent: not supported

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — DOMPurify and isomorphic-dompurify are well-documented with official GitHub; version pinning recommendation verified via release notes and known issue
- Architecture: HIGH — all target files inspected directly; PII exposure confirmed in source
- CSRF: HIGH — official Next.js docs (v16.1.6, updated 2026-02-20) explicitly describe the Origin/Host mechanism as on-by-default
- Turbopack/compiler.removeConsole: MEDIUM — GitHub discussion confirms incompatibility; no official doc states "not supported" explicitly, but behavior is well-documented by community
- Pitfalls: HIGH — based on direct code inspection and verified library behavior

**Research date:** 2026-02-23
**Valid until:** 2026-03-23 (stable APIs; DOMPurify v3 Vercel issue may resolve sooner)
