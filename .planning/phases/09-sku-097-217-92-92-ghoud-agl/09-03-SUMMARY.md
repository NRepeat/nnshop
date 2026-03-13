---
phase: 09-sku-097-217-92-92-ghoud-agl
plan: "03"
subsystem: product-cart-ux
tags: [cart, quick-buy, ux, zustand, react-hook-form]
dependency_graph:
  requires: []
  provides: [cart-auto-open-on-add, quick-buy-phone-default]
  affects: [AddToCartButton, QuickBuyModal, CartSheet]
tech_stack:
  added: []
  patterns: [zustand-store-client-component, react-hook-form-reset-with-values]
key_files:
  created: []
  modified:
    - src/entities/product/ui/AddToCartButton.tsx
    - src/features/product/quick-buy/ui/QuickBuyModal.tsx
decisions:
  - "openCart() called after toast.success and before onSuccess? — consistent with Phase 3 decision that success callbacks fire on confirmed Shopify add success"
  - "phone reset to '+38' not '' on modal reopen — ensures country code always pre-filled as UX guide; validation only passes on complete number"
metrics:
  duration: 2 min
  completed_date: "2026-03-04"
  tasks_completed: 2
  files_modified: 2
---

# Phase 9 Plan 03: Cart Auto-Open and Quick Buy Phone Default Summary

**One-liner:** Cart sheet auto-opens on successful add-to-cart via useCartUIStore; QuickBuyModal phone field pre-fills and resets to '+38' UA country code.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Open cart sheet on successful add-to-cart | 35ddb46 | src/entities/product/ui/AddToCartButton.tsx |
| 2 | Set +38 default country code in QuickBuyModal phone field | 616a859 | src/features/product/quick-buy/ui/QuickBuyModal.tsx |

## What Was Built

**Task 1 — Cart auto-open (AddToCartButton.tsx):**
- Added import of `useCartUIStore` from `@shared/store/use-cart-ui-store`
- Destructured `openCart` inside the `AddToCartButton` component
- Called `openCart()` after `toast.success(t('addedToCart'))` and before `onSuccess?.()` in the `if (result.success)` block
- Cart sheet now automatically opens when a product is successfully added, following standard e-commerce UX

**Task 2 — Phone default country code (QuickBuyModal.tsx):**
- Changed `defaultValues.phone` from `''` to `'+38'` in `useForm`
- Changed bare `form.reset()` to `form.reset({ name: '', phone: '+38' })` in the `open` useEffect
- Phone field now shows '+38' UA country code prefix on first open and after every modal close+reopen
- Validation still requires a complete valid phone number (e.g. '+380971234567') — '+38' alone does not pass

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check

### Files Exist
- [x] src/entities/product/ui/AddToCartButton.tsx
- [x] src/features/product/quick-buy/ui/QuickBuyModal.tsx

### Commits Exist
- [x] 35ddb46 — feat(09-03): open cart sheet on successful add-to-cart
- [x] 616a859 — feat(09-03): set +38 default country code in QuickBuyModal phone field

### Verification Criteria
- [x] `openCart` present in AddToCartButton.tsx (2 occurrences: destructure + call)
- [x] `phone: '+38'` present in QuickBuyModal.tsx (2 occurrences: defaultValues + reset)
- [x] No bare `form.reset()` calls remain
- [x] `npx tsc --noEmit` — no TypeScript errors

## Self-Check: PASSED
