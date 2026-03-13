---
phase: 04-code-quality
plan: 04
subsystem: client-components
tags: [memory-leak, setTimeout, useRef, cleanup]
dependency_graph:
  requires: []
  provides: [MEM-02]
  affects:
    - src/features/novaPoshta/ui/NovaPoshtaButton.tsx
    - src/features/product/quick-buy/ui/QuickBuyModal.tsx
    - src/features/header/language-switcher/ui/LanguageSwitcher.tsx
    - src/entities/home/ui/SyncedCarousels.tsx
tech_stack:
  added: []
  patterns:
    - useRef to capture setTimeout return value
    - useEffect cleanup to clearTimeout on unmount
key_files:
  created: []
  modified:
    - src/features/novaPoshta/ui/NovaPoshtaButton.tsx
    - src/features/product/quick-buy/ui/QuickBuyModal.tsx
    - src/features/header/language-switcher/ui/LanguageSwitcher.tsx
    - src/entities/home/ui/SyncedCarousels.tsx
decisions:
  - Dedicated unmount useEffect (empty deps) used for timers set in event handlers (NovaPoshtaButton, QuickBuyModal)
  - clearTimeout added to existing useEffect return for timers already inside useEffect (LanguageSwitcher, SyncedCarousels)
metrics:
  duration: 4 min
  completed: 2026-02-23
---

# Phase 04 Plan 04: setTimeout useRef Cleanup Summary

All four components now store setTimeout IDs in useRef and clear them on unmount, preventing stale callbacks from firing after route changes or modal closes.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add setTimeout refs to NovaPoshtaButton and QuickBuyModal | 6586bd5 | NovaPoshtaButton.tsx, QuickBuyModal.tsx |
| 2 | Add setTimeout refs to LanguageSwitcher and SyncedCarousels | f07d334 | LanguageSwitcher.tsx, SyncedCarousels.tsx |

## What Was Done

Replaced four bare `setTimeout(...)` calls with the `useRef` pattern:

- **NovaPoshtaButton.tsx**: `openTimerRef` captures the 100ms open-frame timer set in the `openFrame` click handler. A dedicated `useEffect(() => () => clearTimeout, [])` clears it on unmount.
- **QuickBuyModal.tsx**: `closeTimerRef` captures the 2000ms post-success close timer set inside a `startTransition` callback. A dedicated `useEffect(() => () => clearTimeout, [])` clears it on unmount.
- **LanguageSwitcher.tsx**: `localeTimerRef` captures the 0ms locale sync timer already inside a `useEffect`. `clearTimeout` added to the same `useEffect` return.
- **SyncedCarousels.tsx**: `initTimerRef` captures the 0ms init timer already inside a `useEffect`. `clearTimeout` added to the existing return alongside `api1.off`/`api2.off` cleanup.

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- `openTimerRef` in NovaPoshtaButton.tsx: FOUND
- `closeTimerRef` in QuickBuyModal.tsx: FOUND
- `localeTimerRef` in LanguageSwitcher.tsx: FOUND
- `initTimerRef` in SyncedCarousels.tsx: FOUND
- All four `clearTimeout` calls: FOUND
- TypeScript: no errors in any of the four files
