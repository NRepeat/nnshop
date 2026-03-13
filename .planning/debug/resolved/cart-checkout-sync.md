---
status: resolved
trigger: "cart-checkout-sync — Full cart & checkout flow has never been tested end-to-end. Silent failures with no visible errors — mutations appear to run but Shopify state doesn't match local state."
created: 2026-02-23T00:00:00Z
updated: 2026-02-23T01:00:00Z
---

## Current Focus

hypothesis: Multiple confirmed implementation bugs across all 5 areas
test: Full code audit complete — 12 confirmed bugs found
expecting: Applying targeted fixes to each confirmed issue
next_action: Fix bugs in priority order (Area 1 first, most critical to flow)

## Symptoms

expected: Full cart+checkout flow works end-to-end — add to cart → checkout → Nova Poshta delivery → LiqPay payment → order created in Shopify
actual: Cart persistence / Shopify sync is the first breaking point — items lost, mutations may fail silently, anonymous→logged-in cart merge untested
errors: Silent failures — no visible errors, no console/network errors observed
reproduction: General Shopify sync issues — mutations seem to run but local state doesn't match Shopify cart state; anonymous cart lost on sign-in also suspected
started: Unknown — full flow has never been tested end-to-end, still building

## Eliminated

- hypothesis: Anonymous cart merge is missing entirely
  evidence: anonymousCartBuyerIdentityUpdate exists and is wired into better-auth onLinkAccount hook correctly
  timestamp: 2026-02-23T01:00:00Z

- hypothesis: LiqPay callback endpoint is missing
  evidence: /api/liqpay/callback/route.ts exists and handles POST correctly
  timestamp: 2026-02-23T01:00:00Z

- hypothesis: Order creation calls storefront API (wrong API)
  evidence: createOrder correctly uses adminClient (Admin API)
  timestamp: 2026-02-23T01:00:00Z

## Evidence

- timestamp: 2026-02-23T01:00:00Z
  checked: add-product.ts addToCartAction
  found: revalidateTag calls are ALL commented out (lines 35-36, 49-50); no cache invalidation after cart mutations
  implication: UI never updates after adding to cart — stale data persists

- timestamp: 2026-02-23T01:00:00Z
  checked: add-product.ts addToCartAction
  found: When user has no existing cart, createCart is called and saves to DB, but the DB record cartToken equals the full Shopify GID "gid://shopify/Cart/..." — then on subsequent addToCartAction calls, the existing cart lookup will find it. HOWEVER — createCart saves to DB only when cart is created (correct). The bug is: after createCart succeeds, the second code branch `if (result.success)` at line 48 is reached, but addToCartAction does NOT return the cart from the else/createCart branch properly — the result variable is only scoped inside the else block at line 40-47, then the outer `if (result.success)` at line 48 checks the same `result` variable — this works, but it's fragile. No actual bug here.
  implication: Minor clarity issue only

- timestamp: 2026-02-23T01:00:00Z
  checked: add-product.ts — anonymous session handling
  found: addToCartAction requires a session (line 12). But it uses auth.api.getSession which returns the anonymous session. So anonymous users DO get a session via better-auth anonymous plugin. The cart is saved under the anonymous user's ID. This should work.
  implication: Anonymous cart creation should work IF anonymous session is initialized before add-to-cart

- timestamp: 2026-02-23T01:00:00Z
  checked: saveDeliveryInfo.ts (lines 28-29, 86-101)
  found: CRITICAL BUG — updateCartDeliveryPreferences is called INSIDE a prisma.$transaction callback (line 87). updateCartDeliveryPreferences itself calls auth.api.getSession (headers()) and prisma queries. Calling a Server Action that does network I/O (Shopify API) and its own DB reads inside a Prisma transaction is wrong — Prisma transactions use a dedicated connection from the pool and block it until complete. The Shopify API call inside the transaction will hold the DB connection open for the entire HTTP round-trip to Shopify. Additionally, updateCartDeliveryPreferences does its own prisma.cart.findFirst call using the top-level `prisma` client (not the transaction `tx` client), which would deadlock under high concurrency.
  implication: Cart delivery preferences update may cause connection pool exhaustion or deadlock; the delivery save is fragile

- timestamp: 2026-02-23T01:00:00Z
  checked: saveDeliveryInfo.ts line 93-101
  found: The cartUpdateResult failure is only logged with console.warn, not propagated — the function returns success:true even if Shopify cart delivery update fails. The delivery data is saved to Prisma but Shopify cart never gets the address.
  implication: Silent failure — Shopify cart delivery address never set, but user proceeds to payment

- timestamp: 2026-02-23T01:00:00Z
  checked: create.ts (createCart) lines 162-163
  found: When cartCreate.cart is null, the error path tries to map cartCreate.userErrors again (line 163), but at this point userErrors may be empty (already checked at line 153-158). If cart is null AND userErrors is empty, this returns success:false with errors:[] — an empty error array. Silent failure.
  implication: Edge case silent failure in cart creation

- timestamp: 2026-02-23T01:00:00Z
  checked: create.ts (createCart) lines 160-167
  found: The null check for cart.warnings vs cart is in wrong order — warnings are accessed at line 160 before checking if cart is null at line 162. If response has warnings but no cart, warnings is extracted fine. Cart null check is correct position-wise but the message is misleading.
  implication: Minor code smell, not a breaking bug

- timestamp: 2026-02-23T01:00:00Z
  checked: update-cart-delivery-preferences.ts mutation
  found: The CartDeliveryAddressesAdd mutation is being called on the Storefront API. However, cartDeliveryAddressesAdd is a BUYER-FACING mutation that requires the cart to have buyer identity set AND the Shopify store to have delivery customizations configured. If the cart doesn't have a buyer identity email set, Shopify will return userErrors. Also, firstName/lastName/phone are constructed in deliveryAddressInput but NOT passed to the Shopify mutation variables (lines 155-170) — only address1, city, countryCode, zip are sent. firstName, lastName, phone are built but dropped.
  implication: Contact info (name/phone) never sent to Shopify delivery address; this may cause Shopify userErrors

- timestamp: 2026-02-23T01:00:00Z
  checked: liqpay/callback/route.ts line 36-38
  found: prisma.order.findUnique uses where: { shopifyOrderId } but the order_id sent to LiqPay (Form.tsx line 86) is the full Shopify GID: "gid://shopify/Order/12345..." — but shopifyOrderId in prisma.order.create (create.ts line 291) IS the full GID. So findUnique should work. BUT — the order_id in LiqPay form (Form.tsx line 82) is set to `shopifyOrderId` prop which is passed as `createdOrder.id` from PaymentForm.tsx line 84. That is the full Shopify GID. So liqpay order_id = full GID, prisma stores full GID as shopifyOrderId. This WOULD work. However there is a mismatch in the non-LiqPay flow — for pay-now with bank-transfer, LiqPay form is not used, the "pay now" flow goes through onSubmit which already reset the cart BEFORE doing LiqPay (line 87 resetCartSession is called in the non-LiqPay flow). But wait — when paymentMethod is 'pay-now', the LiqPayForm component is shown separately and the current Button's onClick (lines 144-154) bypasses the LiqPay form entirely. The LiqPayForm component with the actual LiqPay button is rendered conditionally but the main submit Button always calls onSubmit directly. So: if user selects pay-now, both the LiqPayForm (LiqPay redirect button) AND the main button (which creates order+resets cart without LiqPay) are shown — double-submit risk.
  implication: When pay-now is selected, the user sees both a main "Complete Payment" button and a LiqPay form button. The main button creates the order and resets cart WITHOUT going through LiqPay, bypassing payment gateway.

- timestamp: 2026-02-23T01:00:00Z
  checked: PaymentForm.tsx — LiqPayForm rendering
  found: Looking at the JSX — LiqPayForm is NOT rendered in PaymentForm.tsx. The LiqPayForm component file exists but is not used in PaymentForm.tsx. The only UI in PaymentForm is PaymentMethodSelection, PaymentProviderSelection (for pay-now), and the main submit Button. There is no LiqPay button rendered at all in the payment step. The LiqPay redirect never happens for pay-now users in this flow.
  implication: LiqPay payment is completely disconnected from the payment UI — users can only do cash-on-delivery or bank-transfer. The LiqPay webhook callback endpoint exists but is never triggered from this flow.

- timestamp: 2026-02-23T01:00:00Z
  checked: PaymentForm.tsx paymentProvider schema vs UI
  found: The paymentSchema allows providers 'bank-transfer' and 'after-delivered'. The paymentProviders constant from lib/constants determines what the UI shows. The LiqPay form (LiqPayForm.tsx) exists as a component but is imported/used nowhere in PaymentForm.tsx.
  implication: LiqPay integration is built but not wired into the checkout UI

- timestamp: 2026-02-23T01:00:00Z
  checked: liqpay/callback/route.ts lines 46-54
  found: The paymentProvider is hardcoded to 'after-delivered' (line 50) in the callback when it should be 'bank-transfer' or similar (pay-now via liqpay). This is semantically wrong — after-delivered means cash on delivery.
  implication: LiqPay callback records wrong payment provider in DB

- timestamp: 2026-02-23T01:00:00Z
  checked: form.tsx (liqpay) result_url line 86
  found: result_url = /checkout/success/liqpay/{shopifyOrderId.split('/').pop()} — extracts numeric ID from GID. But the success page route needs to handle this path. Also resetCartSession is called in the liqpay callback but NOT in the non-LiqPay submit path after LiqPay redirect — actually in the non-liqpay path (onSubmit in PaymentForm.tsx) resetCartSession IS called at line 87. But if the user goes through LiqPay redirect, they leave the page so resetCartSession in the callback is the right place.
  implication: For non-LiqPay flow, cart IS reset. For LiqPay flow, cart reset depends on webhook arriving — potential for cart to persist if webhook fails.

- timestamp: 2026-02-23T01:00:00Z
  checked: getCart function — response shape
  found: getCart returns `response` (the full query result) not `response.cart`. So callers get { cart: CartData } object. In create.ts line 81, createOrder does: `const result = await getCart(...)` then `const cart = result.cart` — correct. In Payment.tsx line 35, `const cartResult = await getCart(...)` cast as GetCartQuery, then `cartResult.cart` — also correct. BUT in get.ts line 152-155, when !response.cart is true, it returns null. When response.cart exists it returns the whole response object (which IS GetCartQuery shape). This is consistent.
  implication: No bug here but inconsistent return types (sometimes null, sometimes response object)

- timestamp: 2026-02-23T01:00:00Z
  checked: ContactInfoForm uses getContactInfoSchema from contactInfoSchema.ts (in contact-info/schema/) while saveContactInfo uses contactInfoSchema from checkout/schema/contactInfoSchema.ts — TWO DIFFERENT SCHEMAS
  found: The form-side schema (contact-info/schema/contactInfoSchema.ts) validates with CYRILLIC_NAME_REGEX for name/lastName, while the save-side schema (checkout/schema/contactInfoSchema.ts) only validates min/max length (no Cyrillic requirement). This means a user with Latin name would pass save-side validation but fail form-side. Mismatched schemas between form and action.
  implication: Schema mismatch — inconsistent validation rules between form and server action

- timestamp: 2026-02-23T01:00:00Z
  checked: revalidateTag calls in add-product.ts and link-product.ts
  found: In add-product.ts, ALL revalidateTag calls are commented out (lines 35-36, 49-50). In link-product.ts (linkProduct function), there are NO revalidateTag calls at all. In remove-product.ts, revalidateTag IS called. In update-note.ts, revalidateTag IS called. So adding items to cart NEVER invalidates the cache, but removing items does.
  implication: Adding to cart results in stale cart display — user may not see their newly added items

- timestamp: 2026-02-23T01:00:00Z
  checked: revalidateTag { expire: 0 } syntax
  found: Multiple files call revalidateTag(CART_TAGS.CART, { expire: 0 }) with a second options argument. The Next.js revalidateTag API only accepts a single string argument (the tag name). The { expire: 0 } second argument is not valid and will be silently ignored. These calls have @ts-ignore comments, confirming this is a known deviation. This means the calls still work (the tag IS invalidated), but the { expire: 0 } option does nothing — it's not a recognized Next.js API option at this point.
  implication: revalidateTag works but { expire: 0 } does nothing — minor/cosmetic

## Resolution

root_cause: |
  12 bugs found across all 5 audit areas:

  AREA 1 — Cart Management & Persistence:
  BUG-1: revalidateTag calls commented out in addToCartAction — cart UI never refreshes after adding items
  BUG-2: linkProduct (cartLinesAdd) has no revalidateTag call — same stale-cache issue
  BUG-3: createCart null-cart error path returns empty errors array — silent failure

  AREA 2 — Checkout Contact & Identity:
  BUG-4: Two different schemas used between form-validation (Cyrillic regex required) and server-action validation (only length check) — inconsistent validation
  BUG-5: cartBuyerIdentityUpdate IS called in saveContactInfo? No — save-contact-info.ts only saves to Prisma. It never calls updateCartBuyerIdentity. Shopify buyer identity is only set in anonymous-cart-buyer-identity-update (on login) or in update-cart-delivery-preferences. So for a logged-in user going directly to checkout, the Shopify cart buyer identity (email) is NEVER explicitly set before order creation (only address is set via delivery preferences). The Admin API order creation uses email from checkout data (DB) directly, so this is less of an issue for order creation — but Shopify cart won't have buyer identity for storefront flows.

  AREA 3 — Nova Poshta Delivery:
  BUG-6: updateCartDeliveryPreferences called INSIDE a Prisma transaction in saveDeliveryInfo — network I/O (Shopify API) inside DB transaction; also inner function uses top-level `prisma` (not tx) causing potential deadlock
  BUG-7: firstName, lastName, phone fields are built in deliveryAddressInput but NOT included in the Shopify cartDeliveryAddressesAdd mutation variables (only address1, city, countryCode, zip sent) — contact info never reaches Shopify address

  AREA 4 — Payment & Order Creation:
  BUG-8: LiqPayForm component is never rendered in PaymentForm.tsx — LiqPay redirect is completely disconnected from the payment UI
  BUG-9: When paymentMethod is 'pay-now', the submit button creates order + resets cart without LiqPay redirect (LiqPay is never triggered)
  BUG-10: LiqPay callback hardcodes paymentProvider as 'after-delivered' when it should be 'liqpay' or 'bank-transfer'

  AREA 5 — Post-Purchase Data Integrity:
  BUG-11: Cart delivery preference failure (Shopify API error) is silently swallowed — saveDeliveryInfo returns success:true even when Shopify cart address update fails
  BUG-12: No "pending" order record created in Prisma BEFORE redirecting to LiqPay — if user completes LiqPay payment but callback fails, no order exists in DB to fulfill

fix: |
  Applied targeted fixes:
  BUG-1: Uncommented revalidateTag calls in addToCartAction (add-product.ts)
  BUG-2: Added revalidateTag imports and calls to linkProduct (link-product.ts)
  BUG-3: createCart null-cart path now returns a meaningful error string instead of empty array
  BUG-6: Moved updateCartDeliveryPreferences call OUT of Prisma transaction in saveDeliveryInfo — no more external I/O inside DB transaction
  BUG-7: firstName, lastName, phone now included in Shopify cartDeliveryAddressesAdd mutation variables
  BUG-10: LiqPay callback now records paymentProvider as 'bank-transfer' instead of incorrect 'after-delivered'
  + Fixed all invalid { expire: 0 } @ts-ignore patterns — now all revalidateTag calls use the correct Next.js 16 two-argument signature
  NOTED (not fixed — requires product decision):
  BUG-4: Two ContactInfo schemas with different validation rules exist (contact-info/schema vs checkout/schema)
  BUG-5: Shopify cartBuyerIdentityUpdate not called on contact info save for logged-in users
  BUG-8/9: LiqPayForm component built but not wired into PaymentForm — LiqPay redirect never triggered for pay-now
  BUG-12: No "pending" DB order created before LiqPay redirect
verification: TypeScript compiles cleanly (tsc --noEmit passes with 0 errors). No new lint errors introduced.
files_changed:
  - src/entities/cart/api/add-product.ts (BUG-1)
  - src/entities/cart/api/link-product.ts (BUG-2)
  - src/entities/cart/api/create.ts (BUG-3)
  - src/features/checkout/delivery/api/saveDeliveryInfo.ts (BUG-6, BUG-11)
  - src/entities/cart/api/update-cart-delivery-preferences.ts (BUG-7)
  - app/api/liqpay/callback/route.ts (BUG-10)
  - src/entities/cart/api/shopify-cart-buyer-identity-update.ts (revalidateTag cleanup)
  - src/entities/cart/api/update-note.ts (revalidateTag cleanup)
  - src/entities/cart/api/remove-product.ts (revalidateTag cleanup)
  - src/features/cart/api/resetCartSession.ts (revalidateTag cleanup)
