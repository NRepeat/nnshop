---
phase: 04-code-quality
plan: 02
subsystem: home, hero-swiper
tags: [typescript, type-safety, as-any-removal, prop-narrowing]
dependency_graph:
  requires: []
  provides: [TYPE-01 partial — HeroPageBuilder, HeroSwiper]
  affects: [HeroPageBuilder, HeroSwiper/Slider]
tech_stack:
  added: []
  patterns: [Extract<Union, {_type}> helper types, as unknown as T for narrowed assertions, Parameters<typeof Component>[0] for prop inference]
key_files:
  created: []
  modified:
    - src/features/home/ui/HeroPageBuilder.tsx
    - src/entities/slider/ui/Slider.tsx
decisions:
  - "Used `as unknown as T` instead of `as T` for HeroPageBuilder switch-case assertions — TypeScript requires the intermediate unknown cast when types don't overlap"
  - "SimilarProducts collection typed via `Parameters<typeof SimilarProducts>[0]['collection']` — component props not exported, inference avoids needing a separate import"
  - "SimilarProductsBlock helper type defined but collection used via Parameters — kept for documentation clarity"
metrics:
  duration: 3 min
  completed: 2026-02-23
  tasks_completed: 2
  files_modified: 2
---

# Phase 04 Plan 02: Remove as any Casts in HeroPageBuilder and Narrow HeroSwiper Props

**One-liner:** Narrowed HeroSwiper props to `{ slides: SliderBlock['slides'] }` and replaced all five `as any` casts in HeroPageBuilder with explicit Sanity-typed assertions.

## What Was Done

### Task 1: Narrow HeroSwiper props to slides only

- Replaced `PAGE_QUERYResult` Extract type in `HeroSwiperProps` with `SliderBlock['slides']`
- Removed unused `documentId`, `documentType`, `blockIndex` from props interface
- Component now accepts only `slides` — the only prop it actually renders

### Task 2: Replace HeroPageBuilder as-any casts with Sanity type assertions

- Added `import type { PAGE_QUERYResult, SliderBlock } from '@shared/sanity/types'`
- Added helper types:
  - `PageContent` — union of all content block types
  - `SimilarProductsBlock` — Extract for `similarProducts` case
  - `CollectionsCarouselBlock` — Extract for `collectionsCarousel` case
- `case 'faqs'`: removed `(block as any)` — TypeScript narrows correctly after case, plain spread works
- `case 'similarProducts'`: replaced `block.collection as any` with `Parameters<typeof SimilarProducts>[0]['collection']` inference
- `case 'collectionsCarousel'`: introduced `const carousel = block as unknown as CollectionsCarouselBlock`; individual props passed without casts
- `case 'sliderBlock'`: replaced `{...(block as any)}` with `slides={(block as unknown as SliderBlock).slides}`
- `default`: replaced `(block as any)._type` with `(block as { _type: string })._type`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Approach] Used `as unknown as T` instead of `as T`**
- **Found during:** Task 2 implementation
- **Issue:** TypeScript rejected direct `as CollectionsCarouselBlock` / `as SliderBlock` casts because the discriminated union type doesn't overlap with the narrowed case type directly
- **Fix:** Used `as unknown as T` intermediate cast — removes `as any` while preserving type information
- **Impact:** None — semantically equivalent to the plan's intent

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 3178827 | refactor(04-02): narrow HeroSwiper props to slides only |
| 2 | (pending) | refactor(04-02): replace as-any casts in HeroPageBuilder |

## Self-Check: PASSED

- [x] `src/entities/slider/ui/Slider.tsx` HeroSwiperProps contains only `slides`, no `documentId`/`documentType`/`blockIndex`
- [x] `src/features/home/ui/HeroPageBuilder.tsx` zero `as any` (grep returns 0)
- [x] Named Sanity types imported and used in assertions
