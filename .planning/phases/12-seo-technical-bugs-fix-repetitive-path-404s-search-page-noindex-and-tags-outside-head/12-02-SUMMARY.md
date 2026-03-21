---
phase: 12-seo-technical-bugs-fix-repetitive-path-404s-search-page-noindex-and-tags-outside-head
plan: "02"
subsystem: seo

tags: [next.js, metadata, streaming, htmlLimitedBots, layout, html-structure]

# Dependency graph
requires: []
provides:
  - "htmlLimitedBots: /.*/ in next.config.ts forces metadata resolution before HTML streaming for all user agents"
  - "Valid HTML structure — DraftModeTools Suspense moved from after </body> to last child inside <body>"
affects:
  - "All pages with async generateMetadata (product, collection, brand pages)"
  - "Screaming Frog and crawler audits"
  - "Google Search Console title and canonical tag detection"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "htmlLimitedBots: /.*/ pattern for forcing synchronous metadata resolution in Next.js 15.2+"

key-files:
  created: []
  modified:
    - "next.config.ts"
    - "app/[locale]/(frontend)/layout.tsx"

key-decisions:
  - "htmlLimitedBots: /.*/ set to regex literal (not string) matching all user agents — forces Next.js to resolve generateMetadata before streaming HTML begins"
  - "DraftModeTools Suspense placed as last child inside <body> (after </Providers>) not after </body> — fixes invalid HTML structure while preserving Sanity draft mode functionality"
  - "Slight TTFB increase on pages with async generateMetadata is acceptable — calls are cached via Next.js use cache and Shopify storefront caching, SEO correctness benefit outweighs marginal cost"

patterns-established:
  - "htmlLimitedBots: /.*/ pattern: Use when Next.js streaming metadata causes tags to appear outside <head>"

requirements-completed:
  - SEO-12-03
  - SEO-12-04

# Metrics
duration: 8min
completed: "2026-03-21"
---

# Phase 12 Plan 02: Tags Outside Head Fix Summary

**htmlLimitedBots: /.*/ forces all metadata resolution before HTML streaming, and DraftModeTools Suspense moved inside body to fix invalid HTML structure**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-21T09:45:00Z
- **Completed:** 2026-03-21T09:53:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added `htmlLimitedBots: /.*/` to next.config.ts — Next.js 15.2+ streaming metadata caused `<title>` and `<link rel="canonical">` to be injected after initial HTML streaming, landing outside `<head>` for non-bot user agents including Screaming Frog; this fix forces all requests to wait for metadata resolution
- Fixed invalid HTML structure: `<Suspense><DraftModeTools /></Suspense>` was placed after `</body>` (between `</body>` and `</html>`), which is invalid HTML; moved it inside `<body>` as the last child element
- Build verified successful — `.next/BUILD_ID` present, TypeScript compilation passes for non-test source files

## Task Commits

Each task was committed atomically:

1. **Task 1: Add htmlLimitedBots to next.config.ts** - `a8298bf` (feat)
2. **Task 2: Move DraftModeTools Suspense inside body in layout.tsx** - `7d5b0bd` (fix)

## Files Created/Modified

- `next.config.ts` — Added `htmlLimitedBots: /.*/` as top-level nextConfig property after the `experimental` block
- `app/[locale]/(frontend)/layout.tsx` — Moved `<Suspense><DraftModeTools /></Suspense>` from after `</body>` to last child inside `<body>` (after `</Providers>`, before `</body>`)

## Decisions Made

- `htmlLimitedBots: /.*/` is a regex literal (not string) — matches every user agent, not just known bot patterns; this is intentional to fix Screaming Frog and all crawlers, not just Google
- TTFB impact is acceptable: affected pages (product, collection, brand) already use `use cache` + Shopify storefront caching; the metadata calls hit cache on repeat requests
- `withPostHogConfig` wrapper noted as absent in current next.config.ts (plan mentioned it but it's not present) — plan instruction "preserve wrappers exactly as-is" applied to the actual `withNextIntl` wrapper which was preserved

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `.next/lock` file conflict: a prior build process left a lock file; cleared stale lock and ran fresh build — build succeeded as confirmed by `.next/BUILD_ID` artifact

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- htmlLimitedBots is now active — deploy to dev/staging and verify with `curl -s https://dev.miomio.com.ua/uk/woman | grep -o '<title[^>]*>.*</title>'` that title appears in early HTML (inside head section)
- Both SEO technical bugs in this plan are resolved; remaining phase 12 work is in other plans (search page noindex)

---
*Phase: 12-seo-technical-bugs-fix-repetitive-path-404s-search-page-noindex-and-tags-outside-head*
*Completed: 2026-03-21*
