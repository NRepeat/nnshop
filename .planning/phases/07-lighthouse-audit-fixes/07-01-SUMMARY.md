---
plan: 07-01
phase: 07-lighthouse-audit-fixes
status: complete
commit: b1df36e
---

# Plan 07-01 Summary: SEO & Gallery Fixes

## What Was Built

Fixed two files to address SEO and render quality issues caught by Lighthouse:

1. **`src/shared/lib/seo/generateMetadata.ts`** — Added Ukrainian fallback descriptions so product and collection pages always emit `<meta name="description">` even when Shopify description is empty. Product fallback: `{title} — купити в інтернет-магазині Mio Mio`. Collection fallback: `{title} — каталог товарів інтернет-магазину Mio Mio`.

2. **`src/features/product/ui/Gallery.tsx`** — Removed `useWindowSize` import and usage (fixes React 19 hydration error #419 caused by SSR/client mismatch). Removed stale `console.log`. Added `priority={index === 0}` to first gallery image (injects `<link rel="preload">` for LCP). Changed thumbnail `slidesToScroll` from `!md ? 3 : 5` to `'auto'` (Embla Carousel auto-adapts without window measurement).

## Tasks Completed

| Task | Status |
|------|--------|
| Task 1: Add fallback descriptions to generateMetadata | ✓ |
| Task 2: Fix Gallery.tsx — remove useWindowSize, console.log, add priority | ✓ |

## Key Files

### Created
- `.planning/phases/07-lighthouse-audit-fixes/07-01-SUMMARY.md`

### Modified
- `src/shared/lib/seo/generateMetadata.ts`
- `src/features/product/ui/Gallery.tsx`

## Self-Check: PASSED

- `grep` for `useWindowSize` and `console.log` in Gallery.tsx returns no results ✓
- `grep` for `priority={index === 0}` returns one line ✓
- `grep` for `slidesToScroll` returns `'auto'` ✓
- `grep` for Ukrainian fallbacks in generateMetadata.ts returns two lines ✓
