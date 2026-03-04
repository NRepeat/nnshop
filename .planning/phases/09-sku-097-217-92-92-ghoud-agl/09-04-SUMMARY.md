---
phase: 09-sku-097-217-92-92-ghoud-agl
plan: "04"
subsystem: product
tags: [related-products, sku-matching, shopify-storefront-api, console-log-removal]
dependency_graph:
  requires: []
  provides: [getProductsBySku, sku-based-related-products]
  affects: [ProductSessionView, ProductView, getProduct]
tech_stack:
  added: []
  patterns: [use-cache-inside-function, storefront-api-sku-query, graceful-empty-sku-guard]
key_files:
  created:
    - src/entities/product/api/getProductsBySku.ts
  modified:
    - src/features/product/ui/ProductSessionView.tsx
    - src/widgets/product-view/ui/ProductView.tsx
    - src/entities/product/api/getProduct.ts
decisions:
  - "SKU filler placed between manual metafield IDs and productType filler — priority: manual > SKU matches > productType"
  - "'use cache' inside function body (not at file top) — matches getNewProductsFiller.ts pattern"
  - "SKU dedup filter applied after getProductsBySku to prevent showing products already in relatedShopiyProductsData"
  - "count+5 over-fetch in getProductsBySku allows for dedup losses without falling short of target count"
metrics:
  duration: 3 min
  completed_date: "2026-03-04"
  tasks_completed: 2
  files_modified: 4
---

# Phase 9 Plan 04: SKU-Based Related Products and console.log Removal Summary

**One-liner:** SKU-based related product matching via Shopify `sku:"VALUE"` query inserted as second-priority filler, plus console.log removal from three Phase 1 violation sites.

## What Was Built

### getProductsBySku.ts (new)
Fetches Shopify products whose variant SKU matches a given SKU string. Uses `sku:"VALUE" -id:NUMERICID` query syntax to exclude the current product. Returns empty array on blank SKU or any fetch error. Uses `'use cache'` with `cacheLife('minutes')` inside the function body following the existing `getNewProductsFiller.ts` pattern.

### ProductSessionView.tsx (modified)
Added SKU-based filler logic as the second source of related products:
1. Manual metafield IDs (highest priority)
2. SKU matches via `getProductsBySku` (new — fills gap up to 3)
3. productType new-arrivals filler (existing fallback, now runs after SKU fill)

Empty/null SKU is guarded with `.trim()` check — no fetch occurs when SKU is blank. Dedup filter applied after SKU fetch to prevent duplicates.

### ProductView.tsx (modified)
Removed `console.log(relatedProducts, 'relatedProducts')` on line 67 — Phase 1 violation.

### getProduct.ts (modified)
Removed `console.log(product)` on line 146 — Phase 1 violation identified in RESEARCH.md Pitfall 5.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | c9426a4 | feat(09-04): create getProductsBySku API |
| Task 2 | 9dab124 | feat(09-04): integrate SKU filler and remove console.logs |

## Decisions Made

- **Priority order:** Manual metafield IDs > SKU matches > productType filler. SKU matching fills the gap between manual IDs and the 3-product minimum before falling back to generic type-based filler.
- **`'use cache'` placement:** Inside the function body (not at file top), consistent with `getNewProductsFiller.ts` pattern. No `'use server'` needed since this is called from a Server Component.
- **Dedup logic:** Filter applied after `getProductsBySku` returns — ensures products already in `relatedShopiyProductsData` from manual metafield IDs are not re-added.
- **Over-fetch buffer:** `count + 5` sent to Shopify to absorb dedup losses without falling short of target count.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- FOUND: src/entities/product/api/getProductsBySku.ts
- FOUND: commit c9426a4 (feat(09-04): create getProductsBySku API)
- FOUND: commit 9dab124 (feat(09-04): integrate SKU filler and remove console.logs)
- No console.log in any of the four target files
- No TypeScript errors (tsc --noEmit clean)
- getProductsBySku appears twice in ProductSessionView.tsx (import + call)
