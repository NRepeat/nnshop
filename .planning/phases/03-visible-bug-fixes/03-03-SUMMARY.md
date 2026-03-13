---
phase: 03-visible-bug-fixes
plan: 03
subsystem: ui
tags: [zustand, react, quick-view, cart, shopify, variant-selection, radix-ui]

# Dependency graph
requires: []
provides:
  - useCartUIStore Zustand store with isOpen/openCart/closeCart for programmatic cart sidebar control
  - CartSheetController client component rendering controlled Radix Sheet with Zustand state
  - ProductQuickView with working size/color variant selection, out-of-stock states, and post-add flow
  - AddToCartButton with optional onSuccess callback and external disabled prop
affects: [04-visible-bug-fixes, any feature using cart sidebar state, quick-view modal]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - RSC composition: server component (CartSheet) passed as children to client component (CartSheetController) to allow client-controlled sheet open state while preserving async server-side data fetching
    - Zustand store for transient UI state without persist middleware (cart sidebar open state)
    - Inline type inference using `type VariantNode = (typeof product.variants.edges)[0]['node']` to avoid separate type imports

key-files:
  created:
    - src/shared/store/use-cart-ui-store.ts
    - src/features/header/cart/ui/CartSheetController.tsx
  modified:
    - src/features/header/cart/ui/Sheet.tsx
    - src/features/header/ui/HeaderOptions.tsx
    - src/entities/product/ui/ProductQuickView.tsx
    - src/entities/product/ui/AddToCartButton.tsx

key-decisions:
  - "CartSheetController uses children pattern (server component passed as children) not direct import — required for RSC compatibility since server component async data fetching cannot survive being imported by a client component"
  - "CartSheet Sheet.tsx outer <Sheet> wrapper removed and moved to CartSheetController — CartSheet now renders only SheetTrigger + SheetContent fragments"
  - "Controlled sheet uses isOpen from Zustand for open state; onOpenChange handles both open (openCart) and close (closeCart) so SheetTrigger click still works normally"
  - "ProductQuickView uses inline type alias for variant node type to avoid separate type import complexity"
  - "AddToCartButton onSuccess called after result.success — after toast, before finally block — ensures callback fires only on confirmed success"

patterns-established:
  - "RSC composition pattern: pass async server components as children to client wrapper components to maintain server data fetching while enabling client-side controlled behavior"
  - "Zustand stores for transient UI state: no persist middleware, simple create() with boolean flag + two action functions"

requirements-completed: [BUG-04]

# Metrics
duration: 6min
completed: 2026-02-23
---

# Phase 03 Plan 03: Quick-Buy Variant Selection Fix Summary

**Zustand-controlled cart sidebar + interactive size/color variant selection in quick-view modal with post-add close-and-open flow**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-23T10:33:40Z
- **Completed:** 2026-02-23T10:39:53Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Created `useCartUIStore` Zustand store enabling programmatic cart sidebar open/close from anywhere in the app
- Fixed RSC composition: `CartSheetController` (client) wraps `CartSheet` (server) as children, enabling controlled Radix Sheet state while preserving async server data fetching
- Wired interactive size and color variant selection in `ProductQuickView` with selected/unselected visual states, out-of-stock disabled states, and correct variant passed to cart
- Add to Cart button is disabled until a variant is selected; after successful add, modal closes (`router.back()`) and cart sidebar opens (`openCart()`)

## Task Commits

1. **Task 1: Create useCartUIStore and CartSheetController, update HeaderOptions** - `3369701` (feat)
2. **Task 2: Wire variant selection state in ProductQuickView and call openCart after add** - `95c0afc` (feat)

## Files Created/Modified
- `src/shared/store/use-cart-ui-store.ts` - New transient Zustand store: isOpen, openCart, closeCart
- `src/features/header/cart/ui/CartSheetController.tsx` - New client component: controlled Sheet wrapper reading Zustand store, accepts children
- `src/features/header/cart/ui/Sheet.tsx` - Removed outer `<Sheet>` wrapper (moved to CartSheetController); now renders `<>SheetTrigger + CartWithEmptyState</>` fragment
- `src/features/header/ui/HeaderOptions.tsx` - Updated to compose `<CartSheetController><CartSheet /></CartSheetController>` pattern
- `src/entities/product/ui/ProductQuickView.tsx` - Added selectedVariant state, size/color button onClick with selection and out-of-stock logic, onSuccess callback
- `src/entities/product/ui/AddToCartButton.tsx` - Added optional `onSuccess` and `disabled` props; onSuccess called after successful add

## Decisions Made
- **RSC composition via children**: `CartSheetController` uses `children: React.ReactNode` pattern instead of directly importing `CartSheet`. Direct client→server import converts the server component to a client component (losing async data fetching). Passing as children preserves the server component boundary.
- **Outer Sheet wrapper moved**: `CartSheet` (Sheet.tsx) no longer renders `<Sheet>` itself. The outer wrapper lives in `CartSheetController` so it can be controlled. `CartSheet` renders a fragment with `SheetTrigger` + `CartWithEmptyState`.
- **Fully controlled sheet**: `onOpenChange` handles both `true` (openCart) and `false` (closeCart) so the `SheetTrigger` click (which fires `onOpenChange(true)`) still works correctly in controlled mode.
- **Inline type inference**: `type VariantNode = (typeof product.variants.edges)[0]['node']` avoids importing `ProductVariant` from the full storefront types, preventing potential type mismatch with the narrower generated query type.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed outer `<Sheet>` from CartSheet and moved to CartSheetController**
- **Found during:** Task 1 (CartSheetController implementation)
- **Issue:** Plan described passing `open`/`onOpenChange` as props from client to server component, but functions cannot cross the server/client RSC boundary. Direct import of server component from client component removes async data fetching capability.
- **Fix:** Restructured so `CartSheetController` owns the controlled `<Sheet>` wrapper and `CartSheet` renders only its inner fragments. `HeaderOptions` composes them using the RSC children pattern.
- **Files modified:** src/features/header/cart/ui/Sheet.tsx, src/features/header/ui/HeaderOptions.tsx, src/features/header/cart/ui/CartSheetController.tsx
- **Verification:** Build passes, controlled sheet behavior maintained
- **Committed in:** 3369701 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - structural implementation bug)
**Impact on plan:** Required for correctness — the plan's described prop-passing approach would have broken server-side cart data fetching. RSC children pattern achieves identical end behavior.

## Issues Encountered
- The plan's proposed `CartSheetController` signature (accepting `locale` and passing `open`/`onOpenChange` to `CartSheet`) is not compatible with Next.js RSC rules. Functions cannot be passed from client components to server components. Resolved by restructuring `CartSheet` to render only the inner content and moving the `<Sheet>` wrapper to `CartSheetController`, using the standard RSC composition pattern (pass server components as `children`).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `useCartUIStore` is available globally for any feature needing to programmatically open the cart sidebar
- Quick-view variant selection is fully functional and correctly passes the selected variant to Shopify cart API
- Cart sidebar `SheetTrigger` click still works (controlled open state handles it via `onOpenChange(true)`)

---
*Phase: 03-visible-bug-fixes*
*Completed: 2026-02-23*
