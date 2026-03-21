# Phase 12: SEO Technical Bugs - Research

**Researched:** 2026-03-21
**Domain:** Next.js 16 App Router SEO — metadata, routing, robots, proxy middleware
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

All four bugs are in scope:
1. Repetitive path URLs `/uk/woman/woman`, `/ru/woman/woman` — must return 404 (currently return 200 OK)
2. Search pages `/search?q=...` — must have `noindex, follow` meta robots; robots.txt must block `/*?q=`
3. `<title>` tag rendered outside `<head>` on some pages
4. `<link rel="canonical">` rendered outside `<head>` on some pages

Success criteria (from CONTEXT.md):
- No URL with repeated path segment returns 200; all return 404
- All search page templates have `noindex, follow` in meta robots
- robots.txt includes `Disallow: /*?q=`
- No search URLs appear in any sitemap output
- `<title>` and `<link rel="canonical">` only appear inside `<head>` on all pages (verified with view-source)

### Claude's Discretion

Not specified.

### Deferred Ideas (OUT OF SCOPE)

Not specified.
</user_constraints>

---

## Summary

This phase addresses four SEO technical bugs found during the March 2026 Screaming Frog audit of www.miomio.com.ua. All bugs are fixable through targeted changes to Next.js routing and metadata configuration — no new libraries are needed.

**Bug 1 (Repetitive paths):** `proxy.ts` already has a check for `/uk/woman/woman` → 301 redirect to `/uk/woman`. However, the SEO audit found these return 200 OK, which indicates the proxy was not running when the audit was conducted (likely a stale build). The current CONTEXT.md requires 404, not 301, for these URLs. The proxy logic must be changed: instead of redirecting to `/uk/woman`, respond with 404 (Next.js `notFound()` equivalent — rewrite to `/[locale]/not-found`).

**Bug 2 (Search noindex):** The search page (`app/[locale]/(frontend)/search/page.tsx`) exports no `generateMetadata`. It has no `robots` field, so it inherits the layout default which allows indexing. Fix is adding a static `export const metadata` with `robots: { index: false, follow: true }` to the search page. Additionally, `robots.ts` is missing `Disallow: /*?q=` and `Disallow: /search` without trailing slash pattern.

**Bug 3 & 4 (Title/canonical outside head):** Next.js 15.2+ introduced streaming metadata: when `generateMetadata` awaits async operations (network fetches), Next.js streams the resolved metadata tags into the `<body>` after the initial HTML response instead of blocking to inject them into `<head>`. The Screaming Frog audit detected this on `ru/` locale pages — specifically product, collection, brand, and home pages — all of which use `generateMetadata` with Shopify API calls. The fix is setting `htmlLimitedBots: /.*/` in `next.config.ts`, which disables streaming metadata and ensures all metadata resolves before streaming begins. Additionally, the layout.tsx has `<Suspense><DraftModeTools /></Suspense>` placed after `</body>` but still inside `</html>` — this should be moved inside `<body>` as a precaution.

**Primary recommendation:** Fix Bug 1 by changing the proxy repetitive-path redirect to a `notFound()` rewrite. Fix Bug 2 by adding static metadata to the search page and updating robots.ts. Fix Bugs 3 & 4 by adding `htmlLimitedBots: /.*/` to next.config.ts and moving the DraftModeTools Suspense inside `</body>`.

---

## Standard Stack

No new libraries are needed. All fixes use existing project infrastructure.

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.0 | Framework — metadata, routing, proxy | Already in use |
| next-intl | ^4.7.0 | i18n routing handled in proxy.ts | Already in use |

### No New Installations Required

All fixes are configuration and code changes within the existing stack.

---

## Architecture Patterns

### Pattern 1: Blocking Metadata for All Bots (htmlLimitedBots)

**What:** Setting `htmlLimitedBots: /.*/` in `next.config.ts` forces Next.js to resolve all `generateMetadata` calls before streaming the initial HTML response. This ensures `<title>` and `<link rel="canonical">` always appear in `<head>` for every request, not just bots.

**When to use:** When Screaming Frog or other HTML-only crawlers detect metadata outside `<head>`. This is the official Next.js workaround for the streaming metadata behavior introduced in v15.2.

**Source:** https://nextjs.org/docs/app/api-reference/functions/generate-metadata#streaming-metadata

**Example:**
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  htmlLimitedBots: /.*/,  // Force all bots/crawlers to receive metadata in <head>
  // ... rest of config
};
```

**Tradeoff:** Slightly increases TTFB since Next.js waits for all `generateMetadata` calls to resolve before sending the first byte. For this project, `generateMetadata` calls make Shopify API requests, so there may be a measurable delay. However, the SEO correctness benefit outweighs this concern for a production e-commerce site.

---

### Pattern 2: Static metadata Export for Non-Dynamic Pages

**What:** The search page does not need dynamic metadata — its noindex directive is always the same regardless of the `q` param. Use a static `export const metadata` object instead of `generateMetadata`. Static metadata is always in `<head>` and never streamed.

**When to use:** Any page where indexability is determined by page type, not by content.

**Source:** https://nextjs.org/docs/app/api-reference/functions/generate-metadata#the-metadata-object

**Example:**
```typescript
// app/[locale]/(frontend)/search/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};
```

---

### Pattern 3: Proxy notFound Rewrite for Invalid URL Patterns

**What:** In Next.js 16 `proxy.ts`, instead of redirecting repetitive paths (e.g. `/uk/woman/woman` → `/uk/woman`), rewrite to the locale-specific not-found route so the response is 404.

**When to use:** URL patterns that should never exist as valid pages — invalid slug combinations, path segment repetition, etc.

**Source:** https://nextjs.org/docs/app/api-reference/file-conventions/proxy (official Next.js 16 docs)

**Example:**
```typescript
// proxy.ts — replace the existing 301 redirect with a 404 rewrite
if (segments.length >= 2) {
  const [locale, second, third] = segments;
  // Repetitive path: /uk/woman/woman or /ru/man/man (and deeper variants)
  if (third !== undefined && second === third && allowedGenders.includes(second)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/404`;
    return NextResponse.rewrite(url, { status: 404 });
  }
}
```

**Key detail:** `NextResponse.rewrite(url)` by default returns status 200 — to return 404 you must pass `{ status: 404 }` explicitly. Alternatively, use a dedicated not-found page route and the proxy can simply rewrite to that path which calls `notFound()`.

**Important:** The existing condition at line 23 of proxy.ts only checks for exactly 3 segments (`segments.length >= 3 && segments[1] === segments[2]`). This handles `/uk/woman/woman` correctly. However, it does not handle deeper paths like `/uk/woman/woman/some-slug` (4+ segments). The audit CSV only showed 2 URLs (`/uk/woman/woman` and `/ru/woman/woman`), so extending the check for any depth is a precaution but not strictly required by the audit findings.

---

### Pattern 4: robots.txt Query Parameter Blocking

**What:** Adding `Disallow: /*?q=` to robots.ts blocks crawlers from accessing any URL with a `?q=` query parameter, preventing search engine indexation of search result pages via robots.txt directive.

**When to use:** Any search page pattern that uses query params to drive results.

**Source:** https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots (official Next.js docs)

**Example:**
```typescript
// app/robots.ts
disallow: [
  // ... existing entries ...
  '/uk/search',   // without trailing slash (current entry is /uk/search/)
  '/ru/search',
  '/*?q=',        // blocks any URL with ?q= parameter
],
```

**Note:** The current robots.ts has `/uk/search/` and `/ru/search/` with trailing slashes. These should be verified — Google treats `/uk/search` and `/uk/search/` as different paths. The existing entries may not block `/uk/search?q=something` since there is no trailing slash after `search` in the actual URL pattern.

---

### Anti-Patterns to Avoid

- **301 redirect for repetitive paths instead of 404:** The current proxy.ts redirects `/uk/woman/woman` → `/uk/woman` with 301. The CONTEXT.md requires 404. A 301 tells Google these are valid URLs pointing to canonical versions; a 404 tells Google these URLs should not exist at all.
- **Using `robots: 'noindex, follow'` string instead of object:** The project's `generatePageMetadata` uses the string form (`robots: seo.noIndex ? 'noindex, nofollow' : 'index, follow'`). The static metadata export on the search page should use the object form `robots: { index: false, follow: true }` for type safety and consistency with Next.js Metadata type.
- **Placing Suspense boundaries outside `</body>`:** The layout.tsx currently has `<Suspense><DraftModeTools /></Suspense>` after `</body>`. While React/Next.js handles this without crashing, it is non-standard HTML and could contribute to unexpected streaming behavior. Move it inside `<body>` before `</body>`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Metadata in head | Custom head injection logic | `htmlLimitedBots` in next.config.ts | Next.js handles all metadata placement; fighting the framework creates more bugs |
| robots.txt generation | Custom HTTP handler | Next.js `app/robots.ts` with `MetadataRoute.Robots` type | Already in use; adding a disallow entry is a one-line change |
| 404 routing in proxy | Custom 404 response body | `NextResponse.rewrite` to existing `[locale]/404` route | The not-found page is already built and styled |

**Key insight:** All four bugs are Next.js framework configuration issues, not missing feature gaps. Every fix is a small, targeted edit to existing files.

---

## Common Pitfalls

### Pitfall 1: NextResponse.rewrite Does Not Set 404 Status by Default

**What goes wrong:** `NextResponse.rewrite(url)` returns status 200 even though it serves the 404 page content. Screaming Frog and Google would still see status 200.

**Why it happens:** `rewrite` is meant to internally route requests — the status code of the final rendered page response overrides it. However, the `notFound()` function called in a page component does return 404. If you rewrite to `/[locale]/404` (a static path) rather than triggering `notFound()` in the collection page component, the status depends on what that route returns.

**How to avoid:** The cleanest approach is to rewrite to the locale's not-found route (e.g. `/uk/not-found-page`) which calls `notFound()`, OR use `NextResponse.json({ error: 'not found' }, { status: 404 })` for API-style handling. However, the best pattern for Next.js App Router is: if the proxy detects a repetitive path, allow the request to pass through to the collection page, and let the collection page call `notFound()` when no collection is found. This requires no proxy change — instead, add a guard in the collection page that calls `notFound()` when `slug === gender`.

**Warning signs:** Screaming Frog shows 200 even after the proxy change. Check actual HTTP response status with `curl -I`.

---

### Pitfall 2: Streaming Metadata Only Affects Non-Bot Requests

**What goes wrong:** Testing locally or with Googlebot User Agent may show metadata correctly in `<head>`, but regular browser requests (and Screaming Frog) see it in `<body>`.

**Why it happens:** Next.js 15.2+ detects the User Agent. Known bots (Googlebot, Bingbot) receive blocking metadata. Screaming Frog and regular browsers receive streaming metadata.

**How to avoid:** Set `htmlLimitedBots: /.*/` to force all requests (including Screaming Frog's UA) to get metadata in `<head>`. After applying this fix, verify with `curl -I` or Screaming Frog that `<title>` appears inside `<head>`.

**Warning signs:** `<title>` appears correct in browser DevTools > Elements (which shows live DOM after JS execution) but incorrect in "View Source" (which shows raw HTML). View Source is the authoritative test.

---

### Pitfall 3: robots.txt Disallow With/Without Trailing Slash

**What goes wrong:** Adding `Disallow: /uk/search/` blocks `/uk/search/` but NOT `/uk/search?q=something` (no trailing slash before `?`).

**Why it happens:** Robots.txt path matching is prefix-based. `/uk/search/` only matches paths that start with `/uk/search/` — it does not match `/uk/search?q=...`.

**How to avoid:** Add both `Disallow: /uk/search` (no trailing slash, catches `/uk/search?q=...`) and the existing `/uk/search/`. Also add `Disallow: /*?q=` as a catch-all for any future search-adjacent URLs.

**Warning signs:** robots.txt tester in Google Search Console shows `/uk/search?q=shoes` as "allowed" after the fix.

---

### Pitfall 4: Static metadata vs generateMetadata for Search Page

**What goes wrong:** Adding `robots: 'noindex'` to `generateMetadata` when there is no dynamic data needed still participates in streaming metadata (because `generateMetadata` is async).

**Why it happens:** Any `async function generateMetadata()` can be deferred by Next.js streaming, even if it returns a constant.

**How to avoid:** Use the static `export const metadata` object (not a function) for the search page. Static metadata is resolved at build time and is always in `<head>`.

---

### Pitfall 5: The DraftModeTools Suspense Placement

**What goes wrong:** `<Suspense><DraftModeTools /></Suspense>` is currently placed after `</body>` but before `</html>` in layout.tsx. This is technically invalid HTML and could interfere with streaming.

**Why it happens:** During a code refactor, the Suspense wrapper was placed outside the body closing tag.

**How to avoid:** Move `<Suspense><DraftModeTools /></Suspense>` to be the last element inside `<body>`, before `</body>`. This is a structural fix that ensures the HTML document is valid.

---

## Code Examples

### Search Page — Static noindex Metadata

```typescript
// app/[locale]/(frontend)/search/page.tsx
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

// Keep existing SearchPage component unchanged
```

### next.config.ts — Disable Streaming Metadata

```typescript
// next.config.ts
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#streaming-metadata
const nextConfig: NextConfig = {
  htmlLimitedBots: /.*/,
  experimental: {
    viewTransition: true,
    cssChunking: true,
  },
  // ... rest unchanged
};
```

### robots.ts — Add Query Param Blocking

```typescript
// app/robots.ts
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
disallow: [
  '/api/',
  '/studio/',
  '/uk/auth/',
  '/ru/auth/',
  '/uk/checkout/',
  '/ru/checkout/',
  '/uk/cart/',
  '/ru/cart/',
  '/uk/account/',
  '/ru/account/',
  '/uk/favorites/',
  '/ru/favorites/',
  '/uk/search',   // Note: no trailing slash — catches /uk/search?q=...
  '/ru/search',   // Note: no trailing slash — catches /ru/search?q=...
  '/search',      // Also block non-locale /search (proxy redirects to /uk/search but belt-and-suspenders)
  '/*?q=',        // Catch-all for any ?q= parameter URL
  '/*?sort=*',
  '/*?limit=*',
  '/*?page=*',
  '/*?utm_*',
  '/*?gclid=*',
  '/*?fbclid=*',
  '/*?ref=*',
],
```

### proxy.ts — Repetitive Path to 404

**Option A (preferred): Guard in the page component**

Rather than changing the proxy, add a guard inside the collection page and gender page that calls `notFound()` when `slug === gender`.

```typescript
// app/[locale]/(frontend)/(home)/[gender]/(collection)/[slug]/page.tsx
import { notFound } from 'next/navigation';

export default async function CollectionPage({ params, searchParams }: Props) {
  const { locale, slug, gender } = await params;

  // Repetitive path guard: /uk/woman/woman is not a valid collection
  const allowedGenders = ['woman', 'man'];
  if (allowedGenders.includes(slug) && slug === gender) {
    notFound();
  }
  // ... rest unchanged
}
```

This approach is reliable because:
1. It runs in the React rendering layer (always returns HTTP 404 regardless of proxy behavior)
2. It does not require modifying proxy logic
3. `notFound()` in a page component returns proper 404 with the correct Not Found page UI

**Option B (also fix in proxy): Change 301 to rewrite**

```typescript
// proxy.ts — update existing check at line 23
// BEFORE: 301 redirect to /uk/woman
// AFTER: rewrite to not-found (which calls notFound() → 404)
if (segments.length >= 3 && segments[1] === segments[2] && allowedGenders.includes(segments[1])) {
  const url = request.nextUrl.clone();
  url.pathname = `/${segments[0]}/woman`;  // existing redirect target
  // Remove this redirect, OR change to:
  // return NextResponse.next(); // let the page component handle it with notFound()
}
```

The cleanest approach: **remove the proxy redirect entirely** for repetitive paths, and rely on the page-level `notFound()` guard. The proxy redirect was incorrectly returning a successful page when it should be returning 404. By removing the proxy redirect and adding `notFound()` in the page, the behavior matches the requirement.

### layout.tsx — Move DraftModeTools Inside body

```tsx
// app/[locale]/(frontend)/layout.tsx
// BEFORE: <Suspense> is after </body>
      </body>
      <Suspense>
        <DraftModeTools />
      </Suspense>
    </html>

// AFTER: <Suspense> is the last child inside <body>
      <Suspense>
        <DraftModeTools />
      </Suspense>
      </body>
    </html>
```

---

## Key Finding: Proxy.ts IS Running Correctly in Next.js 16

The middleware manifest showing empty (`"middleware": {}`) was from a stale `.next` build artifact inspected during research. In Next.js 16, `proxy.ts` is the correct filename for what was previously `middleware.ts`. The git history confirms this: commit `19adda0` (`upgrade to 16`) renamed `middleware.ts -> proxy.ts`. The project already completed the Next.js 16 migration. The proxy is running.

The reason the SEO audit found `/uk/woman/woman` returning 200 is that the proxy does a **301 redirect** to `/uk/woman`, and the audit tool may have followed that redirect and reported the final destination's status. Or the audit was run before the redirect was in place.

Regardless, the CONTEXT.md requirement is clear: these URLs must return **404**, not redirect. The proxy currently redirects. This behavior must change.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Middleware blocking all metadata | Streaming metadata (async metadata in `<body>` for browsers) | Next.js 15.2 | Title/canonical detected outside head by HTML-only crawlers |
| `middleware.ts` filename | `proxy.ts` filename | Next.js 16.0 | Renamed — project already migrated correctly |
| `robots: string` | `robots: { index, follow, googleBot }` object | Next.js 13.2 | Better type safety and granular control |

**Deprecated/outdated:**
- `middleware.ts` as the middleware filename: replaced by `proxy.ts` in Next.js 16 (already migrated)
- `robots: 'noindex, follow'` string form: still works but object form `robots: { index: false, follow: true }` is preferred for type safety

---

## Open Questions

1. **Does `htmlLimitedBots: /.*/` affect LCP/performance metrics on production?**
   - What we know: The Next.js docs say this option "could lead to longer response times." The project's `generateMetadata` functions make Shopify API calls (e.g. `getCollection`, `getProduct`), which are already cached with `use cache` / Shopify storefront caching.
   - What's unclear: Actual TTFB impact on `ru/` locale product pages in production conditions.
   - Recommendation: Apply the fix, monitor TTFB via PostHog (already integrated) after deployment. If TTFB degrades significantly, investigate moving `generateMetadata` to use cached data patterns.

2. **Were `/uk/woman/woman` URLs ever indexed by Google?**
   - What we know: The audit found them returning 200 OK with noindex. Noindex means Google should not have indexed them.
   - What's unclear: Whether Googlebot crawled and reported them as crawled-but-not-indexed, consuming crawl budget.
   - Recommendation: After fixing (returning 404), submit a URL removal request in Google Search Console if any of these appear in coverage reports.

3. **Does the search page need a canonical tag as well?**
   - What we know: The search page currently has no `generateMetadata`, so it inherits the layout's metadata which does not set a canonical.
   - What's unclear: Whether Screaming Frog reported missing canonical on search pages specifically.
   - Recommendation: When adding `export const metadata` for noindex, also add `alternates: { canonical: '' }` to explicitly self-canonical the search URL. However, this is low priority since noindex makes the canonical irrelevant for search engines.

---

## Validation Architecture

No test framework is configured per CLAUDE.md. `vitest.config.ts` exists at root but there are no test files (`src/**/*.test.ts` pattern, no matches found).

Since CLAUDE.md explicitly states "No test framework is configured" and no test files exist, validation for this phase is manual:

| Req | Behavior | Test Type | Command/Method |
|-----|----------|-----------|----------------|
| Bug 1 | `/uk/woman/woman` returns 404 | manual | `curl -I https://www.miomio.com.ua/uk/woman/woman` — expect HTTP 404 |
| Bug 1 | `/ru/woman/woman` returns 404 | manual | `curl -I https://www.miomio.com.ua/ru/woman/woman` — expect HTTP 404 |
| Bug 2 | Search page has noindex | manual | `curl -s https://www.miomio.com.ua/uk/search?q=test \| grep -i 'robots\|noindex'` |
| Bug 2 | robots.txt blocks `?q=` | manual | `curl https://www.miomio.com.ua/robots.txt \| grep "q="` |
| Bug 3 | Title in head | manual | `curl -s https://www.miomio.com.ua/ru/woman \| grep -o '<title[^>]*>[^<]*</title>'` — must appear before `</head>` |
| Bug 4 | Canonical in head | manual | `curl -s https://www.miomio.com.ua/ru/woman \| grep canonical` — must appear before `</head>` |

All validations require a production or staging deployment. Local `npm run dev` with dev server can test most behaviors.

---

## Sources

### Primary (HIGH confidence)
- https://nextjs.org/docs/app/api-reference/file-conventions/proxy — official Next.js 16 proxy.ts documentation (version 16.2.1, last updated 2026-03-13)
- https://nextjs.org/docs/app/api-reference/functions/generate-metadata — official Next.js generateMetadata docs, confirmed `htmlLimitedBots` config and streaming metadata behavior (version 16.2.1)
- https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots — official robots.ts API documentation

### Secondary (MEDIUM confidence)
- https://github.com/vercel/next.js/issues/79313 — "Metadata renders inside body instead of head" confirmed as streaming metadata behavior, with official Next.js team response confirming `htmlLimitedBots` fix
- https://github.com/vercel/next.js/discussions/84842 — "Rename middleware.ts in Next.js 16 Beta" confirms middleware→proxy rename; project already completed this migration

### Tertiary (LOW confidence - not used for recommendations)
- https://neuralcovenant.com/2025/06/the-metadata-streaming-controversy-in-next.js-15.1/ — community analysis of streaming metadata behavior

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — no new libraries, all existing Next.js APIs
- Architecture: HIGH — verified in official Next.js 16 docs
- Pitfalls: HIGH — confirmed via GitHub issues and official changelog
- Bug root causes: HIGH — verified by reading actual source code (proxy.ts, layout.tsx, search/page.tsx)

**Research date:** 2026-03-21
**Valid until:** 2026-04-21 (Next.js 16 is stable, low churn expected)
