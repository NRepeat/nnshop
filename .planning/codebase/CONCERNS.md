# Codebase Concerns

**Analysis Date:** 2026-02-23

## Tech Debt

**Incomplete Favorite Product Feature:**
- Issue: Favorites API is stubbed without implementation
- Files: `src/entities/favorite/api/add-to-fav.ts`
- Impact: Favorite functionality returns success without actually adding products to favorites; users cannot persist favorite selections
- Fix approach: Implement actual favorite-adding logic using existing `FavoriteProduct` Prisma model; add validation for authenticated users; wire database persistence

**Hardcoded Phone Number in Announcement Bar:**
- Issue: Viber contact number contains placeholder `%2B380XXXXXXXXX` instead of real phone
- Files: `src/entities/announcement-bar/announcement-bar.tsx:44`
- Impact: Users cannot contact support via Viber; feature is non-functional
- Fix approach: Move phone number to Sanity CMS content or environment variables; fetch from `telephone` prop already passed to component

**Excessive console.log in Production Code:**
- Issue: Verbose logging throughout cart/authentication flows with detailed user data
- Files: `src/entities/cart/api/anonymous-cart-buyer-identity-update.ts`, `src/features/auth/lib/auth.ts`, `src/features/order/api/create.ts` and 20+ other files
- Impact: Logs expose user IDs, emails, cart tokens (truncated), checkout data to browser console and server logs; creates security audit trail; clutters monitoring systems
- Fix approach: Replace debug logs with structured logging/tracing; use conditional logging only for error cases; remove data logging in production builds

## Type Safety Issues

**Loose TypeScript Assertions:**
- Issue: Multiple `as any` type castings bypass type safety
- Files: `src/features/checkout/delivery/ui/UkrPoshtaForm.tsx:77,110`, `src/features/home/ui/HeroPageBuilder.tsx:89,97-99`, `src/entities/announcement-bar/announcement-bar.tsx:59,62`
- Impact: Hides type errors at compile time; can cause runtime failures with unexpected data shapes; difficult to refactor
- Fix approach: Define proper types for form fields and block components; use `as const` for readonly literals; leverage Sanity generated types from `typegen`

**Loose Record Types:**
- Issue: `Record<string, any>` used in 4 files for function parameters and session objects
- Files: `src/entities/cart/api/anonymous-cart-buyer-identity-update.ts:135-136`, better-auth session extensions
- Impact: Defeats type checking for user and session objects; properties not validated at compile time
- Fix approach: Create proper TypeScript interfaces extending `User` and `Session`; use discriminated unions for different user types (anonymous vs authenticated)

**Promise.allSettled with Hardcoded Array Access:**
- Issue: Results from `Promise.allSettled()` accessed by hardcoded indices [0] and [1]
- Files: `src/features/auth/lib/auth.ts:98-101`
- Impact: Fragile to reordering promises; difficult to add new async operations; error handling depends on array position
- Fix approach: Use object destructuring with named results; create result interface mapping promise results to named fields

## Memory Leaks & Resource Cleanup

**Missing Event Listener Cleanup:**
- Issue: Event listeners registered but not all have cleanup in useEffect returns
- Files: `src/features/header/search/ui/search-client.tsx` (has cleanup for `mousedown`), but pattern inconsistent across codebase
- Impact: Memory leaks in long-lived components; repeated navigation can accumulate listeners
- Fix approach: Audit all `addEventListener` calls; ensure matching `removeEventListener` in cleanup functions; use passive event listeners where applicable

**setTimeout Without Cleanup:**
- Issue: Multiple `setTimeout` calls without tracking/clearing on unmount
- Files: `src/features/novaPoshta/ui/NovaPoshtaButton.tsx`, `src/features/product/quick-buy/ui/QuickBuyModal.tsx`, `src/features/header/language-switcher/ui/LanguageSwitcher.tsx`, `src/entities/home/ui/SyncedCarousels.tsx`
- Impact: Timers fire after component unmounts; can call state setters on unmounted components (React warning); delayed navigation may not cancel in-flight operations
- Fix approach: Store timeout IDs in refs; clear them in useEffect cleanup; use AbortController for async operations

## Performance Bottlenecks

**Large GraphQL Queries Without Pagination Optimization:**
- Issue: `getCollection.ts` fetches full collection filters on every request even when not needed
- Files: `src/entities/collection/api/getCollection.ts:208-226`
- Impact: Extra Shopify API calls for collection pages without filters; slows down collection pages with many filters
- Fix approach: Implement conditional filter fetching only when filter UI is rendered; cache filter definitions separately with longer revalidation

**Product Variant Selection Logic:**
- Issue: Quick-buy and product pages hardcode variant selection to first variant `[0]`
- Files: `src/features/product/quick-buy/ui/QuickBuyModal.tsx:107-108`, `src/features/product/quick-buy/api/create-quick-order.ts`
- Impact: Users cannot choose variants in quick-buy; always orders first available variant regardless of selected options
- Fix approach: Pass selected variant from parent component; store variant selection in modal state; validate variant availability before order creation

**Cart Merge Logic Duplicates API Calls:**
- Issue: When merging anonymous and authenticated carts, cart data fetched multiple times from Shopify
- Files: `src/entities/cart/api/anonymous-cart-buyer-identity-update.ts:168,177`
- Impact: Multiple API calls during login flow; slower account linking experience
- Fix approach: Fetch cart data once and reuse; batch Shopify mutations; implement request deduplication

## Fragile Areas

**Cart State Synchronization:**
- Files: `src/entities/cart/api/anonymous-cart-buyer-identity-update.ts`, `src/features/auth/lib/on-link-account.ts`
- Why fragile: Complex multi-step process merging Shopify cart state with Prisma database state during authentication; relies on cart tokens not changing; silently returns on errors without retry
- Safe modification: Add comprehensive error logging for each step; implement idempotency keys; add database transaction rollback on Shopify API failure
- Test coverage: No integration tests for cart merge flow; missing tests for partial failures (cart API succeeds but database update fails)

**Order Creation Flow:**
- Files: `src/features/order/api/create.ts`
- Why fragile: 318 lines handling cart validation, Shopify order creation, database state updates, email sending; multiple sequential API calls; limited error recovery
- Safe modification: Add detailed comments documenting each phase; implement compensating transactions for rollback; add retry logic for idempotent operations
- Test coverage: No tests for partial failures; unclear behavior when Shopify order succeeds but email fails

**Anonymous to Authenticated User Linking:**
- Files: `src/features/auth/lib/on-link-account.ts`, `src/features/auth/lib/auth.ts:81-107`
- Why fragile: Relies on Promise.allSettled with hardcoded indices; error handling doesn't prevent database corruption if cart or data linking partially completes
- Safe modification: Implement transactional updates; add data validation before/after linking; create audit log of linking operations
- Test coverage: No tests for concurrent linking attempts; no tests for network failures during linking

## Security Considerations

**Console Logging Exposes User Data:**
- Risk: User IDs, emails, partial cart tokens logged to console and server logs; could be captured in error reporting tools
- Files: `src/entities/cart/api/anonymous-cart-buyer-identity-update.ts`, `src/features/auth/lib/auth.ts`, `src/features/order/api/create.ts`
- Current mitigation: Cart tokens partially masked with substring operation (shows first 30 chars)
- Recommendations: Replace all user-facing console logs with structured logging that redacts PII; ensure error reporting service (if used) doesn't log sensitive data; implement audit logging for auth events

**Product Description HTML Injection:**
- Risk: Product descriptions from Shopify rendered with `dangerouslySetInnerHTML`
- Files: `src/features/product/ui/Description.tsx`
- Current mitigation: Data comes from Shopify API (trusted source); HTML sanitization depends on Shopify
- Recommendations: Add HTML sanitization layer (DOMPurify) even for trusted sources; validate schema of description before rendering; document assumption that Shopify data is safe

**JSON-LD Schema Injection:**
- Risk: JSON structured data rendered with `dangerouslySetInnerHTML`
- Files: `src/shared/ui/JsonLd.tsx`
- Current mitigation: Data is stringified JSON (not user-generated HTML); no interpolation of user values
- Recommendations: Continue using JSON.stringify only; never interpolate user data into JSON-LD; validate schema matches expected structure

**Missing CSRF Protection on State Changes:**
- Risk: Server actions modify cart/checkout state without explicit CSRF token validation
- Files: `src/entities/cart/api/*.ts`, `src/features/checkout/**/*.ts` (Server Action files)
- Current mitigation: Relies on Next.js automatic CSRF prevention for Server Actions; origin validation via `trustedOrigins` in next.config
- Recommendations: Verify Next.js Server Action CSRF implementation is enabled; test cross-origin requests are rejected; document CSRF assumptions

**Unvalidated Shopify OAuth Tokens:**
- Risk: Shopify Admin API tokens cached in database without validation
- Files: `src/shared/lib/clients/shopify-factory.ts`, `src/features/auth/lib/auth.ts`
- Current mitigation: Tokens refreshed with expiration buffer; only accessible server-side
- Recommendations: Implement token rotation policy; add rate limiting on token refresh; audit who can read tokens from database; log token usage

## Scaling Limits

**Hardcoded Pagination Limits:**
- Issue: Collection products query limited to `first: 250` for variants, `first: 10` for line items
- Files: `src/entities/collection/api/getCollection.ts:68`, `src/features/order/api/create.ts:43`
- Limit: Products with >250 variants not fully loaded; orders with >10 line items truncated
- Scaling path: Use dynamic limits based on query complexity; implement cursor-based pagination for large result sets

**Product Handle Array Building Without Size Limit:**
- Issue: `getCollectionHandles` builds set of all product handles from collection
- Files: `src/entities/collection/api/getCollection.ts:159-206`
- Limit: Large collections (10,000+ products) cause memory issues and slow builds
- Scaling path: Implement streaming results; generate handles on-demand; cache handle set with TTL

**Prisma Adapter N+1 Risk:**
- Issue: Cart/order queries could trigger N+1 if relationships not eagerly loaded
- Files: Prisma schema uses `@relation` without explicit `include` in many queries
- Limit: Performance degrades with cart size and user data complexity
- Scaling path: Audit all Prisma queries for N+1; use `include`/`select` explicitly; implement query performance monitoring

## Testing Gaps

**No Integration Tests for Cart Merge:**
- What's not tested: Anonymous-to-authenticated cart merging, line item duplication prevention, cart token reassignment
- Files: `src/entities/cart/api/anonymous-cart-buyer-identity-update.ts`
- Risk: Breaks silently; data loss or duplicate orders possible; only discovered in production
- Priority: **High** - affects checkout flow

**No Tests for Order Creation Flow:**
- What's not tested: Cart validation → Shopify order creation → database state → email sending; partial failures; retry logic
- Files: `src/features/order/api/create.ts`
- Risk: Corrupted order state; orphaned Shopify orders; lost orders
- Priority: **High** - affects revenue-critical flow

**No Tests for Favorite Products:**
- What's not tested: Add to favorites, remove from favorites, persistence across sessions
- Files: `src/entities/favorite/api/add-to-fav.ts`, `src/features/product/api/toggle-favorite.ts`
- Risk: Feature doesn't work but errors not detected
- Priority: **Medium** - UX feature, not revenue-critical

**No E2E Tests:**
- What's not tested: Full user flows (browsing → adding to cart → checkout → order); redirects after login; language switching persistence
- Files: `app/` directory (routing), `src/features/` (multi-step flows)
- Risk: UI changes break workflows without detection; critical paths fail in production
- Priority: **High** - prevents regressions

## Known Issues

**Cart State Undefined in Some Flows:**
- Symptoms: Cart null/undefined in checkout despite items in cart
- Files: `src/features/order/api/create.ts:81-99` (defensive null checks)
- Trigger: Rapid checkout after adding items; session cookie issues
- Workaround: Hard refresh page or clear cookies; retry checkout

**Announcement Bar Viber Link Non-Functional:**
- Symptoms: Viber button visible but clicking does nothing
- Files: `src/entities/announcement-bar/announcement-bar.tsx:44`
- Trigger: Clicking Viber contact button
- Workaround: Users copy phone from elsewhere or use Telegram

**Promise.allSettled Hardcoded Indices:**
- Symptoms: Wrong error message if promise order changes; unclear which operation failed
- Files: `src/features/auth/lib/auth.ts:98-101`
- Trigger: Cart update or data linking fails during account linking
- Workaround: Check logs manually to understand which operation failed

## Dependencies at Risk

**No Test Framework Configured:**
- Risk: No testing infrastructure; impossible to add tests without setup
- Impact: Can't prevent regressions; refactoring is risky; tech debt accumulates
- Migration plan: Set up Jest or Vitest with Turbopack support; add test infrastructure to build pipeline; document testing patterns

**Manual GraphQL Codegen:**
- Risk: Shopify and Sanity types generated manually; easy to forget regeneration after schema changes
- Impact: Type definitions become stale; breaking schema changes not caught
- Migration plan: Add graphql-codegen and typegen to CI pipeline; run on every deploy; add Git pre-commit hooks

**Large Generated Type Files:**
- Risk: `storefront.types.d.ts` (9216 lines), `sanity/types.ts` (3087 lines) make IDE slow; difficult to navigate
- Impact: Slower development; compilation slower; merge conflicts more likely
- Migration plan: Split into multiple namespace files; use path aliases for cleaner imports; separate runtime code from type definitions

## Missing Critical Features

**No Observability/Error Tracking:**
- Problem: No centralized error tracking or monitoring; bugs only discovered when customers report
- Blocks: Can't proactively detect issues; can't track error rates; difficult to debug production issues
- Recommendation: Implement Sentry or similar; add structured logging; expose metrics endpoint

**No Request Deduplication:**
- Problem: Duplicate Shopify API calls can occur without client-side deduplication
- Blocks: Multiple cart fetches during checkout; wasted API calls; slower experience
- Recommendation: Implement request cache layer; use fetch deduplication; add React Query or similar

**No Offline Support:**
- Problem: Network failures cause checkout to fail completely; no graceful degradation
- Blocks: Can't complete purchases on poor connections; user frustration
- Recommendation: Implement service worker; cache critical checkout data; implement retry queues

**No Rate Limiting on Favorite Toggle:**
- Problem: Users could spam favorite endpoint
- Blocks: Could be used for DoS; database load spikes possible
- Recommendation: Add server-side rate limiting; implement request deduplication on client

---

*Concerns audit: 2026-02-23*
