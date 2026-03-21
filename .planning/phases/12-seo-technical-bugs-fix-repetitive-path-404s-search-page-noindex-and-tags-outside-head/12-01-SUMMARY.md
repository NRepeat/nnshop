---
phase: 12-seo-technical-bugs-fix-repetitive-path-404s-search-page-noindex-and-tags-outside-head
plan: 01
subsystem: seo
tags: [nextjs, middleware, robots, metadata, proxy, notFound]

requires: []
provides:
  - "Repetitive path URLs (/uk/woman/woman) return HTTP 404 via CollectionPage notFound() guard"
  - "Search pages (/uk/search?q=...) have static noindex metadata preventing indexing"
  - "robots.ts disallow list covers /uk/search without trailing slash and /*?q= URL parameter"
affects:
  - phase-13-seo-redirect-architecture
  - seo-crawl-budget
  - google-search-console

tech-stack:
  added: []
  patterns:
    - "Page-level notFound() guard for invalid slug patterns (slug===gender) as defense layer after proxy"
    - "Static export const metadata with robots field for noindex pages — guarantees head placement, never streamed"

key-files:
  created: []
  modified:
    - proxy.ts
    - app/[locale]/(frontend)/(home)/[gender]/(collection)/[slug]/page.tsx
    - app/[locale]/(frontend)/search/page.tsx
    - app/robots.ts

key-decisions:
  - "Remove proxy redirect for repetitive paths entirely — let them fall through to page-level notFound() guard; proxy 301 was returning 200 via redirect chain, page guard guarantees true 404 HTTP status"
  - "Static metadata export (not generateMetadata function) for search noindex — static object always lands in <head>, never streamed late by Suspense"
  - "Add both /uk/search and /uk/search/ to robots.ts disallow — belt-and-suspenders since Googlebot may or may not add trailing slash"
  - "/*?q= added before /*?sort=* in disallow list — blocks all search result URL variations at the Googlebot level"

patterns-established:
  - "Two-layer defense for invalid URL 404s: proxy removal (no redirect) + page component notFound() call"
  - "Use static metadata export for noindex pages in Next.js App Router — ensures synchronous head output"

requirements-completed:
  - SEO-12-01
  - SEO-12-02

duration: 3min
completed: 2026-03-21
---

# Phase 12 Plan 01: SEO Technical Bugs Summary

**Repetitive path 404 fix via notFound() guard in CollectionPage and search page noindex via static metadata export + robots.ts /*?q= disallow**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-21T13:31:59Z
- **Completed:** 2026-03-21T13:34:16Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Removed 301 redirect for /uk/woman/woman from proxy.ts — path now falls through to collection page which calls notFound(), guaranteeing HTTP 404
- Added notFound() guard in CollectionPage when slug === gender (covers /uk/woman/woman, /uk/man/man, and Russian locale equivalents)
- Added static metadata export with robots: { index: false, follow: true } to search/page.tsx — search pages are now noindexed via head meta tag
- Updated robots.ts: added /uk/search, /ru/search (without trailing slash), /search, and /*?q= to the disallow list

## Task Commits

1. **Task 1: Remove repetitive path redirect and add notFound() guard** - `0fc2415` (fix)
2. **Task 2: Add noindex metadata to search page and fix robots.ts** - `509de3b` (fix)

**Plan metadata:** (docs commit to follow)

## Files Created/Modified

- `proxy.ts` - Removed 0.1 block (6 lines) that redirected /uk/woman/woman to /uk/woman with 301
- `app/[locale]/(frontend)/(home)/[gender]/(collection)/[slug]/page.tsx` - Added notFound import and slug===gender guard at top of CollectionPage
- `app/[locale]/(frontend)/search/page.tsx` - Added `import type { Metadata }` and `export const metadata` with robots noindex
- `app/robots.ts` - Added /uk/search, /ru/search (sans trailing slash), /search, and /*?q= to disallow array

## Decisions Made

- Removed proxy redirect entirely instead of replacing with notFound rewrite — page component guard is the correct React layer for 404 status
- Used static `export const metadata` (not `generateMetadata`) for search page — static export is synchronous and guaranteed to appear in `<head>` before any streaming
- Added `/*?q=` to robots.ts even though search pages have noindex meta — belt-and-suspenders: some bots read robots.txt only

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Pre-existing TypeScript errors in `src/features/collection/lib/filterProducts.test.ts` (missing `handle` property in test fixtures) were present before this plan and are out of scope.

## Known Stubs

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All four success criteria from plan verified
- Repetitive path URLs now return 404, not 200 — crawl budget no longer wasted on /uk/woman/woman
- Search pages are noindexed — Google will not index /uk/search?q=... results
- robots.txt will block Googlebot from crawling search URLs entirely
- Ready for Phase 12-02 (tags outside head) or Phase 13 (redirect architecture)

---
*Phase: 12-seo-technical-bugs-fix-repetitive-path-404s-search-page-noindex-and-tags-outside-head*
*Completed: 2026-03-21*
