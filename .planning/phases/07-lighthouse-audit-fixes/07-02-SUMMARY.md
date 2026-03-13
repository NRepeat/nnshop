---
plan: 07-02
phase: 07-lighthouse-audit-fixes
status: complete
commit: 7b12f00
---

# Plan 07-02 Summary: Accessibility Fixes

## What Was Built

Fixed two accessibility issues caught by Lighthouse audit:

1. **`src/entities/announcement-bar/announcement-bar.tsx`** — Added `aria-label="Telegram"` to Telegram anchor element and `aria-label="Viber"` to Viber anchor element. Both links previously contained only SVG icons with no accessible name (Lighthouse A11Y failure). Labels added to the `<a>` elements as required (not inner Button/span).

2. **`src/widgets/footer/ui/Footer.tsx`** — Changed footer copyright div from `text-white/40` to `text-white/50`. This raises contrast ratio from 3.83:1 (fails WCAG 2.1 AA) to 5.24:1 (passes WCAG 2.1 AA, requires ≥4.5:1) against the `#1a1a1a` background.

## Tasks Completed

| Task | Status |
|------|--------|
| Task 1: Add aria-label to Telegram and Viber anchors | ✓ |
| Task 2: Fix footer copyright contrast (text-white/40 → text-white/50) | ✓ |

## Key Files

### Created
- `.planning/phases/07-lighthouse-audit-fixes/07-02-SUMMARY.md`

### Modified
- `src/entities/announcement-bar/announcement-bar.tsx`
- `src/widgets/footer/ui/Footer.tsx`

## Self-Check: PASSED

- `grep` for `aria-label` in announcement-bar.tsx returns two lines (Telegram + Viber) ✓
- `grep` for `text-white/50` in Footer.tsx copyright div returns one line ✓
- `grep` for `text-center text-white/40` returns no results ✓
