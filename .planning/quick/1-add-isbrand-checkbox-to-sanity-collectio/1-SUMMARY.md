---
phase: quick
plan: 1
subsystem: sanity-cms, collection-routing
tags: [sanity, schema, groq, redirect, brand, collection]
dependency_graph:
  requires: []
  provides: [isBrand-schema-field, COLLECTION_IS_BRAND_QUERY, brand-redirect-logic]
  affects: [CollectionGrid, Sanity Studio collection documents]
tech_stack:
  added: []
  patterns: [sanityFetch-in-server-component, next-redirect-from-server-component]
key_files:
  created: []
  modified:
    - src/shared/sanity/schemaTypes/shopify/shemas/documents/collection.tsx
    - src/shared/sanity/lib/query.ts
    - src/shared/sanity/types.ts
    - src/features/collection/ui/CollectionGrid.tsx
decisions:
  - isBrand placed after showHero in editorial group — consistent with boolean editorial fields pattern
  - redirect() called before getCollection fetches to fail fast — avoids unnecessary Shopify API calls for brand collections
  - sanityFetch tags use collection:${resolvedHandle} pattern — consistent with existing cache invalidation approach
metrics:
  duration: 3 min
  completed: 2026-03-02
---

# Phase quick Plan 1: Add isBrand Checkbox to Sanity Collection Summary

**One-liner:** isBrand boolean in Sanity collection schema with GROQ query and CollectionGrid redirect to /brand/[slug]

## What Was Built

Added an `isBrand` boolean field to the Sanity `collection` document schema, exported a typed GROQ query (`COLLECTION_IS_BRAND_QUERY`) from the shared query library, regenerated Sanity types to include the new field, and wired `CollectionGrid.tsx` to redirect brand-flagged collections to `/[locale]/brand/[slug]` transparently.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add isBrand field to Sanity collection schema | ac39181 | collection.tsx |
| 2 | Add GROQ query and wire CollectionGrid redirect | 6b3d286 | query.ts, types.ts, CollectionGrid.tsx |

## Key Changes

### collection.tsx
- Added `defineField({ name: 'isBrand', title: 'Is Brand', type: 'boolean', group: 'editorial' })` immediately after the `showHero` field
- No other changes — simple boolean field, no hidden logic needed

### query.ts
- Appended `COLLECTION_IS_BRAND_QUERY` at end of file:
  ```typescript
  export const COLLECTION_IS_BRAND_QUERY = defineQuery(
    `*[_type == "collection" && store.slug.current == $handle][0]{ isBrand }`
  );
  ```

### types.ts
- Regenerated via `npm run typegen`
- Now includes `isBrand?: boolean` on the collection document type (line 1107)
- Includes `COLLECTION_IS_BRAND_QUERYResult` type with `isBrand: boolean | null`
- Query string registered in the result type map

### CollectionGrid.tsx
- Added `redirect` to existing `next/navigation` import
- Added `sanityFetch` import from `@shared/sanity/lib/client`
- Added `COLLECTION_IS_BRAND_QUERY` import from `@shared/sanity/lib/query`
- Added brand check immediately after `resolvedHandle` is computed, before Shopify API calls:
  ```typescript
  const sanityCollection = await sanityFetch({
    query: COLLECTION_IS_BRAND_QUERY,
    params: { handle: resolvedHandle },
    tags: [`collection:${resolvedHandle}`],
  });
  if (sanityCollection?.isBrand) {
    redirect(`/${locale}/brand/${resolvedHandle}`);
  }
  ```

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- collection.tsx: FOUND with `name: 'isBrand'`
- query.ts: FOUND with `COLLECTION_IS_BRAND_QUERY` export
- types.ts: FOUND with 7 occurrences of `isBrand` including result type
- CollectionGrid.tsx: FOUND with `redirect` import and usage
- Commits: ac39181 and 6b3d286 both verified in git log
- Build: Compiled successfully, 132/132 static pages generated, no TypeScript errors
