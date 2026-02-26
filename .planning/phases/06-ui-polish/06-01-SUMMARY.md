---
phase: 06-ui-polish
plan: 01
subsystem: ui
tags: [favicon, currency, next-og, ImageResponse, price-display, UAH]

requires: []
provides:
  - Branded favicon (black bg, white 'M', 32x32) via app/icon.tsx using Next.js ImageResponse
  - getCurrencySymbol utility at src/shared/lib/utils/getCurrencySymbol.ts — returns 'грн' for UAH
  - All 11 price-display components updated to use getCurrencySymbol instead of getSymbolFromCurrency
affects:
  - Any future price-display components (must use getCurrencySymbol, not getSymbolFromCurrency directly)
  - Browser tab branding (favicon visible in tab)

tech-stack:
  added: []
  patterns:
    - "Currency symbol override pattern: getCurrencySymbol wraps currency-symbol-map with UAH→грн override"
    - "Centralized currency display: all price components import from @shared/lib/utils/getCurrencySymbol"

key-files:
  created:
    - app/icon.tsx
    - src/shared/lib/utils/getCurrencySymbol.ts
  modified:
    - src/widgets/product-view/ui/Price.tsx
    - src/features/favorites/ui/FavoriteProductCard.tsx
    - src/features/checkout/receipt/ui/OrderSummary.tsx
    - src/features/cart/ui/CartPage.tsx
    - src/features/cart/ui/CartItem.tsx
    - src/features/header/cart/ui/Content.tsx
    - src/features/header/cart/ui/Item.tsx
    - src/entities/home/ui/SyncedCarousels.tsx
    - src/entities/home/ui/product-carousel.tsx
    - src/entities/product/ui/ProductCard.tsx
    - src/entities/product/ui/ProductCardSPP.tsx

key-decisions:
  - "getCurrencySymbol wraps currency-symbol-map with UAH->'грн' override — fallback to currencyCode for unknown currencies"
  - "Item.tsx (header cart) hardcoded getSymbolFromCurrency('UAH') — replaced with getCurrencySymbol('UAH'), now returns 'грн'"
  - "CartPage.tsx had getSymbolFromCurrency only in commented-out JSX — updated references in comments too for consistency"

patterns-established:
  - "Currency display pattern: import { getCurrencySymbol } from '@shared/lib/utils/getCurrencySymbol' and call getCurrencySymbol(currencyCode)"

requirements-completed: [UI-01, UI-02]

duration: 3min
completed: 2026-02-26
---

# Phase 6 Plan 01: Favicon and Currency Display Summary

**Branded 'M' favicon via Next.js ImageResponse and UAH currency label changed from '₴' to 'грн' across all 11 price-display components**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-26T13:40:02Z
- **Completed:** 2026-02-26T13:43:08Z
- **Tasks:** 2
- **Files modified:** 13 (1 new favicon + 1 new utility + 11 updated price files)

## Accomplishments
- Created `app/icon.tsx` — Next.js App Router favicon using ImageResponse (32x32, black bg, white 'M')
- Created `src/shared/lib/utils/getCurrencySymbol.ts` — UAH override utility that returns 'грн' instead of '₴'
- Updated all 11 price-display files to use `getCurrencySymbol` instead of `getSymbolFromCurrency` directly
- Zero TypeScript errors in all modified files

## Task Commits

Each task was committed atomically:

1. **Task 1: Add branded favicon via Next.js ImageResponse** - `5f9236a` (feat)
2. **Task 2: Create getCurrencySymbol utility and update 11 price files** - `8566ca3` (feat)

**Plan metadata:** (docs commit pending)

## Files Created/Modified
- `app/icon.tsx` - Next.js ImageResponse favicon — 32x32 black background, white 'M' serif character
- `src/shared/lib/utils/getCurrencySymbol.ts` - UAH→'грн' override; delegates to currency-symbol-map for other codes
- `src/widgets/product-view/ui/Price.tsx` - Updated to getCurrencySymbol
- `src/features/favorites/ui/FavoriteProductCard.tsx` - Updated to getCurrencySymbol
- `src/features/checkout/receipt/ui/OrderSummary.tsx` - Updated both usages (OrderItemCard + OrderSummary) to getCurrencySymbol
- `src/features/cart/ui/CartPage.tsx` - Updated import; getSymbolFromCurrency was in commented code, also updated
- `src/features/cart/ui/CartItem.tsx` - Updated to getCurrencySymbol
- `src/features/header/cart/ui/Content.tsx` - Updated both inline usages to getCurrencySymbol
- `src/features/header/cart/ui/Item.tsx` - Updated hardcoded getCurrencySymbol('UAH') call
- `src/entities/home/ui/SyncedCarousels.tsx` - Updated 3 inline usages to getCurrencySymbol
- `src/entities/home/ui/product-carousel.tsx` - Updated 3 inline usages to getCurrencySymbol
- `src/entities/product/ui/ProductCard.tsx` - Updated 3 inline usages to getCurrencySymbol
- `src/entities/product/ui/ProductCardSPP.tsx` - Updated to getCurrencySymbol

## Decisions Made
- `getCurrencySymbol` wraps `currency-symbol-map` rather than replacing it — avoids breaking other currencies
- UAH explicitly returns 'грн' (Cyrillic label preferred by client over '₴' glyph)
- Commented-out price code in CartPage.tsx also updated to avoid stale references if uncommented later

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Favicon and currency display are complete — browser tab shows 'M' icon, all prices show 'грн'
- Pattern established: all future price components must use `getCurrencySymbol` from `@shared/lib/utils/getCurrencySymbol`
- Ready for remaining Phase 6 UI polish tasks

---
*Phase: 06-ui-polish*
*Completed: 2026-02-26*
