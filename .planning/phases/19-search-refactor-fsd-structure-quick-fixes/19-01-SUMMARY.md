---
phase: 19-search-refactor-fsd-structure-quick-fixes
plan: 01
subsystem: search
tags: [fsd, search, refactor, graphql, ui-consistency, mobile-responsive]
dependency-graph:
  requires:
    - "@shared/lib/shopify/client (storefrontClient)"
    - "@shared/lib/shopify/types/storefront.generated"
    - "@shared/lib/shopify/types/storefront.types"
    - "@shared/lib/clients/types (StorefrontLanguageCode)"
    - "@shared/i18n/navigation (Link, useRouter)"
    - "@shared/ui/{button,empty,skeleton}"
    - "@entities/product/ui/ProductCardSPP"
  provides:
    - "@features/search (FSD module): SearchTrigger, SearchDialog, SearchResultsGrid, SearchSkeleton, SearchEmpty, predictiveSearch"
    - "Single PREDICTIVE_SEARCH_QUERY GraphQL doc + DEFAULT_PREDICTIVE_LIMIT + SEARCHABLE_FIELDS constants"
  affects:
    - "Header widget (HeaderContent, HeaderOptions) — now imports SearchTrigger"
    - "/search page (uses unified primitives + helper)"
    - "/api/predictive-search route (thin wrapper)"
tech-stack:
  added: []
  patterns:
    - "FSD feature module with lib/api/model/ui segments + barrel index.ts"
    - "Hook extraction (usePredictiveSearch) — debounce + AbortController"
    - "Mobile-responsive popup header (hidden sm:inline-flex on text submit, shrink-0 on icons, min-w-0 on flex input)"
key-files:
  created:
    - src/features/search/lib/queries.ts
    - src/features/search/api/predictive-search.ts
    - src/features/search/model/use-predictive-search.ts
    - src/features/search/ui/SearchTrigger.tsx
    - src/features/search/ui/SearchDialog.tsx
    - src/features/search/ui/SearchResultsGrid.tsx
    - src/features/search/ui/SearchSkeleton.tsx
    - src/features/search/ui/SearchEmpty.tsx
    - src/features/search/index.ts
  modified:
    - app/api/predictive-search/route.ts
    - app/[locale]/(frontend)/search/page.tsx
    - src/features/header/ui/HeaderContent.tsx
    - src/features/header/ui/HeaderOptions.tsx
  deleted:
    - src/features/header/search/ui/search-client.tsx
    - src/features/header/search/ui/search-session.tsx
decisions:
  - "ProductCardSPP wraps internally with Link (default link=true). To avoid nested <a>, SearchResultsGrid uses a plain <div> wrapper with onClick (popup close) and lets SPP's internal Link handle navigation. No double-wrap."
  - "Both popup and page use grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 (page's denser breakpoint set adopted as unified default)."
  - "/search page now passes locale to predictiveSearch — RU users on /ru/search will get RU-localized results (previously implicitly UK). Behavior change is desirable (matches popup)."
  - "search-session.tsx was wrapping search-client.tsx and was the actual consumer in HeaderContent/HeaderOptions. Both deleted; consumers now import SearchTrigger directly from @features/search."
metrics:
  duration: "~3 minutes"
  completed: "2026-05-02T11:40:14Z"
  tasks: 3
  commits: 3
  files-created: 9
  files-modified: 4
  files-deleted: 2
  net-line-change: "+494 / -542 (net -48 lines)"
---

# Phase 19 Plan 01: Search Refactor — FSD Structure + Quick Fixes Summary

Restructured all search code into `src/features/search/` (FSD layout), unifying GraphQL query + fetch helper + UI primitives between the header popup and `/search` page; popup discount price now renders correctly via `ProductCardSPP` (fixing `metafields` plural bug), and the popup header is mobile-responsive (text submit hidden < 640px).

## Outcome

- **Single source of truth** for `PREDICTIVE_SEARCH_QUERY` (only in `src/features/search/lib/queries.ts`); previously duplicated across `route.ts` and `page.tsx` (~190 lines combined).
- **Discount fix:** popup grid switched from `ProductCard` (reads `product.metafield` singular — broken for predictive results) to `ProductCardSPP` (handles both `metafields[]` and singular `metafield`).
- **Layout consistency:** popup and page now share `SearchResultsGrid` with identical breakpoints (`grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`).
- **Mobile header fix:** popup header row no longer overflows on viewports < 640px. Text "Search" button hidden via `hidden sm:inline-flex`; X close icon + input remain visible. `Enter` still submits.
- **GraphQL unification:** API route is now a 20-line thin wrapper; `/search` page is ~140 lines smaller. Net code reduction.

## Risk resolutions

- **R-01 (Header consumer location):** `<SearchSession>` (wrapper for `<SearchClient>`) was rendered in `src/features/header/ui/HeaderContent.tsx` (mobile) and `src/features/header/ui/HeaderOptions.tsx` (desktop). Both updated to import `SearchTrigger` from `@features/search`. Same `className` prop signature preserved.
- **R-02 (ProductCardSPP Link wrapping):** Confirmed SPP wraps internally via `link` prop (default `true`). `SearchResultsGrid` does NOT add an outer `<Link>`; uses a plain `<div>` with `onClick={onProductClick}` to close the popup while SPP's internal Links handle navigation. No nested-anchor warning risk.
- **R-03 (Missing GraphQL fields):** Verified `ProductCardSPP` reads only `featuredImage`, `priceRange.maxVariantPrice`, `metafields[znizka]`, `handle`, `title`. All present in unified query. No fields added beyond the existing route version (which was already complete).
- **R-04 (Server vs client `useTranslations`):** `SearchEmpty` marked `'use client'`. Page (server component) renders it without issue.
- **R-05 (search-session.tsx deletion):** File was the live consumer for both desktop+mobile. Migrated callers, deleted along with `search-client.tsx`. Empty `src/features/header/search/` directory tree removed.
- **R-06 (Discount metafield namespace):** Confirmed `ProductCardSPP` looks up `DISCOUNT_METAFIELD_KEY` (= `'znizka'`), matching the GraphQL query identifier `{ key: "znizka", namespace: "custom" }`.
- **R-07 (Locale passing in /search page):** Page now passes `locale` to `predictiveSearch`. Documented as deliberate behavior change (popup parity). Cross-repo invariant in CLAUDE.md notes feed/storefront alignment, but predictive search results are user-facing only — no Google Merchant impact.

## Deviations from Plan

### Auto-fixed Issues

None substantive. The plan was followed exactly. Two minor structural choices recorded as decisions:

1. **SearchResultsGrid uses `<div>` not `<Link>` outer wrapper.** Plan suggested `<Link>` outer, but R-02 mitigation explicitly allowed dropping it. ProductCardSPP already wraps internally; outer `<div onClick>` provides the popup-close behavior without nesting `<a>`.
2. **SearchPageSkeleton kept as a small wrapper around `<SearchSkeleton />`** (with title placeholder), per plan's "OR" clause.

## Auth Gates

None.

## Verification Results

| Check | Result |
| --- | --- |
| `npx tsc --noEmit -p tsconfig.json` exits 0 | PASS (clean across all 3 task boundaries) |
| `PREDICTIVE_SEARCH_QUERY` string literal in exactly 1 file | PASS — only `src/features/search/lib/queries.ts` |
| `predictiveSearch` helper used by both route + page | PASS |
| Old `@features/header/search` imports gone | PASS — zero matches via grep |
| Legacy `search-client.tsx` / `search-session.tsx` deleted | PASS |
| `SearchClient` / `SearchSession` references gone | PASS — zero matches |
| Header consumers import `SearchTrigger` from `@features/search` | PASS (HeaderContent + HeaderOptions) |
| Manual smoke (popup discount visible, mobile header OK, /search renders) | NOT EXECUTED — autonomous mode; user to verify in dev |

## Manual Smoke Checklist (deferred to user)

The plan prescribes manual visual verification with `pnpm dev`. Static + type-level invariants all pass; the user should confirm in dev:

1. Popup shows znizka sale price + strikethrough on a known discounted product (parity with /search page).
2. At viewport 320–639px, popup header has only `[icon][input][X]`; no overflow.
3. At viewport ≥640px, popup header also has the "Search" text button.
4. Enter key in the popup input still navigates to `/search?q=...` at all widths.
5. `/uk/search?q=test` and `/ru/search?q=test` both render result grids.
6. Click outside, Esc, X all close the popup; body scroll lock works.

## Commits

| Task | Hash       | Message |
| ---- | ---------- | ------- |
| 1    | `623722eb` | refactor(19-01): scaffold search feature module (queries, api helper, hook) |
| 2    | `4e32bae1` | refactor(19-01): add search UI primitives (Trigger, Dialog, Grid, Skeleton, Empty) |
| 3    | `dead03b1` | refactor(19-01): wire search consumers to new FSD module, delete legacy popup |

## Out of Scope (deferred)

- Phase B: cmdk lib, keyboard nav between results, command-palette UX.
- Phase C: filters (vendor/price/tags), pagination, sorting on `/search`.
- No tests added (acknowledged debt).

## Self-Check: PASSED

- File created `src/features/search/lib/queries.ts` — FOUND
- File created `src/features/search/api/predictive-search.ts` — FOUND
- File created `src/features/search/model/use-predictive-search.ts` — FOUND
- File created `src/features/search/ui/SearchTrigger.tsx` — FOUND
- File created `src/features/search/ui/SearchDialog.tsx` — FOUND
- File created `src/features/search/ui/SearchResultsGrid.tsx` — FOUND
- File created `src/features/search/ui/SearchSkeleton.tsx` — FOUND
- File created `src/features/search/ui/SearchEmpty.tsx` — FOUND
- File created `src/features/search/index.ts` — FOUND
- File deleted `src/features/header/search/ui/search-client.tsx` — DELETED (verified absent)
- File deleted `src/features/header/search/ui/search-session.tsx` — DELETED (verified absent)
- Commits 623722eb, 4e32bae1, dead03b1 — all FOUND in git log
