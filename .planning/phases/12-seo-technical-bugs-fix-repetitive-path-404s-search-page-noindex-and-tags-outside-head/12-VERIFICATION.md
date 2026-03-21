---
phase: 12-seo-technical-bugs-fix-repetitive-path-404s-search-page-noindex-and-tags-outside-head
verified: 2026-03-21T14:00:00Z
status: human_needed
score: 8/8 must-haves verified
re_verification: false
human_verification:
  - test: "Confirm /uk/woman/woman returns HTTP 404"
    expected: "curl -o /dev/null -s -w \"%{http_code}\" https://www.miomio.com.ua/uk/woman/woman returns 404"
    why_human: "Cannot issue live HTTP requests against production; notFound() guard is verified in source but actual HTTP status requires a running server"
  - test: "Confirm /uk/search?q=test contains <meta name=\"robots\" content=\"noindex\">"
    expected: "curl -s https://www.miomio.com.ua/uk/search?q=test | grep -i noindex returns a match"
    why_human: "Static metadata export verified in source; actual rendered HTML head requires a live server response to confirm placement inside <head>"
  - test: "Confirm <title> appears inside <head> for a product page (not streamed after body)"
    expected: "curl -s https://www.miomio.com.ua/uk/woman/some-product | head -c 2000 | grep '<title>' returns a match"
    why_human: "htmlLimitedBots: /.*/ is verified in next.config.ts; only a live HTTP response can confirm title lands inside <head> before body content"
---

# Phase 12: SEO Technical Bugs Fix Verification Report

**Phase Goal:** Fix repetitive path 404s, search page noindex, title/canonical outside head — all four SEO technical bugs resolved
**Verified:** 2026-03-21T14:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | GET /uk/woman/woman returns HTTP 404, not 200 or 301 | ✓ VERIFIED (code) | `proxy.ts` has no repetitive-path redirect block; `CollectionPage` calls `notFound()` when `allowedGenders.includes(slug) && slug === gender` (lines 90-93) |
| 2 | GET /ru/woman/woman returns HTTP 404, not 200 or 301 | ✓ VERIFIED (code) | Same notFound() guard covers all locales since it operates on `slug` and `gender` params, not locale |
| 3 | GET /uk/man/man returns HTTP 404 | ✓ VERIFIED (code) | `allowedGenders = ['man', 'woman']` — guard covers both genders |
| 4 | Search page HTML contains noindex robots meta | ✓ VERIFIED (code) | `search/page.tsx` exports `export const metadata: Metadata = { robots: { index: false, follow: true } }` (lines 26-31); static export guaranteed in `<head>` |
| 5 | robots.txt contains Disallow: /\*?q= entry | ✓ VERIFIED | `app/robots.ts` line 31: `'/*?q='` in disallow array |
| 6 | robots.txt blocks /uk/search and /ru/search without trailing slash | ✓ VERIFIED | `app/robots.ts` lines 25-29: `'/uk/search'`, `'/uk/search/'`, `'/ru/search'`, `'/ru/search/'`, `'/search'` all present |
| 7 | next.config.ts has htmlLimitedBots: /.*/ | ✓ VERIFIED | `next.config.ts` line 11: `htmlLimitedBots: /.*/` as top-level nextConfig property |
| 8 | layout.tsx has DraftModeTools Suspense inside body, not after body | ✓ VERIFIED | `app/[locale]/(frontend)/layout.tsx` lines 164-166: `<Suspense><DraftModeTools /></Suspense>` is last child inside `<body>` (before `</body>` at line 167) |

**Score:** 8/8 truths verified in source code

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `proxy.ts` | No repetitive path redirect — paths fall through to page component | ✓ VERIFIED | The 6-line `0.1 Handle repeated segments` block (`segments[1] === segments[2]` redirect) is completely absent; confirmed by grep returning no matches |
| `app/[locale]/(frontend)/(home)/[gender]/(collection)/[slug]/page.tsx` | Calls `notFound()` when `slug === gender` | ✓ VERIFIED | Lines 90-93: guard present immediately after `setRequestLocale`; `notFound` imported from `'next/navigation'` on line 15 |
| `app/[locale]/(frontend)/search/page.tsx` | Static metadata with `robots: { index: false, follow: true }` | ✓ VERIFIED | Lines 1 and 26-31: `import type { Metadata }` and full static export confirmed |
| `app/robots.ts` | Disallow list includes `/*?q=`, `/uk/search`, `/ru/search` without trailing slash | ✓ VERIFIED | All entries present at lines 25-31; also includes `/search` (non-locale belt-and-suspenders) |
| `next.config.ts` | `htmlLimitedBots: /.*/` as top-level nextConfig property | ✓ VERIFIED | Line 11: present after `experimental` block, before `output: 'standalone'` |
| `app/[locale]/(frontend)/layout.tsx` | `<Suspense><DraftModeTools /></Suspense>` last child inside `<body>` | ✓ VERIFIED | Lines 164-167: Suspense block is inside `<body>` closing tag; invalid post-`</body>` placement is gone |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `proxy.ts` (no redirect) | `CollectionPage notFound() guard` | Repetitive path falls through proxy to page component | ✓ WIRED | proxy.ts has no `segments[1] === segments[2]` block; CollectionPage guard fires at render time |
| `app/robots.ts` | robots.txt HTTP response | Next.js `robots.ts` file convention | ✓ WIRED | File present at correct path (`app/robots.ts`); Next.js auto-serves as `/robots.txt` |
| `next.config.ts htmlLimitedBots` | All pages with `generateMetadata` | Next.js framework intercepts all requests, blocks streaming until metadata resolves | ✓ WIRED | `htmlLimitedBots: /.*/` is a regex literal at top-level of `nextConfig` object; `withNextIntl` wrapper preserves the property |
| `search/page.tsx metadata` | `<head>` in rendered HTML | Static export — synchronous, never streamed by Suspense | ✓ WIRED (human confirm needed) | Static `export const metadata` guaranteed in `<head>` by Next.js App Router contract; live HTML confirmation requires human |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| SEO-12-01 | 12-01-PLAN.md | Repetitive path URLs return HTTP 404 | ✓ SATISFIED | proxy.ts redirect removed; CollectionPage notFound() guard added |
| SEO-12-02 | 12-01-PLAN.md | Search pages noindexed via metadata and robots.txt | ✓ SATISFIED | Static metadata with `index: false` in search/page.tsx; `/*?q=` and search paths in robots.ts disallow |
| SEO-12-03 | 12-02-PLAN.md | `<title>` appears inside `<head>` in raw HTML (not streamed outside head) | ✓ SATISFIED (code); ? human needed for live confirmation | `htmlLimitedBots: /.*/` forces metadata resolution before streaming |
| SEO-12-04 | 12-02-PLAN.md | `<link rel="canonical">` appears inside `<head>` in raw HTML | ✓ SATISFIED (code); ? human needed for live confirmation | Same htmlLimitedBots fix applies to all metadata including canonical |

**Note on requirements traceability:** SEO-12-01 through SEO-12-04 are defined only within plan frontmatter. They do not appear in `.planning/REQUIREMENTS.md`. The central REQUIREMENTS.md contains only `SEO-01` (product/collection meta description, mapped to Phase 7). These phase-12 IDs are phase-local requirements — no orphaned entries found in REQUIREMENTS.md for Phase 12.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `next.config.ts` | 2 | `import { withPostHogConfig }` — imported but never used (exported config uses only `withNextIntl` wrapper) | ℹ️ Info | Pre-existing issue; noted in 12-02-SUMMARY.md; not introduced by this phase; does not affect SEO correctness |

No blocker or warning anti-patterns found in phase-12 changes. The unused import is pre-existing and does not affect functionality.

### Human Verification Required

#### 1. Repetitive Path HTTP 404 (Live Server)

**Test:** `curl -o /dev/null -s -w "%{http_code}" https://www.miomio.com.ua/uk/woman/woman`
**Expected:** Response code `404`
**Why human:** The notFound() guard is present in source and the proxy redirect is absent, but the actual HTTP response status code can only be confirmed against a running server. The build must be deployed first.

#### 2. Search Page noindex in Rendered HTML

**Test:** `curl -s "https://www.miomio.com.ua/uk/search?q=test" | grep -i 'noindex'`
**Expected:** Output contains `<meta name="robots" content="noindex,follow">` or similar
**Why human:** Static metadata export guarantees placement in `<head>` per Next.js App Router contract, but the actual rendered HTML output requires a live server to confirm tag presence and correct placement.

#### 3. Title Tag Inside Head (htmlLimitedBots effect)

**Test:** `curl -s https://www.miomio.com.ua/uk/woman | head -c 3000 | grep -o '<title[^>]*>.*</title>'`
**Expected:** `<title>` tag appears in the first ~3000 bytes of HTML (inside `<head>`, before any `<body>` content)
**Why human:** `htmlLimitedBots: /.*/` forces synchronous metadata resolution — this can only be confirmed as effective by inspecting actual streaming HTML response from a live Next.js server. Source code alone cannot prove the fix resolves the original Screaming Frog audit finding.

#### 4. robots.txt Live Output

**Test:** `curl -s https://www.miomio.com.ua/robots.txt | grep -E "q=|search"`
**Expected:** Output includes `Disallow: /*?q=` and `Disallow: /uk/search` (without trailing slash)
**Why human:** The `app/robots.ts` source is correct, but the live endpoint confirms Next.js is serving the file and the deployed version is active.

## Commit Verification

All four task commits documented in SUMMARY files confirmed present in git history:

| Commit | Task | Status |
|--------|------|--------|
| `0fc2415` | Remove repetitive path redirect + notFound() guard | Confirmed |
| `509de3b` | noindex metadata to search page + robots.ts fix | Confirmed |
| `a8298bf` | htmlLimitedBots to next.config.ts | Confirmed |
| `7d5b0bd` | DraftModeTools Suspense moved inside body | Confirmed |

## Summary

All four SEO technical bugs have source-level implementations that match the plan specifications exactly:

1. **SEO-12-01 (Repetitive path 404s):** proxy.ts repetitive-path redirect block deleted; CollectionPage notFound() guard wired at lines 90-93. URLs like `/uk/woman/woman` and `/uk/man/man` will return 404.

2. **SEO-12-02 (Search page noindex):** Static `export const metadata` with `robots: { index: false, follow: true }` at search/page.tsx lines 26-31. robots.ts disallow list covers `/uk/search`, `/ru/search`, `/search` (with and without trailing slash) and `/*?q=`.

3. **SEO-12-03 (title in head):** `htmlLimitedBots: /.*/` at next.config.ts line 11 forces all requests to wait for metadata resolution before HTML streaming. This addresses the Screaming Frog audit finding.

4. **SEO-12-04 (canonical in head):** Same `htmlLimitedBots` fix applies to all metadata including `<link rel="canonical">`.

Automated source verification passes fully. Three human verification steps remain to confirm live HTTP behavior after deployment.

---

_Verified: 2026-03-21T14:00:00Z_
_Verifier: Claude (gsd-verifier)_
