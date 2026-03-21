# Phase 13: SEO Redirect Architecture - Research

**Researched:** March 21, 2026
**Domain:** SEO, Next.js Middleware, Internationalization
**Confidence:** HIGH

## Summary

This research focuses on simplifying multi-hop redirect chains and fixing a critical language routing bug in the `proxy.ts` middleware. Currently, the site experiences 307/308/301 mixed chains (up to 4 hops) for canonical domain normalization and locale prepending. Additionally, a hardcoded rule in `proxy.ts` incorrectly redirects `/ru` root requests to `/uk/woman` instead of `/ru/woman`. 

The core recommendation is to refactor `proxy.ts` using a **Goal State** pattern: compute the final canonical URL (Host, Protocol, Path, and Trailing Slash) and perform a single 301 redirect if any component is non-canonical. This approach ensures ≤ 1 hop for all structural redirects.

**Primary recommendation:** Use a single-hop "Goal State" refactor in `proxy.ts` to consolidate protocol, host, locale, and structural path redirects into one 301 response.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Collapse multi-hop chains into a single 301 where possible.
- Fix `/ru` → `/ru/woman` routing (currently it resolves to `/uk/woman`).
- Use 301 (Permanent) for structural redirects, not 307/308 (Temporary).
- Ensure http→https and www/non-www normalization happens in a single step.

### the agent's Discretion
- Implementation details of the single-hop logic in `proxy.ts`.
- Handling of trailing slashes (Next.js default is `false`, but middleware can normalize).
- Whether to handle host normalization in `proxy.ts` or `vercel.json` (Recommendation: `proxy.ts` for single-hop with dynamic paths).

### Deferred Ideas (OUT OF SCOPE)
- Moving all Sanity-based redirects into middleware (Performance concern).
- Changing the primary domain to `non-www`.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| RED-01 | Audit `proxy.ts` logic for `/ru` bug | Confirmed `isLocaleRoot` hardcoded to `/uk/woman` in current code. |
| RED-02 | Analyze multi-hop chain logic | Traced 3-hop chain: `http` -> `https` (Vercel) -> `/uk/path` (Proxy) -> `www` (Vercel). |
| RED-03 | Propose single-hop strategy | Recommended "Goal State" approach in `proxy.ts`. |
| RED-04 | Address Next.js 16 patterns | Confirmed `proxy.ts` as the new standard over `middleware.ts`. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.0 | Framework | Using latest `proxy.ts` pattern for request interception. |
| next-intl | 4.7.0 | I18n Routing | Handles `[locale]` segments and locale-specific rewrites. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| `@shared/i18n/routing` | local | Configuration | Centralized locale and routing definitions. |

## Architecture Patterns

### Recommended Pattern: Goal State Redirection
Instead of sequential `if` blocks that each return a redirect, compute all necessary changes on a single `URL` object and redirect once at the end of the normalization block.

**Pattern Flow:**
1. Initialize `targetUrl` from `request.nextUrl.clone()`.
2. Check/Update `targetUrl.protocol` (http -> https).
3. Check/Update `targetUrl.host` (non-www -> www).
4. Check/Update `targetUrl.pathname` (trailing slash removal).
5. Check/Update `targetUrl.pathname` (locale prepending / root fixes).
6. If `targetUrl` != `originalUrl`, return `NextResponse.redirect(targetUrl, 301)`.

### Anti-Patterns to Avoid
- **Sequential Redirects:** `if (no-www) redirect; if (no-locale) redirect;` — results in multi-hop chains.
- **Relative Redirects:** `return NextResponse.redirect('/new-path')` — may preserve non-canonical host/protocol.
- **Hardcoded Roots:** `/ru` -> `/uk/woman` — ignores the intended locale of the user.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| I18n Path Extraction | Manual Split/Regex | `next-intl` routing config | Handles complex edge cases and shared configuration. |
| URL Parsing | String manipulation | `new URL(request.url)` | Handles encoding, ports, and query params correctly. |
| Slug Cleaning | Manual replace | `cleanSlug` util | Already implemented to handle invisible garbage characters. |

## Common Pitfalls

### Pitfall 1: Infinite Redirect Loops
**What goes wrong:** Middleware redirects to a URL that it then matches and redirects again.
**How to avoid:** Always check if the current state is already "canonical" before marking `changed = true`.
**Warning signs:** Browser "Too many redirects" error.

### Pitfall 2: Breaking Staging/Preview Environments
**What goes wrong:** Forcing `www.miomio.com.ua` on a Vercel preview deployment (`*-vercel.app`) prevents testing.
**How to avoid:** Only enforce the production host if the current host is the known production naked domain (`miomio.com.ua`).

### Pitfall 3: Case Sensitivity in Locales
**What goes wrong:** `/UK/woman` vs `/uk/woman`.
**How to avoid:** Lowercase the pathname before checking against supported locales.

## Code Examples

### Refactored `proxy.ts` (Goal State Approach)
```typescript
// Source: Proposed architecture for Next.js 16 proxy.ts
import { NextRequest, NextResponse } from 'next/server';
import { routing } from '@shared/i18n/routing';

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  
  let changed = false;

  // 1. Canonical Host & Protocol Normalization
  const isProductionDomain = host === 'miomio.com.ua' || host === 'www.miomio.com.ua';
  const canonicalHost = 'www.miomio.com.ua';
  
  if (isProductionDomain && (host !== canonicalHost || protocol === 'http')) {
    url.host = canonicalHost;
    url.protocol = 'https:';
    changed = true;
  }

  // 2. Trailing Slash Normalization (Next.js default is false)
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1);
    changed = true;
  }

  // 3. Structural Path Logic
  const segments = url.pathname.split('/').filter(Boolean);
  
  // Handle Root and Locale Roots
  if (segments.length === 0) {
    url.pathname = '/uk/woman';
    changed = true;
  } else if (segments.length === 1 && routing.locales.includes(segments[0])) {
    url.pathname = `/${segments[0]}/woman`;
    changed = true;
  }

  // Handle Missing Locale Prefix
  const hasLocale = routing.locales.includes(segments[0]);
  if (!hasLocale && segments.length > 0) {
    url.pathname = `/uk${url.pathname}`;
    changed = true;
  }

  // Perform Single Redirect if needed
  if (changed) {
    return NextResponse.redirect(url, { status: 301 });
  }

  // ... continue to handleI18nRouting ...
}
```

## State of the Art

| Old Approach | Current Approach (Next.js 16) | Impact |
|--------------|-------------------------------|--------|
| `middleware.ts` | `proxy.ts` | Clarified network boundary, runs on Node.js. |
| Edge Runtime | Node.js Runtime | More stable, better integration with Node libraries. |
| Temporary Redirects (307/308) | Permanent 301 | Better for SEO and crawl budget preservation. |

## Open Questions

1. **Can we move Sanity redirects to `proxy.ts`?**
   - *Status:* Unclear performance impact.
   - *Recommendation:* Keep them in `next.config.ts` for now but ensure they use canonical sources.
2. **Vercel Automatic HTTPS Redirect:**
   - *Status:* Vercel usually intercepts `http` before middleware.
   - *Impact:* Might still cause 1 extra hop (`http` -> `https`) before our middleware can normalize the host and path.
   - *Recommendation:* Accept 1 hop for protocol if unavoidable at the platform level, as long as the second hop is the final destination.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + Playwright |
| Config file | `vitest.config.ts` / `playwright.config.ts` |
| Quick run command | `npm run test` |
| Full suite command | `npm run test:e2e` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RED-01 | `/ru` -> `/ru/woman` | e2e/unit | `playwright test tests/e2e/redirects.spec.ts` | ❌ Wave 0 |
| RED-02 | `http://miomio.com.ua` -> `https://www.miomio.com.ua/uk/woman` | e2e | `playwright test tests/e2e/redirects.spec.ts` | ❌ Wave 0 |
| RED-03 | `/uk/` -> `/uk/woman` | e2e | `playwright test tests/e2e/redirects.spec.ts` | ❌ Wave 0 |

### Wave 0 Gaps
- [ ] `tests/e2e/redirects.spec.ts` — Comprehensive test suite for all URL variants in the SEO audit CSV.
- [ ] `proxy.test.ts` — Unit tests for the canonical normalization logic (can mock `NextRequest`).

## Sources

### Primary (HIGH confidence)
- `proxy.ts` — Existing implementation analysis.
- `package.json` — Version verification (Next.js 16.1.0).
- `Next.js 16 Release Notes` — Verified `proxy.ts` and Node.js runtime patterns.

### Secondary (MEDIUM confidence)
- `SEO Audit CSV` — Identified 40+ URLs requiring normalization.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified in `package.json` and official docs.
- Architecture: HIGH - Goal State pattern is standard for minimizing hops.
- Pitfalls: MEDIUM - Dependent on Vercel platform behavior for protocol redirects.

**Research date:** March 21, 2026
**Valid until:** April 20, 2026
