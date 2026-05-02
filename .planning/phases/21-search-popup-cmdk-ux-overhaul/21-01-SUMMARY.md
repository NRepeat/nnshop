---
phase: 21-search-popup-cmdk-ux-overhaul
plan: 01
subsystem: search
tags: [search, cmdk, ux, command-palette, localStorage, i18n]
dependency-graph:
  requires:
    - "@shared/ui/dialog (Radix Dialog)"
    - usePredictiveSearch hook
    - "@shared/i18n/navigation (locale-aware router)"
  provides:
    - SearchCommandDialog (cmdk-based popup)
    - SearchCommandRow (compact product row)
    - useRecentSearches (localStorage-backed hook)
    - Cmd+K / Ctrl+K global shortcut
  affects:
    - SearchTrigger (rewired to new dialog)
    - Header consumers (transparent — still use SearchTrigger)
tech-stack:
  added:
    - "cmdk@^1.1.1"
  patterns:
    - "shadcn CommandDialog with shouldFilter forwarding (extended wrapper)"
    - "localStorage hook with SSR-safe useEffect read"
    - "Server-side predictive search; client renders sectioned results without cmdk filter"
key-files:
  created:
    - src/shared/ui/command.tsx
    - src/features/search/model/use-recent-searches.ts
    - src/features/search/ui/SearchCommandDialog.tsx
    - src/features/search/ui/SearchCommandRow.tsx
    - .planning/phases/21-search-popup-cmdk-ux-overhaul/21-01-SUMMARY.md
  modified:
    - src/features/search/ui/SearchTrigger.tsx
    - src/features/search/index.ts
    - messages/uk.json
    - messages/ru.json
    - messages/en.json
    - package.json
    - package-lock.json
  deleted:
    - src/features/search/ui/SearchDialog.tsx
decisions:
  - "Extended shadcn CommandDialog to forward shouldFilter/filter/loop props (R-05 mitigated without Dialog+Command fallback)"
  - "Re-exported Command.Loading as CommandLoading from command.tsx (shadcn template omits it)"
  - "Recents prefixed CommandItem values (recent-X, brand-X) to avoid collisions with other groups"
  - "Vendor field already present in PREDICTIVE_SEARCH_QUERY (R-07 resolved without GraphQL changes)"
metrics:
  duration_min: 8
  completed: 2026-05-02
---

# Phase 21 Plan 01: Search popup — cmdk UX overhaul Summary

cmdk-based SearchCommandDialog replaces legacy framer-motion SearchDialog with sectioned Recent / Brands / Products results, Cmd+K shortcut, localStorage-backed recents (max 5), and inline loading spinner.

## What changed

- **shadcn `command.tsx` installed** with cmdk@^1.1.1. Extended the shadcn template so `CommandDialog` forwards `shouldFilter` / `filter` / `loop` (and a `commandProps` escape hatch) to the inner `Command`. Also re-exported `CommandPrimitive.Loading` as `CommandLoading`.
- **`useRecentSearches` hook** at `src/features/search/model/use-recent-searches.ts`. Storage key `nnshop:search:recent`, max 5, case-insensitive dedupe with FIFO eviction. SSR-safe (`useEffect` populates after mount). Quota / private-mode errors swallowed.
- **`SearchCommandRow`** renders compact `CommandItem` (40px thumb + truncated title + price with sale strikethrough). Uses the same discount metafield logic as `ProductCardSPP` (`custom.znizka`).
- **`SearchCommandDialog`** wraps `CommandDialog shouldFilter={false}`. Sections rendered in order: Recent (when input empty) → Brands (≤5 unique vendors when query non-empty) → Products (with `{count} results` count in heading + view-all row) → Empty. Inline `Loader2` spinner positioned right of `CommandInput` while loading or debouncing.
- **`SearchTrigger`** now binds a global `keydown` listener for `Cmd+K` / `Ctrl+K` (toggles open, `preventDefault`'d). Mounts `SearchCommandDialog`.
- **Feature barrel** drops `SearchDialog` export, adds `SearchCommandDialog` export. Old file deleted.
- **Translations** added to `Search` namespace in `uk.json` / `ru.json` / `en.json`: `recentSearches`, `clearRecent`, `noRecentSearches`, `brands`, `products`, `viewAllResults`, `cmdK`.

## R-05 outcome (`shouldFilter` forwarding)

shadcn's stock `CommandDialog` did NOT forward `shouldFilter`. Resolved by extending the wrapper (cleaner than the Dialog+Command fallback documented in the plan). No external API change required — consumers pass `shouldFilter={false}` directly to `CommandDialog`.

## R-07 outcome (vendor field)

`vendor` was already part of `PREDICTIVE_SEARCH_QUERY` in `src/features/search/lib/queries.ts`. Brands section will render whenever the API returns products with vendor populated. No GraphQL change needed.

## UX deltas vs old SearchDialog

- No more slide-from-header animation (`top-[120px]` overlay). Now uses standard centered Radix Dialog (consistent with other shadcn dialogs in the app).
- No more "Pошук" submit button — Enter on a row navigates directly; "View all results" item replaces the corner Link.
- Compact list rows replace `ProductCardSPP` grid (per A-05 — necessary for cmdk arrow-nav: each option is one focusable item, no nested interactives).
- Result count now lives in the group heading instead of a separate row.

## Recent searches contract (for future cross-device sync)

- localStorage key: `nnshop:search:recent`
- Value: `JSON.stringify(string[])`
- Max length: 5 (oldest evicted)
- Dedupe: case-insensitive on `toLowerCase()`
- Trigger: `addRecent(q)` called on product / brand / view-all selection (NOT on typing)
- Empty / whitespace queries ignored
- Read is `useEffect`-deferred (initial render `[]`) — safe across SSR

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] shadcn CommandDialog did not forward shouldFilter**
- Found during: Task 0 review of generated `command.tsx`
- Issue: stock template's `CommandDialog` typed as `React.ComponentProps<typeof Dialog>` — extra props would land on Radix Dialog, not Command.
- Fix: Extended `CommandDialog` to pull `shouldFilter`, `filter`, `loop`, `commandProps` and forward them to inner `Command`. Also exported `CommandLoading` (Command.Loading wrapper).
- Files modified: `src/shared/ui/command.tsx`
- Commit: 730915fd

### Skipped tasks

- **Task 8 (human-verify)** — skipped per user instruction (autonomous mode, no interactive checkpoints).

## Self-Check: PASSED

Verified files exist:
- src/shared/ui/command.tsx
- src/features/search/model/use-recent-searches.ts
- src/features/search/ui/SearchCommandDialog.tsx
- src/features/search/ui/SearchCommandRow.tsx

Verified file deleted: src/features/search/ui/SearchDialog.tsx (gone)
Verified `npx tsc --noEmit` exits 0.
Verified all 7 task commits present in `git log`.
