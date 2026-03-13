---
phase: quick
plan: 3
subsystem: sanity-cms
tags: [sanity, pagebuilder, schema, groq, reusable-content]
dependency_graph:
  requires: []
  provides: [sharedSection-document-type, sharedSectionRef-block, typegen]
  affects: [pageBuilderType, HOME_PAGE_QUERY, HeroPageBuilder]
tech_stack:
  added: []
  patterns: [reusable-section-reference, recursive-block-rendering]
key_files:
  created:
    - src/shared/sanity/schemaTypes/sharedSectionType.ts
    - src/shared/sanity/schemaTypes/blocks/sharedSectionRefType.ts
  modified:
    - src/shared/sanity/schemaTypes/index.ts
    - src/shared/sanity/schemaTypes/pageBuilderType.ts
    - src/shared/sanity/lib/query.ts
    - src/features/home/ui/HeroPageBuilder.tsx
    - src/shared/sanity/types.ts
    - src/shared/sanity/extract.json
decisions:
  - sharedSectionRef wraps reference as object type so _type in stored array data is 'sharedSectionRef' (not 'reference')
  - sharedSection content array excludes sharedSectionRef to prevent infinite nesting
  - renderBlock extracted outside async HeroPageBuilder component for synchronous recursive calls
  - Unused SimilarProductsBlock type removed from HeroPageBuilder during refactor (pre-existing lint issue fixed inline)
metrics:
  duration: ~6 min
  completed_date: "2026-03-02"
  tasks: 6
  files_changed: 8
---

# Quick Task 3: Add Reusable Shared Section Block Summary

**One-liner:** Sanity sharedSection document type + sharedSectionRef pageBuilder block with GROQ dereference and recursive HeroPageBuilder rendering.

## What Was Built

A reusable "Shared Section" system for Sanity Studio that allows content editors to create standalone section documents once and reference them from multiple pages. Editing the document updates it everywhere it is referenced.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create sharedSectionType document schema | ce05ceb | sharedSectionType.ts |
| 2 | Create sharedSectionRefType object schema | ce05ceb | blocks/sharedSectionRefType.ts |
| 3 | Register types in index.ts and add to pageBuilderType | ce05ceb | index.ts, pageBuilderType.ts |
| 4 | Update HOME_PAGE_QUERY GROQ projection | 2aac871 | query.ts |
| 5 | Handle sharedSectionRef in HeroPageBuilder.tsx | fbf8b33 | HeroPageBuilder.tsx |
| 6 | Run typegen to regenerate Sanity types | 608aaab | types.ts, extract.json |

## Key Implementation Details

### Schema

- `sharedSection` document type: `internalTitle` (string, required) + `content` array of all pageBuilder block types except `sharedSectionRef`
- `sharedSectionRef` object type: single `section` reference field pointing to `sharedSection`
- Both registered in schema `index.ts`; `sharedSectionRef` added first in `pageBuilderType.of` array for Studio prominence

### GROQ Query

Two projections added (one per gender home page):
```groq
_type == "sharedSectionRef" => {
  section->{
    _id,
    internalTitle,
    content[]{
      ...,
      _type == "brandGridBlock" => { barnds[]{ ..., asset->{...}, collection->{...} } }
    }
  }
}
```

### Frontend Rendering

`HeroPageBuilder.tsx` refactored: the block-switching logic extracted into a standalone `renderBlock` function (outside the async component). `case 'sharedSectionRef'` iterates `section.content` and calls `renderBlock` recursively, wrapped in a `Fragment` with a key.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused SimilarProductsBlock type**
- **Found during:** Task 5
- **Issue:** `SimilarProductsBlock` was declared in original HeroPageBuilder but never referenced (pre-existing lint error)
- **Fix:** Removed the unused type declaration during the refactor rewrite
- **Files modified:** src/features/home/ui/HeroPageBuilder.tsx
- **Commit:** fbf8b33

## Self-Check: PASSED

All created files confirmed on disk. All 4 task commits verified in git history.
