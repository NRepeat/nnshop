---
phase: 20-search-page-filters-pagination-and-sort
plan: 01
subsystem: ui
tags: [search, shopify-storefront, graphql, filters, pagination, nuqs, next-intl]

requires:
  - phase: 19-search-refactor-fsd-structure-quick-fixes
    provides: FSD search feature module (predictiveSearch popup, queries, ui shells)
provides:
  - Full-featured /search results page driven by Shopify Storefront root `search` query
  - SEARCH_QUERY GraphQL doc with productFilters + sortKey + reverse + after, types: PRODUCT, prefix: LAST, unavailableProducts: HIDE
  - searchProducts() server helper translating URL params -> ProductFilter[] (two-call pattern w/ skip-when-no-filters optimization)
  - SearchPageContent server component reusing FilterSheet/SortSelect/ActiveFiltersCarousel
  - SearchPageGridWrapper client wrapper (slimmer than ClientGridWrapper - no client-side post-filtering)
  - Search.totalResults plural i18n key in uk/ru/en
affects: [search, predictive-search, collection-grid, filter-sheet, load-more]

tech-stack:
  added: []
  patterns:
    - "Search results reuse collection feature primitives (FilterSheet/SortSelect/ActiveFiltersCarousel/ClientGrid/LoadMore) without forking"
    - "Two-call filter-defs pattern from getCollection.ts replicated in searchProducts()"
    - "URL ?limit param drives page size (collection-aligned), LoadMore bumps via nuqs shallow:false"
    - "predictiveSearch popup and search results page share queries.ts but use independent helpers"

key-files:
  created:
    - src/features/search/api/search-products.ts
    - src/features/search/ui/SearchPageContent.tsx
    - src/features/search/ui/SearchPageGridWrapper.tsx
  modified:
    - src/features/search/lib/queries.ts
    - src/features/search/index.ts
    - app/[locale]/(frontend)/search/page.tsx
    - messages/uk.json
    - messages/ru.json
    - messages/en.json

key-decisions:
  - "Page size 24 (vs 20 on collections): fills 4-col grid evenly, fewer LoadMore clicks on typical short search result sets"
  - "Sort created-desc silently maps to RELEVANCE since SearchSortKeys lacks CREATED; SortSelect not forked to hide the option"
  - "initialFilters and filters both point at the current result set's productFilters (no separate unfiltered defs call) - acceptable trade-off for /search v1"
  - "Skip filter-defs lookup when only q/sort/limit present in URL: 1 Storefront call instead of 2"
  - "Reuse LoadMore as-is via its handle prop (documented unused per LoadMore.tsx); pass query to satisfy type"
  - "No JSON-LD/Breadcrumb/PathSync/GA4 on /search since it's noindex"

patterns-established:
  - "Search results page reuses collection UI primitives: precedent for any future result-list pages (e.g. tag pages)"
  - "Two-call filter slug translation extracted directly into searchProducts (no shared helper) - keeps search self-contained"

requirements-completed:
  - SEARCH-PAGE-PARITY

duration: 12min
completed: 2026-05-02
---

# Phase 20 Plan 01: Search page - filters, sort, pagination Summary

**Full-featured /search page using Shopify Storefront root `search` query with FilterSheet/SortSelect/ActiveFiltersCarousel/LoadMore reused from collection module - reaches collection-page parity while leaving the predictive popup untouched.**

## Performance

- **Duration:** ~12 min
- **Tasks:** 2
- **Files modified:** 7 (3 created, 4 modified)

## Accomplishments
- /search no longer capped at 10 - paginated 24/click via nuqs `?limit`
- Filters (size/rozmir, color/brand/material/etc., price range) drive Storefront `productFilters` server-side
- Sort (price-asc, price-desc) maps to SearchSortKeys; created-desc gracefully degrades to RELEVANCE
- Locale routing preserved: `/uk/search`, `/ru/search` resolve correctly with localized vendor/filter labels
- robots noindex + canonical alternates preserved on /search
- Predictive popup (`SearchDialog`, `predictiveSearch`, `PREDICTIVE_SEARCH_QUERY`) byte-identical - zero touched
- Type-check `npx tsc --noEmit` passes with zero new errors

## Task Commits

1. **Task 1: Add SEARCH_QUERY GraphQL doc and searchProducts server helper** - `540eea9f` (feat)
2. **Task 2: Build SearchPageContent + SearchPageGridWrapper and wire /search route** - `60459b9f` (feat)

## Files Created/Modified
- `src/features/search/lib/queries.ts` - Appended `SEARCH_QUERY`, `DEFAULT_SEARCH_PAGE_SIZE = 24`. Predictive query untouched.
- `src/features/search/api/search-products.ts` (new) - `searchProducts({ query, locale, searchParams?, first?, after? })` server helper. Translates URL slugs to ProductFilter[] via filter-defs lookup, maps sort, runtime-narrows __typename.
- `src/features/search/ui/SearchPageContent.tsx` (new) - server component: page title + total count + filter bar (FilterSheet + SortSelect + ActiveFiltersCarousel) + grid wrapper. Empty/error/no-results branches.
- `src/features/search/ui/SearchPageGridWrapper.tsx` (new) - 'use client' wrapper: favorites fetch + ClientGrid + LoadMore + scroll-to-top button. No client-side post-filter pass.
- `src/features/search/index.ts` - Adds `searchProducts`, `SearchProductsResult`, `SearchPageContent` exports.
- `app/[locale]/(frontend)/search/page.tsx` - Thinned from inline predictive component to Suspense-wrapped `<SearchPageContent>`. Robots noindex + canonical preserved.
- `messages/uk.json`, `messages/ru.json`, `messages/en.json` - Add `Search.totalResults` plural key.

## Decisions Made
See key-decisions in frontmatter. Notable trade-offs documented in plan's `<assumptions>` were honored verbatim:
- Two-call pattern (defs + actual) for filter slug translation - mirrors `getCollection`. Optimized to single call when no filter params.
- Page size 24, increment 24, cap 250 (Storefront `first` max).
- `created-desc` sort silently maps to RELEVANCE (no SortSelect fork).
- `initialFilters` = current result's productFilters (no separate unfiltered facet call) - simpler, acceptable for v1.

## Deviations from Plan

None - plan executed exactly as written. Both `<action>` blocks copied with minimal cosmetic adjustments (skip-when-no-filters guard was already in plan as R-04 mitigation; implemented inline).

## Issues Encountered

None. Type-check passed first try after each task.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- /search reaches collection-page feature parity. Ready for end-to-end smoke test (visit `/uk/search?q=...` with filter/sort/load-more interactions).
- Follow-up candidates (out of scope this plan):
  - Hide "Newest" option on /search SortSelect (or wire `?sort=created-desc` -> reverse on RELEVANCE).
  - Add `CollectionFilterBar` (always-visible inline chips) to /search if product wants visual parity beyond the drawer.
  - Switch fetch-first-N pagination to `endCursor` cursor pagination if Storefront rate-limits become an issue (R-02).
  - Track `search_load_more` PostHog event for R-02 detection.

---
*Phase: 20-search-page-filters-pagination-and-sort*
*Completed: 2026-05-02*

## Self-Check: PASSED

All 9 declared files exist on disk. Both task commits (540eea9f, 60459b9f) present in git log.
