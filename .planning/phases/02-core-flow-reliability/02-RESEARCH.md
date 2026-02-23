# Phase 2: Core Flow Reliability - Research

**Researched:** 2026-02-23
**Domain:** Cart merge reliability, order creation resilience, Prisma transactions, structured error handling
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Cart Merge Conflict Resolution
- When both anonymous and authenticated carts exist on login: **merge both** — combine all items, summing quantities for duplicate products
- If Shopify cart merge API fails: **retry automatically, up to 3 times** with exponential backoff
- If all retries fail: **full rollback** — both carts remain intact, nothing is changed, no orphaned state
- Race condition (checkout triggered before merge completes): **block checkout** with a disabled button + spinner until merge finishes

#### Transactions
- Account linking DB operations (contact info, delivery info, payment info, orders, favorites): **all-or-nothing** — wrap in a single Prisma transaction; if any step fails, roll back entirely
- Prisma transaction results currently accessed by array index: **fix silently** — use named destructuring instead (no behavior change, just safe)
- If a Prisma transaction fails: **propagate the error up** — user sees an error and can retry; no silent partial state

#### Shopify API Retry Behavior
- For interactive flows (cart operations, login): **retry once** on transient errors (502/503), then surface the error to the user
- No silent multi-retry for interactive paths — user waits too long without feedback

#### Error UX — What Users See
- Order succeeds in Shopify but DB save fails: **show success** — order is confirmed, DB failure logged with full context via `console.error`
- Email delivery fails after successful order: **show success** — email failure logged silently, user is not alarmed by a third-party failure
- Cart merging after login: **checkout button shows spinner/disabled state** — non-blocking, clear that something is happening
- Cart merge fails after all retries: **toast notification** — "Couldn't sync your cart. Your items are still saved." Non-blocking, reassuring

#### Observability for Silent Failures
- Phase 2 approach: structured `console.error` with full context (orderId, userId, step name, error message) at every silent failure point
- Sentry installation deferred to Phase 5 (scoped as the observability phase) — Phase 5 will upgrade these `console.error` calls to `Sentry.captureException()`

### Claude's Discretion
- Exact toast notification component to use (assume existing shadcn/ui toast or sonner)
- Specific retry timing / backoff intervals for the 3-retry cart merge path
- Exact error log structure (as long as orderId, userId, step, and error are all present)

### Deferred Ideas (OUT OF SCOPE)
- Sentry installation and configuration — Phase 5 (Observability & Scaling)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BUG-05 | Checkout does not enter broken state when user adds items and checks out rapidly (defensive null-check hardening) | Cart page and checkout button analysis: rapid checkout hits null cart edge case when merge is in-flight; fix is null-guard on cart.delivery.addresses before calling `.find()` in `create.ts` line 208, and disabling checkout button during merge |
| RELY-01 | Cart merge flow logs each step's success/failure, uses idempotency keys, and rolls back database state if Shopify API call fails | Current `anonymousCartBuyerIdentityUpdate` has no step logging, no rollback on Shopify failure, no idempotency. Research identifies Prisma transaction pattern for rollback; structured step logging pattern documented |
| RELY-02 | Order creation function uses compensating transactions so partial failures (Shopify succeeds, email fails) don't leave orphaned orders; has retry logic for idempotent operations | `createOrder` in `src/features/order/api/create.ts` + `PaymentForm.tsx` call chain: email via eSputnik `sendEvent` throws — currently unhandled in the chain; fix: wrap email in try/catch, log failure, treat success independently |
| RELY-03 | Account linking uses named result destructuring from Promise.allSettled (no hardcoded indices) and performs database updates transactionally | `auth.ts` line 78: `Promise.allSettled([...])` result is never destructured at all (result is thrown away). `on-link-account.ts` already uses `prisma.$transaction`. Fix: capture result, check `.status === 'rejected'`, log failures by name |
| PERF-02 | Cart merge flow fetches cart data exactly once from Shopify and reuses it; no duplicate API calls during login | Current `anonymousCartBuyerIdentityUpdate` calls `getShopifyCartLines(anonCartRecord.cartToken)` for the anon cart, but then `updateShopifyBuyerIdentity` makes a second Shopify call for buyer identity. Both use the same cart data path. Fix: fetch once, pass result to both operations |
</phase_requirements>

---

## Summary

Phase 2 targets five specific reliability gaps across three interconnected flows: cart merge on login, order creation at checkout, and account data linking. All code under scope already exists — this phase is surgical hardening, not feature development.

The cart merge function (`anonymousCartBuyerIdentityUpdate`) is the highest-risk item. It makes multiple Shopify API calls, performs Prisma mutations without transactions, and currently swallows all errors silently. The success criteria requires: exactly one Shopify cart-data fetch, structured step logging, and full DB rollback if any Shopify call fails. The Prisma `$transaction` pattern with a nested async callback already used elsewhere in the codebase is the right model.

The order creation path (`createOrder` in `src/features/order/api/create.ts`) has a separate concern: email delivery (via eSputnik `sendEvent`) is not currently part of this function — but the calling code in `PaymentForm.tsx` calls `resetCartSession()` after `createOrder()`, and any email would be sent separately. The RELY-02 requirement is about ensuring DB save failure after Shopify success still results in a user-visible success state. Currently, `prisma.order.create` is called without a try/catch wrapper around just that step — if it throws, the outer catch returns `success: false`, which shows the user an error even though the Shopify order exists. The fix is to catch DB failures separately, log them, and return success anyway.

**Primary recommendation:** Use Prisma `$transaction` for all cart merge DB mutations, add structured `console.error` step logging at each Shopify call boundary, fix the single cart-fetch duplication by passing cart data as a parameter, and wrap the DB-save step in `createOrder` in an isolated try/catch that logs but does not propagate.

---

## Standard Stack

### Core (all already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Prisma | ^7.0.0 | ORM + transaction management | Already in use; `$transaction` is the standard pattern for atomic multi-step DB ops |
| better-auth | ^1.3.27 | Auth + `anonymous` plugin with `onLinkAccount` hook | Already in use; hook is the correct integration point for cart merge |
| sonner | ^2.0.7 | Toast notifications | Already imported in `PaymentForm.tsx`; use `toast()` for cart merge failure UX |
| Zod v4 | ^4.1.12 | Schema validation | Already in use; use for validating merge input shape if needed |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `uuid` (v4) | Already available via `generateOrderId.ts` | Idempotency keys | Use for dedup key on Shopify cart merge operations |
| `tryCatch` utility | `src/shared/lib/try-catch.ts` | Result-type wrapper | Use for wrapping Shopify calls to avoid try/catch nesting |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Prisma `$transaction` | Manual rollback logic | `$transaction` is atomic and handles rollback automatically; manual rollback is error-prone |
| `sonner` toast | shadcn/ui `useToast` | `sonner` is already imported in PaymentForm; consistent to use the same system |
| Named step logging | Generic `console.error` | Named step logging (with `step` field) is required per CONTEXT.md to enable Phase 5 Sentry upgrade |

**Installation:** No new packages required. All libraries already installed.

---

## Architecture Patterns

### Recommended Project Structure (no changes needed)

The existing FSD structure is correct. Changes are within existing files:

```
src/
  entities/cart/api/
    anonymous-cart-buyer-identity-update.ts   # RELY-01, PERF-02 — primary target
  features/
    auth/lib/
      auth.ts                                 # RELY-03 — Promise.allSettled result handling
      on-link-account.ts                      # RELY-03 — already transactional, verify logging
    cart/api/
      resetCartSession.ts                     # already transactional, no changes needed
    order/api/
      create.ts                               # RELY-02 — isolate DB save failure
    checkout/payment/ui/
      PaymentForm.tsx                         # BUG-05 — checkout button disabled during merge
```

### Pattern 1: Prisma Transaction for Cart Merge Rollback (RELY-01)

**What:** Wrap all Prisma mutations inside `prisma.$transaction(async (tx) => { ... })`. If any step throws, Prisma rolls back all mutations atomically.

**When to use:** Any sequence of DB writes where partial success would leave orphaned state.

**Example (based on existing `on-link-account.ts` pattern — already used in codebase):**

```typescript
// Pattern already established in src/features/auth/lib/on-link-account.ts
await prisma.$transaction(async (tx) => {
  // Step 1: read anon cart
  const anonCart = await tx.cart.findFirst({ where: { userId: anonymousUserId, completed: false } });
  if (!anonCart) return; // no-op is safe

  // Step 2: read user cart
  const userCart = await tx.cart.findFirst({ where: { userId: newUserId, completed: false } });

  // Step 3: update references — if this throws, steps 1+2 are rolled back
  if (userCart) {
    await tx.cart.update({ where: { id: userCart.id }, data: { cartToken: mergedCartToken } });
    await tx.cart.delete({ where: { id: anonCart.id } });
  } else {
    await tx.cart.update({
      where: { id: anonCart.id },
      data: { userId: newUserId, cartToken: finalCartToken },
    });
  }
});
```

**Key constraint:** Shopify API calls MUST happen BEFORE entering the transaction. Prisma transactions have a timeout (default 5s); network calls inside a transaction will cause timeout failures.

### Pattern 2: Structured Step Logging (RELY-01, RELY-02, RELY-03)

**What:** Every silent failure logs a structured object with required fields: `step`, `userId`, `orderId` (where applicable), `error`.

**When to use:** At every catch boundary where we cannot surface the error to the user.

```typescript
// Shape required by CONTEXT.md for Phase 5 Sentry upgrade compatibility
console.error('[cart-merge] step failed', {
  step: 'shopify-cart-lines-add',
  userId: newUser.user.id,
  anonUserId: anonymousUser.user.id,
  error: error instanceof Error ? error.message : String(error),
});
```

### Pattern 3: Single Shopify Fetch, Pass Data Down (PERF-02)

**What:** Fetch Shopify cart data once at the top of the function, pass the result to helper functions as a parameter instead of re-fetching.

**Current problem:** `getShopifyCartLines(anonCartRecord.cartToken)` fetches anon cart lines. Then `updateShopifyBuyerIdentity(finalCartToken, email)` makes a second call. These are different operations (read vs. write), but both can be orchestrated from one top-level fetch.

**Fix:** Fetch anon cart lines once at the start. Pass `anonLines` directly to the merge logic. The buyer identity update is a separate mutation (write), so it is already a distinct operation — the duplication is in the anon cart READ being repeated when the cart token changes.

```typescript
// Fetch once at the top
const anonLines = await getShopifyCartLines(anonCartRecord.cartToken);

// Pass to merge step — no re-fetch
const mergedCartId = anonLines.length > 0
  ? await addLinesToCart(userCartRecord.cartToken, linesToAdd)
  : null;
```

### Pattern 4: Isolating DB Save Failure in createOrder (RELY-02)

**What:** The Shopify order creation (external, irreversible) and the DB record creation are two separate concerns. DB save failure must not roll back the user-facing success state.

**When to use:** Any time an external side effect (Shopify order, email) succeeds but a local DB write fails.

```typescript
// After Shopify order succeeds:
const shopifyOrderId = createdOrder.id;

// DB save is best-effort — failure is logged, not propagated
try {
  await prisma.order.deleteMany({ where: { userId: session.user.id, draft: true } });
  await prisma.order.create({
    data: { shopifyOrderId, orderName: createdOrder.name, userId: session.user.id, draft: false },
  });
} catch (dbError) {
  console.error('[create-order] DB save failed after Shopify success', {
    step: 'prisma-order-create',
    userId: session.user.id,
    orderId: shopifyOrderId,
    error: dbError instanceof Error ? dbError.message : String(dbError),
  });
  // Do NOT re-throw — Shopify order exists, user must see success
}

return { success: true, order: createdOrder };
```

### Pattern 5: Promise.allSettled with Named Result Checking (RELY-03)

**What:** `Promise.allSettled` returns an array of `{ status: 'fulfilled' | 'rejected', value/reason }`. The current code discards all results. Fix: capture results, check each by position using a named variable.

```typescript
// In src/features/auth/lib/auth.ts onLinkAccount handler
const [cartMergeResult, dataLinkResult] = await Promise.allSettled([
  anonymousCartBuyerIdentityUpdate({ anonymousUser, newUser }),
  linkAnonymousDataToUser({
    anonymousUserId: anonymousUser.user.id,
    newUserId: newUser.user.id,
  }),
]);

if (cartMergeResult.status === 'rejected') {
  console.error('[onLinkAccount] cart merge failed', {
    step: 'anonymous-cart-buyer-identity-update',
    userId: newUser.user.id,
    error: cartMergeResult.reason instanceof Error
      ? cartMergeResult.reason.message
      : String(cartMergeResult.reason),
  });
}

if (dataLinkResult.status === 'rejected') {
  console.error('[onLinkAccount] data link failed', {
    step: 'link-anonymous-data-to-user',
    userId: newUser.user.id,
    error: dataLinkResult.reason instanceof Error
      ? dataLinkResult.reason.message
      : String(dataLinkResult.reason),
  });
}
```

### Pattern 6: Cart Merge Retry with Exponential Backoff (RELY-01)

**What:** The Shopify cart lines add (`cartLinesAdd` mutation) is retried up to 3 times on 502/503. The existing `StorefrontClient.retryWithBackoff` already handles this at the HTTP level. The application-level retry (decided: 3 retries for cart merge) must be distinct — it retries the entire merge operation, not just HTTP errors.

**Decision from CONTEXT.md:** Interactive flows (login) retry **once** on transient errors. The 3-retry path is for the cart merge specifically (not a general interactive flow — it's background during login). After 3 failures, rollback and show toast.

**Key constraint:** The `StorefrontClient` already has 3-retry with backoff at the HTTP level. Application-level retry should be a thin wrapper that calls the Shopify function up to N times:

```typescript
async function withRetry<T>(
  fn: () => Promise<T | null>,
  maxAttempts: number,
  baseDelayMs: number,
): Promise<T | null> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await fn();
    if (result !== null) return result;
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, baseDelayMs * attempt));
    }
  }
  return null;
}
```

### Anti-Patterns to Avoid

- **Shopify calls inside Prisma `$transaction`:** Prisma transactions have a 5-second default timeout. Network I/O inside a transaction will exhaust it. Always do Shopify calls first, then enter the transaction with the results.
- **Swallowing `Promise.allSettled` results:** The entire point of `allSettled` (vs. `all`) is to handle partial failures. Discarding the result array means failures are invisible.
- **Re-throwing DB errors after external success:** If Shopify order already exists, throwing a DB error to the user is misleading and prevents the success flow. Log and continue.
- **Multiple Shopify reads for the same data:** Each Shopify API call has latency. Fetch cart lines once and pass the data down — don't re-fetch in each helper function.
- **Silent toast on cart merge failure without rollback:** A toast that says "items are still saved" is only truthful if the rollback actually preserved both carts. The rollback must happen before the toast fires.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Atomic multi-step DB writes | Manual rollback sequences | `prisma.$transaction(async tx => {...})` | Prisma handles ACID rollback; manual rollback misses edge cases (process crash mid-rollback) |
| Toast notifications | Custom modal/alert UI | `sonner` (`toast()`) — already in PaymentForm | Already imported; consistent DX across checkout flow |
| Result-type error handling | Nested try/catch | `tryCatch` utility at `src/shared/lib/try-catch.ts` | Already exists in codebase; use for Shopify call wrappers |
| HTTP retry logic | Custom retry loop in application code | `StorefrontClient.retryWithBackoff` | Already handles 502/503/ETIMEDOUT/ECONNRESET at HTTP layer; don't duplicate |

**Key insight:** The codebase already has the right primitives. Phase 2 is about wiring them together correctly, not adding new infrastructure.

---

## Common Pitfalls

### Pitfall 1: Shopify Calls Inside Prisma Transactions

**What goes wrong:** `prisma.$transaction` starts a PostgreSQL transaction. If a Shopify HTTP call inside takes > 5 seconds (default `transactionOptions.timeout`), Prisma throws `Transaction timeout` and the transaction is rolled back — but the Shopify call may have already succeeded, leaving Shopify state ahead of DB state.

**Why it happens:** Developers conflate "transaction" (DB-level) with "atomic operation" (application-level). Network I/O is incompatible with short-lived DB transactions.

**How to avoid:** Always perform Shopify API calls BEFORE opening the Prisma transaction. Pass results in as local variables.

**Warning signs:** Any `await someShopifyFunction()` call that appears between `prisma.$transaction(async (tx) => {` and the closing `})`.

### Pitfall 2: Promise.allSettled Returning Stale Results After Fix

**What goes wrong:** After fixing the `allSettled` result destructuring, a developer might add logging but forget that `on-link-account.ts` (the second promise) catches its own errors internally and never rejects. This means `dataLinkResult.status` will always be `'fulfilled'` even when the data link fails silently.

**Why it happens:** `linkAnonymousDataToUser` wraps its `prisma.$transaction` in a try/catch that logs the error and returns `undefined` — it never re-throws. `Promise.allSettled` sees a fulfilled promise.

**How to avoid:** RELY-03 requires the transaction to propagate errors up. Remove the internal catch in `linkAnonymousDataToUser` (or re-throw after logging), so `allSettled` can actually detect failure. The CONTEXT.md decision is: "If a Prisma transaction fails: propagate the error up."

**Warning signs:** `linkAnonymousDataToUser` has a `catch (error) { console.error(...) }` with no `throw` — this silently absorbs failures that `allSettled` should see.

### Pitfall 3: Cart Merge Rollback Leaving Shopify and DB Inconsistent

**What goes wrong:** The rollback plan is "both carts remain intact." But if the Shopify `cartLinesAdd` mutation succeeded before the failure, the user's authenticated cart already has the anonymous cart's items added. Rolling back the DB (not calling `cart.delete`) means the anonymous cart DB record still exists, but Shopify has already merged the items. The next login attempt will add duplicates.

**Why it happens:** Shopify cart mutations are not transactional — you can't undo a `cartLinesAdd`.

**How to avoid:** The retry-and-rollback strategy is still correct for DB state. For Shopify state, document in code that the rollback is DB-only and that partial Shopify merges are an accepted edge case (items are not lost, just potentially duplicated in Shopify's view). Log this specifically: `step: 'shopify-merge-partial-success-db-rollback'`.

**Warning signs:** Assuming `prisma.$transaction` rollback also undoes Shopify mutations.

### Pitfall 4: BUG-05 Null Check Location

**What goes wrong:** The rapid-checkout null-check bug is in `createOrder` at `src/features/order/api/create.ts` line 208: `cart.delivery.addresses.find(a => a.selected)?.address`. If `cart.delivery` or `cart.delivery.addresses` is null/undefined (which can happen when cart was just created or merge is in-flight), this throws.

**Why it happens:** The Shopify cart `delivery` field is optional — it's only populated after a delivery address is set. A brand-new cart has `delivery: null`.

**How to avoid:** Null-check `cart.delivery` before calling `.addresses.find(...)`. Use optional chaining: `cart.delivery?.addresses?.find(a => a.selected)?.address`.

**Warning signs:** TypeScript may not catch this if the generated type marks `delivery` as non-null when the API schema allows null.

### Pitfall 5: Sonner Version API Differences

**What goes wrong:** `sonner` ^2.0.7 has API differences from v1. The `toast()` function signature and options changed.

**Why it happens:** `sonner` had a major version bump from v1 to v2.

**How to avoid:** Use the already-established pattern in `PaymentForm.tsx`: `toast.error(...)` and `toast.success(...)`. These work in v2. Don't use deprecated options like `toast.custom` patterns from v1 docs.

**Warning signs:** Referencing sonner v1 documentation for API shape.

---

## Code Examples

Verified patterns from codebase:

### Existing Prisma Transaction Pattern (from on-link-account.ts)

```typescript
// Source: src/features/auth/lib/on-link-account.ts
await prisma.$transaction(async (tx) => {
  // All reads and writes use `tx`, not `prisma`
  const existing = await tx.deliveryInformation.findMany({ where: { userId: newUserId } });
  await tx.contactInformation.deleteMany({ where: { userId: newUserId } });
  await tx.contactInformation.updateMany({
    where: { userId: anonymousUserId },
    data: { userId: newUserId },
  });
  // If any step throws, ALL are rolled back automatically
});
```

### Existing Sonner Toast Pattern (from PaymentForm.tsx)

```typescript
// Source: src/features/checkout/payment/ui/PaymentForm.tsx
import { toast } from 'sonner';

toast.error(orderResult.errors?.[0] || t('errorSavingPaymentInformation'));
toast.success(t('paymentInformationSaved'));
```

### Existing tryCatch Pattern (from src/shared/lib/try-catch.ts)

```typescript
// Source: src/shared/lib/try-catch.ts
const { data, error } = await tryCatch(
  storefrontClient.request({ query: GET_CART_QUERY, variables: { cartId } })
);
if (error) {
  console.error('[cart-merge] getShopifyCartLines failed', {
    step: 'shopify-get-cart',
    error: error.message,
  });
  return null;
}
```

### Null-Safe Cart Delivery Access (for BUG-05)

```typescript
// Safe pattern for optional delivery field in Shopify cart
// cart.delivery may be null for new/in-flight carts
const selectedDelivery = cart.delivery?.addresses?.find(a => a.selected)?.address;
const shippingAddress = {
  address1: selectedDelivery?.address1 || '',
  city: selectedDelivery?.city || '',
  // ... etc
};
```

### Structured Error Log Shape (required for Phase 5 Sentry upgrade)

```typescript
// Required shape per CONTEXT.md: { step, userId, orderId, error }
console.error('[cart-merge] Shopify cartLinesAdd failed after retries', {
  step: 'shopify-cart-lines-add',
  userId: newUser.user.id,
  anonUserId: anonymousUser.user.id,
  orderId: undefined,  // not applicable at cart merge stage
  error: error instanceof Error ? error.message : String(error),
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `prisma.$transaction([op1, op2, ...])` (array form) | `prisma.$transaction(async tx => {...})` (interactive form) | Prisma v4+ | Interactive form allows conditional logic inside transaction; array form does not |
| Throw on all failures | Compensating transactions for non-idempotent external calls | Architecture pattern | External API success + DB failure = log and continue, not throw |
| `toast` from shadcn/ui | `sonner` | Project choice | sonner is already used in PaymentForm.tsx; stick with it |

**Deprecated/outdated:**
- `prisma.$transaction([prisma.model.op1(), prisma.model.op2()])` (sequential array form): This form doesn't support conditional logic or reading results from earlier steps inside the transaction. Use the callback form instead. Prisma v7 supports both; use the callback form for cart merge.

---

## Open Questions

1. **Does `cart.delivery` ever return null from Shopify for a valid in-flight cart?**
   - What we know: The `delivery` field on `CartQuery` result is used in `createOrder` without a null check. The TypeScript generated types may mark it as required.
   - What's unclear: Whether the Shopify Storefront API guarantees `delivery` is always non-null, or whether it can be absent for freshly-created carts.
   - Recommendation: Add the optional chain (`cart.delivery?.addresses`) regardless. If the type doesn't allow it, cast or check the actual API schema. Defensive coding is correct here.

2. **Should cart merge be triggered client-side (Zustand/state) or server-side only?**
   - What we know: The current implementation is entirely server-side via `onLinkAccount` hook. BUG-05 asks for a disabled checkout button during merge.
   - What's unclear: How the client knows the merge is in-flight (the hook fires server-side with no client signal).
   - Recommendation: Add a brief client-side loading state on the checkout button triggered at login time (e.g., 1-2 second optimistic disable). The merge happens fast enough that a timed delay is acceptable. Alternatively, expose a cart merge status via a Zustand store atom set during the login flow. The simpler approach (brief disable + optimistic UX) is sufficient given the CONTEXT.md scope.

3. **Is `on-link-account.ts` marked `'use server'` intentionally?**
   - What we know: The file has `'use server'` at the top, but it is imported and called from `auth.ts` which is a server-only module (not a route handler).
   - What's unclear: Whether `'use server'` is needed or accidentally present. `'use server'` on a module (not a function) marks all exports as Server Actions.
   - Recommendation: Verify this doesn't cause unintended exposure. If it's a shared server utility (not a client-callable action), the directive may be unnecessary. Do not change it in Phase 2 unless it causes a concrete problem — it's out of scope.

---

## Sources

### Primary (HIGH confidence)

- Codebase analysis — `src/features/auth/lib/auth.ts`, `src/features/auth/lib/on-link-account.ts`, `src/entities/cart/api/anonymous-cart-buyer-identity-update.ts`, `src/features/order/api/create.ts`, `src/features/checkout/payment/ui/PaymentForm.tsx`, `src/shared/lib/clients/storefront-client.ts`, `src/features/cart/api/resetCartSession.ts`, `prisma/schema.prisma` — all read directly
- `package.json` — dependency versions confirmed: Prisma ^7.0.0, better-auth ^1.3.27, sonner ^2.0.7, Zod ^4.1.12, Next.js 16.1.0

### Secondary (MEDIUM confidence)

- Prisma `$transaction` interactive form behavior (callback vs array) — consistent with Prisma v5+ documentation; verified by existing usage in `on-link-account.ts` and `resetCartSession.ts`
- Prisma default transaction timeout of 5 seconds for interactive transactions — from Prisma documentation pattern; the specific default should be confirmed if transactions are expected to be long-running

### Tertiary (LOW confidence)

- Shopify `cart.delivery` nullability for new carts — inferred from field optionality; not confirmed against Shopify Storefront API schema directly. Treat as assumed until verified against the generated type in `storefront.generated.d.ts`.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed and in use; no new dependencies
- Architecture: HIGH — patterns directly derived from reading existing code; Prisma transaction pattern already established in codebase
- Pitfalls: HIGH (Pitfalls 1-4) / MEDIUM (Pitfall 5) — Pitfalls 1-4 identified from reading actual code paths; Pitfall 5 (sonner v2 API) is reasonable assumption given major version, existing usage confirms correct API

**Research date:** 2026-02-23
**Valid until:** 2026-03-23 (stable internal codebase; 30 days)
