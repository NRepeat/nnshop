# Phase 9: ФРОНТ - Research

**Researched:** 2026-03-04
**Domain:** Frontend fixes and feature additions across checkout, order management, cart, product, navigation, and CMS
**Confidence:** HIGH (all findings verified directly in source code)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Remove delivery/shipping selection step or section from checkout entirely
- Check and fix the NP geolocation widget — it should function correctly (specific bug to verify in code)
- "Оброблено" order status badge → green
- "Скасовано" order status badge → red
- "Відмова від отримання" order status badge → red
- "Отменен" / "Скасовано" cancellation status — ensure handled correctly
- When a product is added to cart, display/open the cart (cart sheet or drawer)
- Add default country code (+38 or UA) to the phone field in Quick Order by default
- Link related products by matching SKU — products with the same SKU slug are shown as related
- Apply discount code to order — needs discount input field in checkout or order flow
- Phone number: change to 097 217 92 92
- Add Viber icon/link next to the phone number
- Update navigation menu (exact changes to be determined from current CMS/code state)
- Add logos for brands GHOUD and AGL (in Sanity CMS brand/collection schema or dedicated brands section)
- Test the "стежити за ціною" (watch price / price alert) feature — verify it works end-to-end

### Claude's Discretion
- Cart display implementation detail: auto-open sheet vs trigger — use existing cart sheet open mechanism
- Navigation menu exact changes: investigate current state and apply needed fixes
- Viber icon: use existing Viber icon pattern from AnnouncementBar if available, otherwise add inline SVG
- Brand logo display location: check existing brand/isBrand collection structure from Phase quick task

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

## Summary

Phase 9 is a collection of 13 distinct frontend fixes and feature additions. All tasks operate within the existing codebase structure with no new libraries required. The code investigation reveals that every task has a clear, well-scoped implementation path and the relevant components are already identified.

The checkout stepper currently has 4 steps (info, delivery, payment, success). "Remove delivery" means removing the delivery step from this flow — removing it from CheckoutStepper, removing the route from the step sequence, and redirecting the delivery route page. The Nova Poshta geolocation widget already has the geolocation code in place but has a bug: the `console.error` call in the geolocation error handler logs to console (violates Phase 1 decision) and there is no user-facing fallback when geolocation is denied.

Order status badge coloring is currently binary (default/secondary/destructive) and does not cover the Ukrainian/Russian status strings ("Оброблено", "Скасовано", "Відмова від отримання") that come from the external PRICE_APP_URL API. The external API returns `fulfillmentStatus` as free-form strings rather than Shopify GraphQL enum values, so the badge must handle both the external string values and the standard Shopify enum values.

**Primary recommendation:** Implement all 13 tasks as separate plans, each touching one component area. Do not mix concerns — the tasks are independent and safe to parallelize in planning.

---

## Standard Stack

### Core (already installed, no new dependencies needed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zustand | existing | Cart UI open/close state | `useCartUIStore` already manages `isOpen`, `openCart`, `closeCart` |
| shadcn/ui Badge | existing | Order status badge colors | Already used in `OrderStatusBadge.tsx` |
| next-intl | existing | i18n for all UI strings | All string additions go through `messages/uk.json` + `messages/ru.json` |
| libphonenumber-js | existing | Phone validation in QuickBuyModal | Already imported and used |
| Sanity v4 | existing | CMS for brand logos, navigation, telephone | All CMS changes go through Sanity schema + Studio |
| react-hook-form | existing | Quick order phone field | Already used in QuickBuyModal |

### No New Libraries Needed
All 13 tasks can be implemented with existing dependencies.

---

## Architecture Patterns

### Pattern 1: Cart Auto-Open on Add to Cart
**What:** When `AddToCartButton.handleSubmit` calls `onSuccess?.()`, invoke `useCartUIStore().openCart()`.
**Problem:** `AddToCartButton` is a client component but is used in many contexts. The `useCartUIStore` store is already available anywhere client-side.
**How:** Import `useCartUIStore` into `AddToCartButton.tsx`, call `openCart()` after `result.success` — same position as `onSuccess?.()`.

```typescript
// src/entities/product/ui/AddToCartButton.tsx
import { useCartUIStore } from '@shared/store/use-cart-ui-store';
// Inside AddToCartButton component:
const { openCart } = useCartUIStore();
// ...in handleSubmit after result.success:
if (result.success) {
  toast.success(t('addedToCart'));
  openCart();   // <-- add this
  onSuccess?.();
}
```

**Key insight from Phase 03 decisions:** CartSheetController uses children pattern for RSC compatibility. The store (`useCartUIStore`) is already the correct mechanism — no new wiring needed.

### Pattern 2: Checkout Stepper Delivery Removal
**What:** Remove 'delivery' step from checkout stepper and flow.
**Files affected:**
- `src/entities/checkout/ui/CheckoutStepper.tsx` — remove delivery from `steps[]` and `stepOrder[]`
- `src/features/checkout/api/getCompletedSteps.ts` — remove `deliveryInformation` check and `'delivery'` from `CheckoutStep` type
- `app/[locale]/(frontend)/(checkout)/checkout/delivery/page.tsx` — redirect to `/checkout/payment`
- `app/[locale]/(frontend)/(checkout)/checkout/@receipt/delivery/page.tsx` — redirect
- Payment total calculation in `Payment.tsx` already adds a shipping fee (20 + 2% of goods total) independently of the delivery step
- `messages/uk.json` and `messages/ru.json` — remove `delivery` key from `CheckoutSteps`

**Important:** The delivery step currently collects Nova Poshta department data. After removal, the checkout will be: info → payment → success. No data loss for existing orders (Nova Poshta selection would be handled elsewhere or removed).

### Pattern 3: Order Status Badge — External API Status Strings
**What:** The external API at `PRICE_APP_URL` returns `fulfillmentStatus` as strings like "Оброблено", "Скасовано", "Відмова від отримання", "CANCELLED" etc. — NOT standard Shopify enum values.
**Current state:** `OrderStatusBadge` only handles `FULFILLED | UNFULFILLED | ON_HOLD | PARTIALLY_FULFILLED`.
**Solution:** Extend the switch statement in `OrderStatusBadge` and `OrderTimeline` to handle these external strings.

```typescript
// src/features/order/ui/OrderStatusBadge.tsx
const getStatusColor = (status: string): 'default' | 'secondary' | 'destructive' | 'success' => {
  switch (status.toUpperCase()) {
    case 'FULFILLED':
    case 'ОБРОБЛЕНО':
      return 'success';  // green
    case 'CANCELLED':
    case 'СКАСОВАНО':
    case 'ВІДМОВА ВІД ОТРИМАННЯ':
      return 'destructive';  // red
    // ...existing cases
  }
};
```

**Note:** shadcn/ui Badge doesn't have a built-in 'success' variant. The plan must add a custom Tailwind class (`bg-green-100 text-green-800`) or extend the badge variant directly. The CONTEXT.md says "зелений" (green) — use Tailwind `bg-green-100 text-green-800 border-green-200` inline class or add `success` variant to Badge.

### Pattern 4: Quick Order Default Country Code (+38)
**What:** Phone input in `QuickBuyModal.tsx` has `defaultValues: { phone: '' }`. Change to `'+38'` so user sees the country code pre-filled.
**Validator:** `isValidPhone` uses `parsePhoneNumberFromString(phone)` — a number starting with `+38...` will validate correctly for UA numbers.
**File:** `src/features/product/quick-buy/ui/QuickBuyModal.tsx`

```typescript
defaultValues: {
  name: '',
  phone: '+38',
},
```

**Also reset to '+38' not '' on modal re-open:**
```typescript
form.reset({ name: '', phone: '+38' });
```

### Pattern 5: Related Products by SKU
**Current flow:** `ProductSessionView` reads `recommended_products` metafield (an array of product IDs set manually in Shopify). If fewer than 3 exist, fills with new products by `productType`.
**New requirement:** Match by SKU — products whose variant SKU matches the current product's variant SKU.
**SKU is available:** `product.variants.edges[0].node.sku` is already fetched in `GET_PRODUCT_QUERY` and displayed in `ProductInfo.tsx`.
**Shopify Storefront search query supports SKU:** `sku:VALUE` in the `products` query filter.

```typescript
// New API: getProductsBySku.ts
const QUERY = `#graphql
  query GetProductsBySku($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges { node { id title handle ... } }
    }
  }
`;
// Usage: query: `sku:${sku} -id:${productNumericId}`
```

**Integration point:** In `ProductSessionView.tsx`, after `relatedProductsIds` is resolved, if result < 3 and product has a SKU, fetch SKU-matched products as additional filler BEFORE the `productType` filler. Priority: manual metafield IDs > SKU matches > productType filler.

### Pattern 6: Discount Code in Checkout Flow
**Current state:** `DiscountCodeInput` component already exists in `src/features/cart/ui/DiscountCodeInput.tsx` and is used in:
- Cart page (`CartPage.tsx`)
- Cart sheet header (`Content.tsx`)

**The task "apply discount to order"** likely means ensuring the discount code input is also accessible during checkout (e.g., in the receipt sidebar on the payment page). Check if `OrderSummary` in the `@receipt` parallel route exposes `DiscountCodeInput` — it currently does NOT include it.

**Solution:** Add `DiscountCodeInput` to `OrderSummary.tsx` (receipt sidebar) so users can apply a discount code during checkout at the payment step. The API (`applyDiscountCode`) already exists and works correctly.

### Pattern 7: Phone Number and Viber Update
**Current state:**
- `messages/uk.json` has `Footer.phone1: "097-217-92-92"` — already correct! Phone 1 is already the right number.
- `Footer.phone2: "066-217-92-92"` — this is the second phone, may remain.
- AnnouncementBar reads `telephone` field from Sanity `infoBar` document. The phone shown in the announcement bar must be updated in Sanity CMS (not code).
- Viber icon: AnnouncementBar already has a Viber SVG icon and `viberPhone` field from Sanity. The Viber phone is set in Sanity `infoBar.viberPhone` or via `VIBER_PHONE_NUMBER` env var.

**Action needed:**
1. Update Sanity `siteSettings > infoBar > telephone` to "097 217 92 92" (via Studio — no code change needed for display).
2. Update `VIBER_PHONE_NUMBER` env var to the correct digits (e.g., `380972179292`) — or set `infoBar.viberPhone` in Sanity.
3. Footer `phone1` in `messages/uk.json` is already `097-217-92-92`. Confirm `messages/ru.json` matches.

**Note:** The AnnouncementBar already has the full Viber SVG inline. No new SVG needed. The Viber link is already conditional on `viberUrl`. Only CMS/env data updates are needed for the Viber icon to appear.

### Pattern 8: Brand Logos (GHOUD, AGL)
**Current state:** Brand logos live in `brandGridBlock` in Sanity page builder. The `BrendGrid` component (home page) renders `barnds` array — each brand has an `asset` (image), `collection` reference, and `isBrandCollection` flag.
**isBrand flag on collection:** Added in Phase quick task (Quick Task 1). Collections GHOUD and AGL should have `isBrand: true`.
**Action:** Upload logo images for GHOUD and AGL in Sanity Studio → add them to the `brandGridBlock` in the home page builder → set `collection` reference and `isBrandCollection: true`.
**This is a CMS content task, not a code task.** The existing code handles it.

### Pattern 9: Navigation Menu
**Current state:** Navigation reads from Shopify's main menu (`getMainMenu`) and renders gender-filtered items + brands dropdown. The exact navigation changes required are CMS/Shopify admin changes — the menu is managed in Shopify admin → Online Store → Navigation.
**Action:** Update Shopify navigation menu in admin to match desired structure. No code changes needed unless the menu structure requires a new rendering pattern.

### Pattern 10: "Стежити за ціною" Feature Test
**Current state:** Full implementation exists:
- `PriceSubscribeModal.tsx` — dialog with email input
- `subscribe-price.ts` — server action calling `PRICE_APP_URL/api/price-subscription`
- `ProductInfo.tsx` — renders "Стежити за ціною" button that opens modal
- i18n strings: all present in `messages/uk.json`

**Testing task:** Verify the feature works end-to-end:
1. Open any product page
2. Click "Стежити за ціною" button
3. Modal opens, email pre-filled if logged in
4. Submit — verify API call to `PRICE_APP_URL/api/price-subscription` succeeds
5. Toast "Ви підписані на зміни ціни!" appears
6. Verify `PRICE_APP_URL` env var is set in production

**If broken:** The most likely failure point is `PRICE_APP_URL` env var not set or the external API returning non-200. The server action returns `{ success: false, error: 'Network error' }` in that case.

### Pattern 11: NP Geolocation Widget
**Current state in NovaPoshtaButton.tsx:**
- Uses `navigator.geolocation.getCurrentPosition` in a `useEffect` on mount
- Passes `latitude` and `longitude` to the iframe via `postMessage`
- If geolocation denied: `console.error('Помилка отримання геолокації:', error)` — this violates Phase 1 (no console.error in client handlers)
- The `coordinates` state starts as `{ latitude: '', longitude: '' }` — empty strings are passed as defaults, which is fine (widget shows Kyiv by default)

**Actual bug to fix:**
1. Remove `console.error` for geolocation error — replace with silent fail or `console.warn` at most
2. Remove `console.log('onDepartmentSelect-----------------', department)` on line 132 — PII risk (department data)
3. The `console.error('Ваш браузер не підтримує геолокацію.')` — also should be removed
4. The `iframe.addEventListener('load', handleLoad)` inside setTimeout returns a cleanup function that is ignored (the outer setTimeout callback's return value isn't used). This is a minor memory concern but not a crash.

**The geolocation itself works correctly** — it calls the widget with current position if available, falls back to empty strings (widget defaults to Kyiv), which is correct behavior.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cart sheet open trigger | Custom event system | `useCartUIStore().openCart()` | Already exists, already wired to CartSheetController |
| Badge color variants | Custom CSS classes file | Tailwind inline classes or extend shadcn Badge variants | Shadcn Badge supports `className` override |
| Phone validation with country code | Custom regex | `libphonenumber-js` already installed | Handles `+38` prefix validation correctly |
| SKU search | Custom product filtering | Shopify Storefront `products(query: "sku:VALUE")` | Shopify's search index handles SKU lookup |
| Discount API | New server action | `applyDiscountCode` in `entities/cart/api/update-discount-codes.ts` | Already complete, wired to Shopify Storefront |

---

## Common Pitfalls

### Pitfall 1: Order Status Strings from External API
**What goes wrong:** Treating `displayFulfillmentStatus` as a Shopify GraphQL enum. The external PRICE_APP_URL returns arbitrary Ukrainian strings ("Оброблено", "Скасовано") not standard Shopify enum values.
**How to avoid:** Case-insensitive comparison (`status.toUpperCase()`). Support both Ukrainian strings AND Shopify enum values in the switch.
**Warning signs:** Badge shows raw status text instead of localized label.

### Pitfall 2: Removing Delivery Step Without Handling Existing Data
**What goes wrong:** Users who have saved delivery information in DB won't be affected by the UI removal, but the `getCompletedSteps` function still checks for `deliveryInformation` — if left, the stepper may try to mark a non-existent step as completed.
**How to avoid:** Remove `'delivery'` from `CheckoutStep` type AND remove the `deliveryInformation` check from `getCompletedSteps`. Also ensure the delivery route pages redirect to payment.
**Warning signs:** Checkout flow gets stuck or shows incorrect step counts.

### Pitfall 3: Quick Order Phone Reset
**What goes wrong:** When modal closes and reopens, `form.reset()` clears the phone to `''`. Must reset to `'+38'`.
**How to avoid:** In the `useEffect` for `open` state, use `form.reset({ name: '', phone: '+38' })` not `form.reset()`.

### Pitfall 4: SKU-Based Related Products with Empty SKU
**What goes wrong:** First variant SKU is empty string or null for some products → Shopify `sku:` query returns unrelated products.
**How to avoid:** Guard `if (!sku || sku.trim() === '') return []` before fetching by SKU.

### Pitfall 5: Console Logs Left in Production
**What goes wrong:** `ProductView.tsx` has `console.log(relatedProducts, 'relatedProducts')` on line 67. `ProductSessionView.tsx` has `console.log(relatedShopiyProductsData, 'relatedShopiyProductsData')` on line 83. `getProduct.ts` has `console.log(product)` on line 146. These violate Phase 1 decisions.
**How to avoid:** Remove all three `console.log` calls as part of this phase's cleanup.

---

## Code Examples

### Order Status Badge with Green/Red Support
```typescript
// src/features/order/ui/OrderStatusBadge.tsx
'use client';
import { Badge } from '@shared/ui/badge';
import { useTranslations } from 'next-intl';
import { cn } from '@shared/lib/utils';

export const OrderStatusBadge = ({ status }: { status: string }) => {
  const t = useTranslations('OrderPage.status');
  const upper = status.toUpperCase();

  const isGreen = ['FULFILLED', 'ОБРОБЛЕНО'].includes(upper);
  const isRed = ['CANCELLED', 'СКАСОВАНО', 'ВІДМОВА ВІД ОТРИМАННЯ', 'ON_HOLD'].includes(upper);

  return (
    <Badge
      className={cn('rounded', {
        'bg-green-100 text-green-800 border-green-200': isGreen,
        'bg-red-100 text-red-800 border-red-200': isRed,
      })}
      variant={isGreen || isRed ? 'outline' : 'secondary'}
    >
      {getStatusLabel(status, t)}
    </Badge>
  );
};
```

### Add to Cart Opens Cart Sheet
```typescript
// src/entities/product/ui/AddToCartButton.tsx (in handleSubmit)
const { openCart } = useCartUIStore();
// ...
if (result.success) {
  toast.success(t('addedToCart'));
  openCart();
  onSuccess?.();
}
```

### Quick Order Default Country Code
```typescript
// src/features/product/quick-buy/ui/QuickBuyModal.tsx
defaultValues: {
  name: '',
  phone: '+38',
},
// ...in useEffect for open:
form.reset({ name: '', phone: '+38' });
```

### Fetch Products by SKU
```typescript
// src/entities/product/api/getProductsBySku.ts
export async function getProductsBySku(sku: string, excludeId: string, locale: string) {
  'use cache';
  cacheLife('minutes');
  if (!sku?.trim()) return [];
  const numericId = excludeId.split('/').pop();
  const query = `sku:${sku} -id:${numericId}`;
  // use storefrontClient.request with GET_PRODUCTS_BY_IDS shape
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Manual `recommended_products` metafield IDs | Add SKU-based matching as supplemental source | More automatic related product discovery |
| Hardcoded status enum strings | Support both Shopify enums and external API strings | Handles real order data from PRICE_APP_URL |
| Cart drawer does not open on add | Open cart sheet on successful add | Standard UX pattern for e-commerce |

---

## Open Questions

1. **"Apply discount to order" — exact scope**
   - What we know: `DiscountCodeInput` exists, works on cart page and cart sheet. Checkout receipt sidebar (`OrderSummary`) does NOT include it.
   - What's unclear: Does "apply discount to order" mean (a) add discount input to checkout receipt sidebar, or (b) ensure discount applied in cart is properly passed to the final Shopify draft order creation?
   - Recommendation: Add `DiscountCodeInput` to `OrderSummary.tsx` (receipt sidebar) — this covers both intent. The `applyDiscountCode` already updates the Shopify cart, which feeds `create.ts` order creation.

2. **"Navigation menu" — exact changes**
   - What we know: Navigation reads from Shopify admin menu. The code is functional.
   - What's unclear: What specific menu items need changing? This may be pure Shopify admin work.
   - Recommendation: Treat as a Shopify admin task, not a code task. Note in plan as "update menu in Shopify admin → Online Store → Navigation".

3. **Delivery step removal — NP widget impact**
   - What we know: The NP widget (`NovaPoshtaButton`) lives in `DeliveryForm`, which lives in the delivery checkout step being removed.
   - What's unclear: Is the NP widget needed anywhere else after delivery step is removed?
   - Recommendation: If delivery step is fully removed, the NP widget only needs to be checked/fixed in case it's used elsewhere (it is also in `NovaPoshtaBlock` for CMS pageBuilder). The delivery checkout route becomes a redirect.

---

## Sources

### Primary (HIGH confidence — direct code inspection)
- `/src/entities/checkout/ui/CheckoutStepper.tsx` — step structure, step types
- `/src/features/checkout/api/getCompletedSteps.ts` — step completion logic
- `/src/features/novaPoshta/ui/NovaPoshtaButton.tsx` — geolocation widget implementation
- `/src/features/order/ui/OrderStatusBadge.tsx` — current badge implementation
- `/src/entities/order/api/getCustomerOrders.ts` — external API shape, status strings
- `/src/entities/product/ui/AddToCartButton.tsx` — add to cart flow, onSuccess pattern
- `/src/shared/store/use-cart-ui-store.ts` — openCart/closeCart store
- `/src/features/header/cart/ui/CartSheetController.tsx` — cart sheet open/close wiring
- `/src/features/product/quick-buy/ui/QuickBuyModal.tsx` — quick order form with phone field
- `/src/features/product/ui/PriceSubscribeModal.tsx` — price subscribe modal
- `/src/features/product/api/subscribe-price.ts` — external price API call
- `/src/widgets/product-view/ui/ProductInfo.tsx` — "стежити за ціною" button location
- `/src/features/product/ui/ProductSessionView.tsx` — related products fetch flow
- `/src/entities/product/api/get-related-products.ts` — current related products API
- `/src/entities/product/api/getNewProductsFiller.ts` — filler pattern (model for SKU search)
- `/src/features/cart/ui/DiscountCodeInput.tsx` — discount input component
- `/src/entities/cart/api/update-discount-codes.ts` — Shopify discount code mutation
- `/src/features/checkout/receipt/ui/OrderSummary.tsx` — receipt sidebar (no discount input)
- `/src/widgets/footer/ui/Footer.tsx` — phone rendering from i18n
- `/src/entities/announcement-bar/announcement-bar.tsx` — telephone + viber from Sanity
- `/src/shared/sanity/schemaTypes/blocks/info-bar.ts` — Sanity infoBar schema
- `/src/features/header/navigation/ui/Navigation.tsx` — navigation menu rendering
- `/src/shared/sanity/schemaTypes/blocks/brendGrid.ts` — brand grid CMS schema
- `/src/entities/home/ui/BrendGrid/BrendGrid.tsx` — brand grid rendering
- `/messages/uk.json` — i18n keys for phone, checkout steps, order status
- `/src/features/checkout/payment/ui/Payment.tsx` — shipping fee calculation (20 + 2%)

### Key Architectural Decision Constraints (from project decisions log)
- Phase 1: Server actions and client handlers must not use `console.log`; `console.error` only in catch blocks
- Phase 3: `AddToCartButton.onSuccess` called after `result.success` only
- Phase 3: `CartSheetController` uses children pattern + `useCartUIStore` — correct pattern to follow
- Phase 3: Viber phone resolution: Sanity `viberPhone` → `VIBER_PHONE_NUMBER` env → null

---

## Metadata

**Confidence breakdown:**
- Checkout delivery removal: HIGH — all files identified, logic is clear
- Order status badge colors: HIGH — external API status strings confirmed from `getCustomerOrders.ts`
- Cart auto-open: HIGH — `useCartUIStore` + `AddToCartButton` integration point is clear
- Quick order country code: HIGH — `defaultValues` pattern is trivial
- Related products by SKU: HIGH — Shopify SKU search query pattern is standard
- Discount code in checkout: HIGH — `DiscountCodeInput` + `OrderSummary` integration is straightforward
- Phone/Viber: HIGH — AnnouncementBar already has Viber icon; only CMS data update needed for announcement bar
- Brand logos: HIGH — CMS content task, existing code handles it
- Navigation menu: HIGH — Shopify admin task, no code changes expected
- NP widget fix: HIGH — bugs identified (console.error calls + debug log)
- "Стежити за ціною" test: HIGH — full implementation exists, test is functional verification

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (stable codebase, no fast-moving dependencies)
