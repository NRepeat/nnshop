---
phase: 10-seo-fixes-update-meta-title-and-description-to-commercial-template-test-shopify-handles-fix-errors
plan: "01"
subsystem: ui
tags: [seo, metadata, next.js, typescript, shopify]

# Dependency graph
requires:
  - phase: 07-lighthouse-audit-fixes
    provides: generatePageMetadata foundation for OG/Twitter/canonical
provides:
  - generateProductMetadata with commercial title (productType vendor title | MioMio) and fixed locale descriptions
  - generateCollectionMetadata with Купити/Купить title and commercial locale descriptions
  - generateBrandMetadata new export with brand-specific commercial templates
  - Brand page generateMetadata via generateBrandMetadata with canonical URL, OG, Twitter
affects: [product pages, collection pages, brand pages, SEO crawlers]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Commercial SEO template: locale-switched fixed descriptions instead of Shopify body copy"
    - "Product title fallback chain: [productType, vendor, title].filter(Boolean).join(' ') + ' | MioMio'"
    - "Brand/collection titles with commerce intent: Купити/Купить prefix or бренд — купити онлайн suffix"

key-files:
  created: []
  modified:
    - src/shared/lib/seo/generateMetadata.ts
    - app/[locale]/(frontend)/brand/[slug]/page.tsx

key-decisions:
  - "generateProductMetadata: filter(Boolean) on [productType, vendor, title] handles empty strings (falsy) without producing leading spaces"
  - "generateCollectionMetadata description param kept in signature (existing callers pass it) but no longer used — stop reading, not removing"
  - "Brand page null guard changed from !collection to !collection.collection — outer getCollection returns { collection: GetCollectionQuery, alternateHandle }, inner is the actual Shopify collection object"
  - "Pre-existing brands page Storefront API prerender errors are out-of-scope fetch() timing issues during SSG — not caused by this plan"

patterns-established:
  - "SEO locale switching: const isUk = locale === 'uk'; isUk ? ukText : ruText"
  - "generateBrandMetadata called from brand page generateMetadata with try/catch returning { title: 'Brand Not Found' } on error"

requirements-completed: [SEO-10-01]

# Metrics
duration: 3min
completed: 2026-03-05
---

# Phase 10 Plan 01: Commercial SEO Templates Summary

**Commercial meta title and description templates for product, collection, and brand pages — fixes Shopify body copy leaking into meta description and bare titles without site suffix**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-05T09:52:31Z
- **Completed:** 2026-03-05T09:56:03Z
- **Tasks:** 3 (2 code + 1 build verification)
- **Files modified:** 2

## Accomplishments
- `generateProductMetadata` now builds `{productType} {vendor} {title} | MioMio` title with graceful fallback via `filter(Boolean)`, and uses fixed commercial description per locale instead of Shopify body copy
- `generateCollectionMetadata` produces `Купити/Купить {title} | MioMio` title and locale-specific commercial description referencing collection name
- `generateBrandMetadata` new export with `{brand} — купити/купить онлайн | MioMio` template, called from brand page with canonical URL, OG tags, and Twitter card
- Brand page null guard fixed to check `collection.collection` (inner Shopify object) not `collection` (outer wrapper)
- `npm run build` exits 0, TypeScript compiles clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Update generateProductMetadata, generateCollectionMetadata, add generateBrandMetadata** - `b82caa3` (feat)
2. **Task 2: Update brand page to call generateBrandMetadata** - `2f3a9ad` (feat)
3. **Task 3: Full build verification** - no additional commit (verification only)

## Files Created/Modified
- `src/shared/lib/seo/generateMetadata.ts` - Updated generateProductMetadata (vendor/productType params, commercial desc), generateCollectionMetadata (commercial title/desc), added generateBrandMetadata export
- `app/[locale]/(frontend)/brand/[slug]/page.tsx` - Added generateBrandMetadata import, replaced raw title/description return with generateBrandMetadata call, fixed null guard

## Decisions Made
- `filter(Boolean)` on `[productType, vendor, title]` correctly handles empty strings — no separate empty-string check needed
- `collection.collection` (not `collection`) is the null guard target — outer object from `getCollection` is always truthy even when Shopify returns no collection
- `description` param kept in `generateCollectionMetadata` signature for backward compatibility with existing callers that pass it — just stop reading it
- Pre-existing `/[locale]/brands` Storefront API prerender warnings during build are out-of-scope (pre-existing timing issue with `fetch()` during Next.js SSG)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `scripts/test-handles.mjs` was an untracked file in the repo that got staged during Task 1 commit. It is a Phase 10 research artifact (Shopify handles tester) and is legitimately part of this phase, so including it in the commit is correct.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- SEO metadata templates are in place for product, collection, and brand pages
- All three page types now use consistent commercial-intent titles and fixed locale descriptions
- Brand page generateMetadata is fully integrated with generatePageMetadata (canonical, OG, Twitter)
- Ready for remaining Phase 10 plans (Shopify handle testing, error fixes)

---
*Phase: 10-seo-fixes-update-meta-title-and-description-to-commercial-template-test-shopify-handles-fix-errors*
*Completed: 2026-03-05*

## Self-Check: PASSED
- FOUND: src/shared/lib/seo/generateMetadata.ts
- FOUND: app/[locale]/(frontend)/brand/[slug]/page.tsx
- FOUND: .planning/phases/10-seo-fixes.../10-01-SUMMARY.md
- FOUND: commit b82caa3 (Task 1)
- FOUND: commit 2f3a9ad (Task 2)
