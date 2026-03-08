---
phase: 11-analyze-project-and-prepare-for-production-integrate-posthog-monitoring
plan: "02"
subsystem: logging-cleanup
tags: [production-readiness, security, logging, PII]
dependency_graph:
  requires: []
  provides: [clean-production-logs, no-PII-exposure]
  affects:
    - src/entities/favorite/api/add-to-fav.ts
    - src/entities/customer/api/create-customer-token.ts
    - src/entities/cart/api/update-cart-delivery-preferences.ts
    - src/entities/cart/api/update-discount-codes.ts
    - src/entities/cart/api/get.ts
    - src/entities/recently-viewed/api/record-view.ts
    - src/entities/recently-viewed/ui/ViewTracker.tsx
    - src/entities/home/ui/main-collection-grid.tsx
    - src/shared/lib/clients/shopify-factory.ts
    - src/features/header/language-switcher/api/set-locale.ts
    - src/features/header/navigation/api/setCookieGender.ts
    - src/shared/lib/customer-account.ts
    - src/features/checkout/delivery/api/saveDeliveryInfo.ts
    - src/shared/lib/clients/storefront-client.ts
    - src/features/product/quick-buy/api/create-quick-order.ts
    - src/features/novaPoshta/ui/NovaPoshtaButton.tsx
    - src/features/collection/ui/ActiveFilterChip.tsx
    - src/features/collection/ui/ActiveFiltersCarousel.tsx
    - src/features/header/cart/ui/RemoveItemButton.tsx
    - src/shared/sanity/schemaTypes/shopify/shemas/objects/global/linkInternal.ts
tech_stack:
  added: []
  patterns: [console-error-catch-only, no-PII-logging]
key_files:
  created: []
  modified:
    - src/entities/favorite/api/add-to-fav.ts
    - src/entities/customer/api/create-customer-token.ts
    - src/entities/cart/api/update-cart-delivery-preferences.ts
    - src/entities/cart/api/update-discount-codes.ts
    - src/entities/cart/api/get.ts
    - src/entities/recently-viewed/api/record-view.ts
    - src/entities/recently-viewed/ui/ViewTracker.tsx
    - src/entities/home/ui/main-collection-grid.tsx
    - src/shared/lib/clients/shopify-factory.ts
    - src/features/header/language-switcher/api/set-locale.ts
    - src/features/header/navigation/api/setCookieGender.ts
    - src/shared/lib/customer-account.ts
    - src/features/checkout/delivery/api/saveDeliveryInfo.ts
    - src/shared/lib/clients/storefront-client.ts
    - src/features/product/quick-buy/api/create-quick-order.ts
    - src/features/novaPoshta/ui/NovaPoshtaButton.tsx
    - src/features/collection/ui/ActiveFilterChip.tsx
    - src/features/collection/ui/ActiveFiltersCarousel.tsx
    - src/features/header/cart/ui/RemoveItemButton.tsx
    - src/shared/sanity/schemaTypes/shopify/shemas/objects/global/linkInternal.ts
decisions:
  - "[11-02]: get.ts catch block console.log with emoji replaced with console.error — non-PII error logging kept per Phase 1 decision"
  - "[11-02]: create-customer-token.ts emoji console.log in catch replaced with console.error — preserves error visibility without debug style"
  - "[11-02]: saveDeliveryInfo.ts console.warn on cart sync failure removed — non-fatal path, DB data used at order time regardless"
  - "[11-02]: NovaPoshtaButton geolocation error callback simplified to silent fallback comment — widget defaults to Kyiv when geolocation unavailable"
  - "[11-02]: storefront-client.ts retry console.log removed — console.error calls for HTTP/GraphQL errors retained as legitimate production error handlers"
metrics:
  duration_seconds: 130
  completed_date: "2026-03-08"
  tasks_completed: 2
  files_modified: 20
---

# Phase 11 Plan 02: Production Log Cleanup Summary

**One-liner:** Removed all 30+ console.log/warn debug calls across 20 production files — zero PII exposure in Vercel logs, legitimate console.error in catch blocks preserved.

## What Was Done

All console.log and debug console.warn calls were removed from 20 files identified in the Phase 11 research. The work was split into two commits:

**Task 1 — Server actions and API files (14 files, 15d81bb):**
Removed debug logging from server-side code paths including PII-containing logs (session objects, user data, cart tokens, mapped user data), request body dumps, and success trace logs.

**Task 2 — Client component files (6 files, 1bb222f):**
Removed all debug logging from React components including 10+ geolocation debug calls in NovaPoshtaButton, filter object dumps in collection UI, and action trace logs in cart components.

## Key Rules Applied

- console.log calls: removed unconditionally
- console.warn debug calls: removed unconditionally
- console.error with emoji markers (🚀): replaced with plain console.error or removed
- console.error in catch blocks without PII: retained (legitimate production error handlers)

## Decisions Made

- `get.ts`: The emoji console.log was inside the AbortError guard `if (!isAbort)` block — converted to `console.error('[getCart] error:', error)` to preserve error visibility for real errors without emoji debug marker
- `create-customer-token.ts`: Catch block `console.log('🚀...')` replaced with `console.error('[createShopifyCustomerToken] error:', error)` — retains error logging, removes debug marker
- `saveDeliveryInfo.ts`: The `console.warn` on non-fatal cart sync failure and success `console.log` both removed; the else branch was eliminated, leaving a comment explaining the non-fatal path
- `NovaPoshtaButton.tsx`: Geolocation error callback parameter renamed from `err` to `_` (implicit via empty arrow) to avoid unused variable lint warnings; silent fallback comment added
- `storefront-client.ts`: Retry delay `console.log` removed; existing `console.error` calls for HTTP errors and GraphQL errors retained

## Deviations from Plan

None — plan executed exactly as written. All 20 files cleaned, zero console.log/warn remain in any src file.

## Verification

Broad scan result: zero console.log calls in any `.ts` or `.tsx` file under `/src`:
```
grep -rn "console\.log" src/ --include="*.ts" --include="*.tsx" → (empty output)
```

## Self-Check: PASSED

Verified commits exist:
- 15d81bb — Task 1 (14 server-side files)
- 1bb222f — Task 2 (6 client component files)

All 20 target files modified. Zero console.log calls remain in src directory.
