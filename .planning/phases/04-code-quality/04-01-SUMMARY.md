---
phase: 04-code-quality
plan: 01
subsystem: checkout, announcement-bar
tags: [typescript, type-safety, as-any-removal]
dependency_graph:
  requires: []
  provides: [TYPE-01]
  affects: [UkrPoshtaForm, AnnouncementBar]
tech_stack:
  added: []
  patterns: [Path<T> for react-hook-form field arrays, typeof guard for Sanity union types]
key_files:
  created: []
  modified:
    - src/features/checkout/delivery/ui/UkrPoshtaForm.tsx
    - src/entities/announcement-bar/announcement-bar.tsx
decisions:
  - "Used Path<DeliveryInfo> for FieldConfig.name and explicit field prop spreading to resolve union value type conflict with Input"
  - "Replaced form.formState.errors[item.name] with form.getFieldState(item.name).invalid to avoid nested-path indexing issue"
  - "typeof text === 'string' guard sufficient for AnnouncementBar; no new interface needed"
metrics:
  duration: 2 min
  completed: 2026-02-23
  tasks_completed: 2
  files_modified: 2
---

# Phase 04 Plan 01: Remove as any Casts in UkrPoshtaForm and AnnouncementBar

**One-liner:** Replaced `as any` casts with `useFormContext<DeliveryInfo>` + `Path<DeliveryInfo>` typed field arrays in UkrPoshtaForm and a `typeof text === 'string'` narrowing guard in AnnouncementBar.

## What Was Done

Eliminated all `as any` escape hatches from two files so TypeScript can catch field-name typos and type mismatches at compile time.

### Task 1: UkrPoshtaForm typed with DeliveryInfo generic

- Added `DeliveryInfo` import from `../model/deliverySchema`
- Added `Path` import from `react-hook-form`
- Defined private `FieldConfig` type: `{ name: Path<DeliveryInfo>; label: string; placeholder: string }`
- Annotated `addressFields` and `locationFields` as `FieldConfig[]`
- Changed `useFormContext()` to `useFormContext<DeliveryInfo>()`
- Removed `name={item.name as any}` — field names are now statically verified as valid `DeliveryInfo` paths
- Used explicit field props (`name`, `ref`, `onBlur`, `onChange`, `value`) with `typeof field.value === 'string' ? field.value : ''` to satisfy `InputHTMLAttributes` value type
- Replaced `form.formState.errors[item.name]` with `form.getFieldState(item.name).invalid` to avoid nested-path index error

### Task 2: AnnouncementBar text narrowed with typeof guard

- Added `const displayText = typeof text === 'string' ? text : ''` before the return statement
- Replaced both `{text as any as string}` occurrences (mobile and desktop) with `{displayText}`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed value type mismatch after adding DeliveryInfo generic**
- **Found during:** Task 1 verification
- **Issue:** `{...field}` spread exposed `value` typed as full `DeliveryInfo` field union (including object types), incompatible with `InputHTMLAttributes<HTMLInputElement>`
- **Fix:** Replaced `{...field}` with explicit props; narrowed `value` with `typeof field.value === 'string' ? field.value : ''`
- **Files modified:** `src/features/checkout/delivery/ui/UkrPoshtaForm.tsx`
- **Commit:** included in feat(04-01) task 1 commit

**2. [Rule 1 - Bug] Fixed errors indexing with Path<DeliveryInfo> nested paths**
- **Found during:** Task 1 verification
- **Issue:** `form.formState.errors[item.name]` errored because `Path<DeliveryInfo>` includes nested paths like `novaPoshtaDepartment.id` which don't exist as direct index keys on `FieldErrors`
- **Fix:** Replaced with `form.getFieldState(item.name).invalid`
- **Files modified:** `src/features/checkout/delivery/ui/UkrPoshtaForm.tsx`
- **Commit:** included in feat(04-01) task 1 commit

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 6fe0f6f | feat(04-01): type UkrPoshtaForm with DeliveryInfo generic |
| 2 | dcad2b7 | feat(04-01): narrow AnnouncementBar text with typeof guard |

## Self-Check: PASSED

- [x] `src/features/checkout/delivery/ui/UkrPoshtaForm.tsx` exists and contains `useFormContext<DeliveryInfo>()`, `FieldConfig`, no `as any`
- [x] `src/entities/announcement-bar/announcement-bar.tsx` exists and contains `displayText`, no `as any`
- [x] `npx tsc --noEmit` reports no errors in either file
- [x] Both commits exist in git log
