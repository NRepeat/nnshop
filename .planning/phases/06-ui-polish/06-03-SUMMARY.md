---
phase: 06-ui-polish
plan: 03
subsystem: ui
tags: [language-switcher, tailwind, build-audit, favicon, currency, footer, cms]

# Dependency graph
requires:
  - phase: 06-ui-polish
    plan: "06-01"
    provides: favicon (app/icon.svg), getCurrencySymbol utility, 11 price files updated
  - phase: 06-ui-polish
    plan: "06-02"
    provides: CMS-driven footer with FOOTER_QUERY and sanityFetch
provides:
  - Clean LanguageSwitcher trigger button (h-full only, no dead border classes)
  - Phase 6 build audit confirmed — npm run build exits 0 with zero TS errors
  - All UI-01 through UI-04 requirements verified as satisfied
affects: [any component reusing LanguageSwitcher pattern, future Phase 6 verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Minimal className principle: rely on shadcn/ui variant styles; only add classes that change measurable behavior"

key-files:
  created: []
  modified:
    - src/features/header/language-switcher/ui/LanguageSwitcher.tsx

key-decisions:
  - "LanguageSwitcher trigger button className reduced to 'h-full' — variant='default' provides all visual styles; border-b-2 border-foreground on bg-foreground background is invisible and was dead code"
  - "app/icon.svg accepted as favicon artifact instead of app/icon.tsx — commit da4dde4 replaced ImageResponse with real brand SVG after 06-01; both fulfill UI-01"
  - "getSymbolFromCurrency only appears inside getCurrencySymbol.ts as an internal import — zero legacy calls in business code, currency audit passes"

patterns-established:
  - "Shadcn/ui variant-first: do not add Tailwind classes that duplicate or invisibly override what the variant already provides"

requirements-completed: [UI-01, UI-02, UI-03, UI-04]

# Metrics
duration: 4min
completed: 2026-02-26
---

# Phase 6 Plan 03: Language Switcher Cleanup and Phase 6 Build Audit Summary

**Invisible border-b-2 dead classes removed from LanguageSwitcher trigger; full npm run build passes with zero TypeScript errors confirming all Phase 6 UI changes are production-ready**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-26T13:45:52Z
- **Completed:** 2026-02-26T13:50:00Z
- **Tasks:** 2 of 3 (Task 3 is a checkpoint:human-verify awaiting user confirmation)
- **Files modified:** 1 code file (LanguageSwitcher.tsx)

## Accomplishments
- Removed invisible `border-b-2 border-foreground hover:border-b-2 hover:border-b-foreground transition-colors` from LanguageSwitcher trigger — these classes rendered a border the same color as `bg-foreground`, creating a zero-contrast invisible border with no hover change
- `npm run build` (Turbopack) completed in ~9.3s compile + 4.4s static generation — 101 pages, zero TypeScript errors
- Phase 6 five-point audit passed: favicon exists, no legacy getSymbolFromCurrency in business code, FOOTER_QUERY and sanityFetch in Footer.tsx, no border-b-2 in LanguageSwitcher
- All requirements UI-01 through UI-04 verified as satisfied

## Task Commits

Each task was committed atomically:

1. **Task 1: Clean language switcher button styling** - `94f6c31` (fix)
2. **Task 2: Full build and Phase 6 audit** - `cd857cc` (chore)
3. **Task 3: Human verify — Phase 6 UI changes work correctly** — CHECKPOINT PENDING (awaiting user confirmation)

## Files Created/Modified
- `src/features/header/language-switcher/ui/LanguageSwitcher.tsx` - Trigger button className reduced from multi-class redundant string to `"h-full"`; all visual styling delegated to `variant="default"`

## Decisions Made
- `border-b-2 border-foreground` on a `bg-foreground` button background is zero-contrast — invisible. The hover variant added `hover:border-b-2 hover:border-b-foreground` which is the same state. Both removed; `variant="default"` provides all needed styles.
- `app/icon.svg` (brand SVG from commit `da4dde4`) accepted as the favicon artifact — `app/icon.tsx` (ImageResponse from 06-01) was later superseded; both fulfill UI-01.
- Currency audit: `getSymbolFromCurrency` call inside `getCurrencySymbol.ts` is the intended internal delegation — not a legacy call. All 11 business files correctly use `getCurrencySymbol`.

## Deviations from Plan

**1. [Plan Artifact] favicon check: app/icon.svg instead of app/icon.tsx**
- **Found during:** Task 2 (Phase 6 audit)
- **Issue:** Plan spec expected `app/icon.tsx` (ImageResponse). Actual file is `app/icon.svg` — a real brand SVG that replaced icon.tsx in commit `da4dde4` after 06-01 ran.
- **Fix:** No fix needed — the favicon requirement (UI-01) is fulfilled by the SVG, which is a better solution. Build route table confirms `○ /icon.svg` static generation works.
- **Impact:** Requirement satisfied with a better artifact. No code change required.

---

**Total deviations:** 1 observed, 0 requiring code change
**Impact on plan:** Favicon replaced with actual brand SVG — superior outcome. All audit checks pass.

## Issues Encountered
- `app/icon.tsx` from 06-01 was replaced by `app/icon.svg` between plans — discovered during audit. Not a problem; brand SVG is the better favicon implementation.

## User Setup Required
None — no external service configuration required. All Phase 6 changes are code-only.

## Next Phase Readiness
- Phase 6 all three code plans (01-03) are complete pending Task 3 human verification
- After user confirms ("approved"), all Phase 6 requirements UI-01 through UI-04 are fulfilled
- Project is at production-ready UI state for v1.0 milestone

## Self-Check: PASSED

- src/features/header/language-switcher/ui/LanguageSwitcher.tsx: FOUND (className="h-full" confirmed)
- app/icon.svg: FOUND (favicon present, brand SVG format)
- src/shared/lib/utils/getCurrencySymbol.ts: FOUND
- src/widgets/footer/ui/Footer.tsx: FOUND (FOOTER_QUERY + sanityFetch confirmed)
- Commit 94f6c31 (fix: language switcher className): FOUND
- Commit cd857cc (chore: audit): FOUND

---
*Phase: 06-ui-polish*
*Completed: 2026-02-26*
