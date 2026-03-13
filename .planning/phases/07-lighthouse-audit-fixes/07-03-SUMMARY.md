---
phase: 07-lighthouse-audit-fixes
plan: 03
subsystem: ui
tags: [accessibility, html-structure, accordion, navigation, radix-ui, a11y]

# Dependency graph
requires:
  - phase: 07-01
    provides: SEO meta description fallbacks, Gallery hydration fix, LCP priority prop
  - phase: 07-02
    provides: aria-labels on social links, footer contrast fix
provides:
  - AccordionTrigger renders via asChild+div instead of h3 — heading sequence no longer skips h2 on product page
  - PersistLinkNavigation uses plain ul/li — no li elements without ul parent in header navigation
  - Full build verification confirmed by user after all Phase 7 changes
affects: [phase-08, any future accordion usage, any future navigation component changes]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Radix asChild pattern for overriding default HTML element rendering (AccordionPrimitive.Header asChild + div wrapper)"
    - "Plain ul/li for navigation when Radix NavigationMenu context is unavailable at call site"

key-files:
  created: []
  modified:
    - src/shared/ui/accordion.tsx
    - src/features/header/navigation/ui/PersistLinkNavigation.tsx

key-decisions:
  - "AccordionPrimitive.Header rendered via asChild+div to suppress h3 emission — affects all four AccordionTrigger usages (CollectionFilters, OrderSummary, InternalMenu, ProductInfo), all safe since none relied on h3 semantics"
  - "PersistLinkNavigation call sites (Header.tsx, HeaderContent.tsx) provide no NavigationMenu context so NavigationMenuList cannot be used — plain ul/li is the correct fix"
  - "ul wrapper given flex items-center classes to preserve layout equivalence with prior NavigationMenuItem flex behavior"

patterns-established:
  - "Radix asChild: when a Radix component emits the wrong semantic element, wrap with asChild + target element rather than fighting the default"
  - "Navigation context audit: before using NavigationMenuList/Item, verify NavigationMenu wrapper exists at call site"

requirements-completed: [A11Y-03]

# Metrics
duration: ~5min (continuation from checkpoint)
completed: 2026-02-26
---

# Phase 7 Plan 03: HTML Structure Fixes Summary

**Accordion heading rendered as div via Radix asChild pattern and navigation ul/li fix eliminate Lighthouse invalid-HTML violations (A11Y-03)**

## Performance

- **Duration:** ~5 min (resumed from checkpoint after human build verification)
- **Started:** 2026-02-26T19:XX:00Z
- **Completed:** 2026-02-26
- **Tasks:** 3 (2 auto + 1 checkpoint:human-verify)
- **Files modified:** 2

## Accomplishments

- `AccordionTrigger` in `accordion.tsx` now uses `AccordionPrimitive.Header asChild` with a `<div className="flex">` wrapper — no `<h3>` emitted; heading sequence on product page is now sequential (h1 → h2 → ...)
- `PersistLinkNavigation.tsx` replaced `NavigationMenuItem` (Radix `Primitive.li`) with plain `<li>` inside a `<ul>` wrapper — all `<li>` elements now have valid `<ul>` parents
- Human-verified: build passed with no TypeScript errors; product page loaded with no browser console errors after all Phase 7 changes

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix accordion heading — AccordionTrigger uses asChild+div instead of h3** - `c6ef97e` (fix)
2. **Task 2: Fix PersistLinkNavigation — replace NavigationMenuItem with plain ul/li** - `8b5c735` (fix)
3. **Task 3: Human verify — build passes and product page loads cleanly** - checkpoint approved (no additional commit)

## Files Created/Modified

- `src/shared/ui/accordion.tsx` - AccordionTrigger updated: `AccordionPrimitive.Header` gains `asChild` prop, `<div className="flex">` wraps the trigger instead of h3
- `src/features/header/navigation/ui/PersistLinkNavigation.tsx` - Fragment + NavigationMenuItem replaced with `<ul className="flex items-center">` + `<li>` children; NavigationMenuItem import removed

## Decisions Made

- `AccordionPrimitive.Header asChild` with `<div>` wrapper chosen over alternatives (custom heading prop, CSS override) — cleanest Radix-idiomatic approach, zero behavior change for all four accordion usages across the codebase
- Plain `<ul>`/`<li>` chosen over `NavigationMenuList`/`NavigationMenuItem` because neither Header.tsx nor HeaderContent.tsx provide `NavigationMenu` context at their call sites — using NavigationMenuList without NavigationMenu would itself be invalid
- `ul` gets `flex items-center` to maintain the same horizontal layout previously provided by `NavigationMenuItem`'s implicit flex behavior

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All three Phase 7 Lighthouse audit fix plans are complete (07-01, 07-02, 07-03)
- Phase 7 requirements SEO-01, A11Y-01, A11Y-02, A11Y-03, QUAL-01, QUAL-02 all satisfied
- Product page: meta description present, first image preloaded, heading sequence valid, no hydration errors, accessible social links, sufficient contrast
- Ready for any subsequent phases (Phase 3, 4, 5 remaining plans)

## Self-Check: PASSED

- FOUND: .planning/phases/07-lighthouse-audit-fixes/07-03-SUMMARY.md
- FOUND: commit c6ef97e (Task 1 — accordion fix)
- FOUND: commit 8b5c735 (Task 2 — navigation ul/li fix)

---
*Phase: 07-lighthouse-audit-fixes*
*Completed: 2026-02-26*
