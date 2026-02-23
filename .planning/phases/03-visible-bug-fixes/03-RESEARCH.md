# Phase 3: Visible Bug Fixes - Research

**Researched:** 2026-02-23
**Domain:** React state management, Sanity CMS schema, Next.js Server Components, Shopify cart variant selection
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Favorites storage**: DB only (server-authoritative) — Prisma DB is the source of truth
- **Anonymous users**: No persisted favorites; only authenticated users can save favorites
- **No localStorage sync, no merge-on-login**
- **Optimistic UI**: heart fills immediately on click, DB save happens in background
- **On DB save failure**: revert heart to unfavorited + sonner toast ("Couldn't save favorite. Try again.")
- **Guest users**: heart icon is visible; clicking it opens the auth modal / prompts login
- **Quick-buy variant**: nothing pre-selected when modal opens — user must make an explicit choice
- **Add-to-cart button disabled** until a variant is selected (no inline error needed)
- **Out-of-stock variants**: visible but disabled (greyed out / strikethrough)
- **After successful add-to-cart**: close modal + open cart sidebar
- **Announcement bar phone source priority**: Sanity CMS field (primary) → env var (fallback)
- **If both empty/missing**: hide the Viber link entirely; rest of announcement bar still shows
- **Phone number stored as raw digits** (e.g., `380991234567`); code constructs `viber://chat?number=%2B...` format

### Claude's Discretion
- Exact Sanity schema field name for phone number
- Which env var name to use as fallback
- Exact toast copy beyond the provided template
- Variant selector component styling details (beyond greyed-out/strikethrough direction)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BUG-01 | User can add/remove favorite products and the selection persists across sessions | Prisma DB writes already implemented in `toggle-favorite.ts`; `isProductFavorite` reads DB; `FavSession` needs error toast + auth-modal redirect for guests |
| BUG-02 | Announcement bar Viber link uses a real phone number fetched from Sanity or env var, not the placeholder | Add `viberPhone` field to `infoBar` Sanity schema; update GROQ query; update component with fallback logic |
| BUG-04 | User can select a variant in quick-buy modal and the selected variant is what gets ordered (not hardcoded first variant) | `ProductQuickView.tsx` passes no `selectedVariant` to `AddToCartButton`; needs local state for selected variant |
</phase_requirements>

---

## Summary

Three user-facing bugs need fixing. Each is a narrow, surgical change to existing files — no new architecture, no new dependencies.

**BUG-01/BUG (favorites)**: The Prisma DB layer is correctly implemented (`toggleFavoriteProduct` in `toggle-favorite.ts`, `isProductFavorite` in `isProductFavorite.ts`, `FavoriteProduct` model exists). The bug is in `FavSession.tsx`: on failure it reverts the UI but never shows a toast. On success for a guest user it pushes to `/auth/sign-in` instead of opening the auth modal. The `add-to-fav.ts` entity file is a dead stub — not wired to any UI. All real favorites logic flows through `toggle-favorite.ts` / `FavSession.tsx`.

**BUG-04 (quick-buy variant)**: `QuickBuyModal.tsx` (the "Quick Order" form) already handles variant selection correctly via a two-step flow. The broken component is `ProductQuickView.tsx` (the quick-view slide-in modal routed at `/@modal/(.)quick/[slug]/`). It renders size and color buttons but tracks no selection state. `AddToCartButton` receives no `selectedVariant` prop, so it always falls back to `product.variants.edges[0].node.id`.

**BUG-02 (announcement bar phone)**: The `infoBar` Sanity schema has a `telephone` field (display text). There is no separate `viberPhone` field for raw digits. The `announcement-bar.tsx` has a hardcoded placeholder `viber://chat?number=%2B380XXXXXXXXX`. Fix requires: (1) add `viberPhone` string field to `infoBar` schema, (2) add it to `HEADER_QUERY` GROQ projection, (3) run `npm run typegen` to regenerate types, (4) update component to use it with env var fallback.

**Primary recommendation:** Fix each bug as a standalone change in its own task: FavSession toast first (simplest), then announcement bar phone (requires Sanity schema + codegen), then ProductQuickView variant state (most logic).

---

## Standard Stack

### Core (already in project — no new installs needed)

| Library | Version | Purpose | Relevance to Phase |
|---------|---------|---------|-------------------|
| `sonner` | ^2.0.7 | Toast notifications | BUG-01: add `toast()` call to `FavSession` on failure |
| `prisma` / `@prisma/client` | ^7.0.0 | DB ORM | BUG-01: `FavoriteProduct` model already exists |
| `sanity` | ^4.10.3 | CMS schema + typegen | BUG-02: add `viberPhone` field to `infoBar` schema |
| `next` | 16.1.0 | App Router, Server Components | All bugs: data fetching pattern |
| `react` | 19.2.3 | useState, useTransition | BUG-04: local state for selected variant |
| `next-intl` | ^4.7.0 | Translations | BUG-04: translated variant labels |

**No new packages required.** All tools are already installed.

---

## Architecture Patterns

### How Favorites Currently Work (Confirmed by Codebase Inspection)

```
Server Component (CollectionGrid, ProductPage, QuickViewPage)
  → auth.api.getSession()
  → isProductFavorite(productId, session)   [DB read]
  → passes isFav={boolean} to FavSession

FavSession (Client Component)
  → useState(fav)                           [local optimistic state]
  → onClick → toggleFavoriteProduct()       [Server Action: DB write]
  → on success: setIsFav(result.isFavorited) + router.refresh()
  → on AUTH_REQUIRED: router.push('/auth/sign-in')   ← BUG: should open modal
  → on DB_ERROR: setIsFav(previousValue)             ← BUG: missing toast
  → on catch: setIsFav(previousValue) + console.error ← BUG: missing toast
```

### Pattern 1: Sonner Toast in Client Component

**What:** Import `toast` from `sonner` and call it on error conditions.
**When to use:** Any client-side action failure needing user feedback.

```typescript
// Source: sonner docs (https://sonner.emilkowal.ski/getting-started)
import { toast } from 'sonner';

// On DB save failure (revert already done above this call):
toast("Couldn't save favorite. Try again.");
```

**Note:** Per CONTEXT.md the copy is `"Couldn't save favorite. Try again."`. Use `toast()` (neutral) not `toast.error()` — consistent with Phase 2 pattern established in the project.

### Pattern 2: Auth Modal Redirect via Next.js Router

**What:** When a guest clicks heart, push to auth modal route.
**When to use:** Replacing the current `router.push('/auth/sign-in', { scroll: false })`.

```typescript
// Source: codebase inspection — app/[locale]/(frontend) has intercepted route
// @auth/(.)auth/[authView]/ handles auth modal
router.push(`/auth/sign-in`, { scroll: false });
```

**This is already correct.** The intercept route at `@auth/(.)auth/[authView]/` renders the auth modal. No change needed for the auth redirect logic.

### Pattern 3: Quick-View Variant Selection State

**What:** Local React state to track which variant is selected in `ProductQuickView.tsx`.
**When to use:** Multi-option products in the quick-view modal.

```typescript
// In ProductQuickView.tsx (currently client component, 'use client' already present)
const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

// Pass to AddToCartButton:
<AddToCartButton
  product={product}
  selectedVariant={selectedVariant ?? undefined}
  variant="default"
  className="w-full bg-black text-white hover:bg-gray-800"
/>
```

`AddToCartButton` already handles `selectedVariant === undefined` — it shows a warning toast and returns early, so the disabled button state is already correct.

### Pattern 4: Sanity Schema Field Addition

**What:** Add a new string field to an existing Sanity `defineType` object.
**When to use:** Adding `viberPhone` to the `infoBar` schema type.

```typescript
// Source: src/shared/sanity/schemaTypes/blocks/info-bar.ts
// Add alongside existing 'telephone' field:
{
  name: 'viberPhone',
  type: 'string',
  title: 'Viber Phone (digits only)',
  description: 'Raw digits for Viber link, e.g. 380991234567. No +, no spaces.',
},
```

After adding field: run `npm run typegen` to regenerate `src/shared/sanity/types.ts`.

### Pattern 5: GROQ Query Projection Update

**What:** Add `viberPhone` to the `HEADER_QUERY` `infoBar` projection.
**When to use:** Whenever a new Sanity field needs to be available to components.

```typescript
// Source: src/shared/sanity/lib/query.ts — HEADER_QUERY
infoBar {
  ...,
  telephone,
  viberPhone,          // ADD THIS LINE
  "text": coalesce(text[$locale], text.uk, text.ru, ""),
  link { ... }
}
```

The `...` spread already includes all scalar fields, but explicit projection is the pattern used in this codebase.

### Pattern 6: Env Var Fallback in Server Component

**What:** Read env var server-side as fallback for missing Sanity data.
**When to use:** When Sanity field may be empty and an env var provides a default.

```typescript
// In announcement-bar.tsx (Server Component — env vars accessible directly)
const viberPhone = props.viberPhone || process.env.VIBER_PHONE_NUMBER || null;
const viberUrl = viberPhone ? `viber://chat?number=%2B${viberPhone}` : null;
```

Env var name at discretion — `VIBER_PHONE_NUMBER` is recommended (server-only, no `NEXT_PUBLIC_` prefix needed since AnnouncementBar is a Server Component).

### Anti-Patterns to Avoid

- **Using `NEXT_PUBLIC_` prefix for phone number**: The AnnouncementBar is a Server Component — no need to expose the number to the client bundle.
- **Calling `revalidateTag` with a second argument**: The project uses `revalidateTag(tag, { expire: 0 })` pattern which is non-standard for Next.js. This may silently ignore the second argument. Do not introduce this pattern in new code — just use `revalidatePath` which is already called in `toggleFavoriteProduct`.
- **Adding `selectedVariant` to `ProductInfo.tsx`**: That component's `AddToCartButton` already correctly uses `selectedVariant`. The bug is only in `ProductQuickView.tsx`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toast notifications | Custom toast system | `sonner` (already installed) | Already used in `QuickBuyModal`, cart actions — consistency |
| Auth redirect | Custom modal trigger | Next.js intercepted route (`/auth/sign-in`) | Already working — current code is correct |
| Viber URL format | Custom phone parsing | String template: `` `viber://chat?number=%2B${digits}` `` | Format confirmed in CONTEXT.md |

**Key insight:** All required functionality is already scaffolded. This phase is purely fixing missing wiring, not building new systems.

---

## Common Pitfalls

### Pitfall 1: Forgetting to Run `npm run typegen` After Sanity Schema Change

**What goes wrong:** `src/shared/sanity/types.ts` will be out of sync with schema. `HEADER_QUERYResult` will not include `viberPhone`. TypeScript won't catch it at first because `...` spread in GROQ projected type may not break compilation immediately, but the field will be `undefined` at runtime.

**Why it happens:** Sanity types are generated — not derived from schema at compile time.

**How to avoid:** Always run `npm run typegen` immediately after modifying any Sanity schema file and before touching the component that consumes the new field.

**Warning signs:** `viberPhone` is `undefined` even after adding the GROQ projection.

### Pitfall 2: `AnnouncementBarProps` Type After Adding `viberPhone`

**What goes wrong:** `AnnouncementBar` uses `Extract<NonNullable<HEADER_QUERYResult>['infoBar'], { _type: 'infoBar' }>` as its type. After typegen, the extracted type will include `viberPhone?: string | null`. No manual type change needed — the type will flow through automatically.

**Why it happens:** Developers may try to manually edit `types.ts` instead of running typegen.

**How to avoid:** Do NOT manually edit `src/shared/sanity/types.ts`. Run `npm run typegen` to regenerate.

### Pitfall 3: Toast on Both Error Paths in `FavSession`

**What goes wrong:** `FavSession` has two error paths: (a) `result.success === false && result.error !== 'AUTH_REQUIRED'`, and (b) the `catch` block. If only one path gets the toast, the other silently fails.

**Why it happens:** The catch block handles network/unexpected errors; the result check handles DB errors.

**How to avoid:** Add toast to BOTH paths. The copy is the same: `"Couldn't save favorite. Try again."`.

### Pitfall 4: `ProductQuickView` Size Option Lookup Mismatch

**What goes wrong:** `ProductQuickView.tsx` uses `option.name.toLowerCase() === 'Розмір'.toLowerCase()` (line 27). If the product's option name is `розмір` vs `Розмір`, the lookup may fail.

**Why it happens:** Ukrainian case sensitivity — product options in Shopify can vary.

**How to avoid:** Already using `.toLowerCase()` on both sides — this is correct. Do not change this pattern.

### Pitfall 5: Cart Sidebar Cannot Be Opened Programmatically

**What goes wrong:** CONTEXT.md says "After successful add-to-cart: close modal + open cart sidebar." The `CartSheet` component in `Sheet.tsx` is a Server Component with a shadcn `<Sheet>` using its own internal state — there is no global Zustand store for cart open state.

**Why it happens:** The cart sidebar was built as a self-contained Server Component without external open state.

**How to avoid:** This is a known architectural limitation. After add-to-cart, the implementation should: (1) close the quick-view modal (via `router.back()`), and (2) trigger a `router.refresh()`. The cart sidebar opening is out of scope for this bug fix without a more invasive refactor. The requirement says "open cart sidebar" — this should be scoped to what's achievable: update the cart badge count via `router.refresh()`. If opening the sidebar requires a Zustand store, that store must be created. **Investigate this carefully in the plan.**

---

## Code Examples

### Current Bug: No Toast in FavSession (BUG-01)

```typescript
// Source: src/features/header/ui/FavSession.tsx (lines 46-60)
// CURRENT (broken):
if (!result.success) {
  setIsFav(previousValue);
  if (result.error === 'AUTH_REQUIRED') {
    router.push(`/auth/sign-in`, { scroll: false });
  }
  // ← BUG: no toast for DB_ERROR case
}

// FIXED:
if (!result.success) {
  setIsFav(previousValue);
  if (result.error === 'AUTH_REQUIRED') {
    router.push(`/auth/sign-in`, { scroll: false });
  } else {
    toast("Couldn't save favorite. Try again.");
  }
}

// Also in catch block:
// CURRENT (broken):
} catch (err) {
  setIsFav(previousValue);
  console.error('Favorite toggle error:', err);
}

// FIXED:
} catch (err) {
  setIsFav(previousValue);
  toast("Couldn't save favorite. Try again.");
}
```

### Current Bug: Hardcoded Viber URL (BUG-02)

```typescript
// Source: src/entities/announcement-bar/announcement-bar.tsx (line 44)
// CURRENT (broken):
<a href="viber://chat?number=%2B380XXXXXXXXX" ...>

// FIXED pattern (after schema + query + typegen):
const { telephone, viberPhone, link, locale, text } = props;
const resolvedViberPhone = viberPhone || process.env.VIBER_PHONE_NUMBER || null;
const viberUrl = resolvedViberPhone
  ? `viber://chat?number=%2B${resolvedViberPhone}`
  : null;

// Render conditionally:
{viberUrl && (
  <a href={viberUrl} target="_blank" rel="noopener noreferrer">
    ...viber icon...
  </a>
)}
```

### Current Bug: No Variant State in ProductQuickView (BUG-04)

```typescript
// Source: src/entities/product/ui/ProductQuickView.tsx
// CURRENT (broken) — size buttons render but do nothing:
{sizeOptions && (
  <div className="mt-4">
    <div className="flex gap-2 mt-1">
      {sizeOptions.map((size) => (
        <Button key={size} variant="outline">{size}</Button>
        // ← No onClick, no selectedSize state, no disabled check
      ))}
    </div>
  </div>
)}
<AddToCartButton
  product={product}
  // ← No selectedVariant passed → falls back to first variant
  variant="default"
  className="w-full bg-black text-white hover:bg-gray-800"
/>

// FIXED: Add selectedVariant state, wire size buttons, pass to AddToCartButton
const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

// In size button onClick:
onClick={() => {
  const variant = product.variants.edges.find((edge) =>
    edge.node.selectedOptions.some(
      (option) =>
        option.name.toLowerCase() === 'розмір' &&
        option.value.toLowerCase() === size.toLowerCase()
    )
  )?.node ?? null;
  setSelectedVariant(variant);
}}

<AddToCartButton
  product={product}
  selectedVariant={selectedVariant ?? undefined}
  variant="default"
  className="w-full bg-black text-white hover:bg-gray-800"
/>
```

### Sanity Schema Addition (BUG-02)

```typescript
// Source: src/shared/sanity/schemaTypes/blocks/info-bar.ts
// ADD after the 'telephone' field:
{
  name: 'viberPhone',
  type: 'string',
  title: 'Viber Phone Number (digits only)',
  description: 'Raw digits for Viber deep link, e.g. 380991234567. No +, no spaces.',
},
```

---

## Files to Modify

### BUG-01 (Favorites)

| File | Change |
|------|--------|
| `src/features/header/ui/FavSession.tsx` | Add `import { toast } from 'sonner'`; add `toast("Couldn't save favorite. Try again.")` in both error paths (DB_ERROR result + catch block) |

### BUG-02 (Announcement Bar)

| File | Change |
|------|--------|
| `src/shared/sanity/schemaTypes/blocks/info-bar.ts` | Add `viberPhone` string field |
| `src/shared/sanity/lib/query.ts` | Add `viberPhone` to `HEADER_QUERY` `infoBar` projection |
| `src/shared/sanity/types.ts` | Regenerate via `npm run typegen` (do NOT edit manually) |
| `src/entities/announcement-bar/announcement-bar.tsx` | Destructure `viberPhone`, build URL with env fallback, render conditionally |

### BUG-04 (Quick-View Variant)

| File | Change |
|------|--------|
| `src/entities/product/ui/ProductQuickView.tsx` | Add `useState<ProductVariant | null>` for selected variant; wire size buttons; disable out-of-stock; pass `selectedVariant` to `AddToCartButton` |

---

## Open Questions

1. **Cart sidebar open after add-to-cart (BUG-04)**
   - What we know: `CartSheet` is a Server Component; no Zustand cart open state exists in the project
   - What's unclear: Whether creating a minimal Zustand store for cart open state is in scope, or whether `router.refresh()` (which updates the badge) is sufficient
   - Recommendation: Scope to `router.refresh()` after add-to-cart and close the quick-view modal via `router.back()`. Cart sidebar programmatic open requires a store refactor that risks touching the `CartSheet` server component. Flag in plan as a task decision point.

2. **Color options in ProductQuickView**
   - What we know: `ProductQuickView` shows `colorOptions` buttons — these are NOT wired either
   - What's unclear: BUG-04 says "variant (size/color)" — color buttons also need wiring
   - Recommendation: Wire both. The fix is the same pattern. If a product has both size AND color, `selectedVariant` must match all selected options. The current codebase in `ProductInfo.tsx` (full product page) uses a similar pattern as reference.

3. **`add-to-fav.ts` stub file**
   - What we know: `src/entities/favorite/api/add-to-fav.ts` is a stub with `console.log` and a TODO
   - What's unclear: Is this file used anywhere? (Answer: No — confirmed by grep)
   - Recommendation: Leave the stub as-is. Do not delete. It's not connected to any UI.

---

## State of the Art

| Old Approach | Current Approach | Impact for This Phase |
|--------------|------------------|----------------------|
| Manual type editing for Sanity | `npm run typegen` regenerates `types.ts` | Must run typegen after schema change |
| Client-side fetch for favorites | Server Component passes `isFav` prop | FavSession gets initial state from server — correct |
| `'use cache'` for `isProductFavorite` | Currently commented out | Fine — do not un-comment, caching interferes with toggle invalidation |

---

## Sources

### Primary (HIGH confidence)
- Codebase inspection — `src/features/header/ui/FavSession.tsx` — confirmed no toast import
- Codebase inspection — `src/entities/announcement-bar/announcement-bar.tsx` — confirmed hardcoded Viber URL
- Codebase inspection — `src/entities/product/ui/ProductQuickView.tsx` — confirmed no variant selection state
- Codebase inspection — `src/shared/sanity/schemaTypes/blocks/info-bar.ts` — confirmed no `viberPhone` field
- Codebase inspection — `src/features/product/api/toggle-favorite.ts` — confirmed DB writes are correct
- Codebase inspection — `src/features/product/api/isProductFavorite.ts` — confirmed DB reads are correct
- Codebase inspection — `src/shared/store/` — confirmed NO cart open Zustand store exists

### Secondary (MEDIUM confidence)
- `package.json` — confirmed `sonner ^2.0.7`, `next 16.1.0`, `prisma ^7.0.0`, `sanity ^4.10.3` — all stable
- `CLAUDE.md` — confirmed `npm run typegen` command for Sanity type generation

---

## Metadata

**Confidence breakdown:**
- BUG-01 (favorites): HIGH — all relevant files read; bug location confirmed; fix is 3 lines
- BUG-02 (announcement bar): HIGH — schema, query, and component all inspected; change is additive
- BUG-04 (quick-view variant): HIGH — bug confirmed; fix pattern matches existing `ProductInfo.tsx` code; one open question on cart sidebar open

**Research date:** 2026-02-23
**Valid until:** 2026-03-25 (stable codebase; 30-day window)
