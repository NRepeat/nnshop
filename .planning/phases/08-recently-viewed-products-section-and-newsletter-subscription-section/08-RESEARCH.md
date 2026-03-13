# Phase 8: Recently Viewed Products & Newsletter Subscription - Research

**Researched:** 2026-02-28
**Domain:** Next.js App Router — Session-aware server actions, Prisma DB writes, carousel UI, form submission
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Recently Viewed — Carousel Display**
- Horizontal scrollable carousel using existing `ProductCard` component
- Show up to ~10 most recently viewed products
- Screenshot shows large product cards — likely 2–3 visible at a time on desktop with scroll arrows, full-width on mobile
- Section title: "Нещодавно переглянуті" (matching screenshot exactly)
- Hide the section entirely when the user has zero recently viewed products — no placeholder, no skeleton
- Uses same card style as the rest of the site (discount badge, favorite heart, brand name, price with strike-through)

**Recently Viewed — Tracking Rules**
- A product is recorded when the user visits a product page (not just hover/quick-view)
- If the same product is viewed again, move it to the front (update `viewedAt`) rather than duplicate
- Maximum 20 records per session in DB; UI shows the most recent 10
- Works for both anonymous (sessionId) and authenticated (userId) users — session ID from better-auth anonymous session, upgrades to userId on sign-in (merge handled by better-auth's existing anonymous merge)
- Prisma model: `RecentlyViewed` with `sessionId`, `productHandle`, `viewedAt`; Prisma client at `generated/prisma`

**Recently Viewed — Placement**
- Appears on home page (below hero/carousels) and product detail page (below product info / above footer)
- Reusable component so it can be dropped into any page

**Newsletter — Form Behaviour**
- Gender radio defaults to "Для неї" (for her) on load
- On submit: inline success state replaces the form ("Дякуємо! Ви підписані") — no redirect, no page reload
- Basic validation: email format required; empty email shows inline error
- Duplicate email: treat as success silently (no error shown to user)
- Store `{ email, gender, subscribedAt }` in a new `NewsletterSubscriber` Prisma model

**Newsletter — Placement & Styling**
- Full-width section, light background (matching screenshot — off-white/grey)
- Submit button: black background, white text (matching screenshot "Підписатися")
- Gender radio uses custom-styled radio inputs matching the screenshot (dark outline on selected)
- Appears on the home page — exact position above footer (between last content section and footer)
- Also reusable so it can be used on other pages in future

### Claude's Discretion
- Exact carousel scroll arrow design (left/right nav buttons)
- Loading state for the recently viewed carousel (can use skeleton or suppress during SSR)
- Exact Prisma migration naming
- Server Action file structure for recording viewed products and newsletter signup
- Whether to use `useEffect` client-side trigger for recording views or a server action on page load

### Deferred Ideas (OUT OF SCOPE)
- eSputnik API integration for newsletter signups — add to roadmap backlog (store in DB for now)
- Quick-view modal triggering a recently viewed record — separate decision, defer to future
- Sanity CMS control for newsletter text/heading — deferred (hardcoded for now)
- "You may also like" recommendations section — separate phase
</user_constraints>

---

## Summary

This phase adds two new frontend sections that are standalone (no Sanity), session-aware, and backed by new Prisma DB writes.

**Critical discovery:** The Prisma migration `20260228135549_add_recently_viewed` has already been applied to the DB. The `RecentlyViewedProduct` model exists in `schema.prisma` and the `recently_viewed_product` table exists in the DB. However, the model uses `userId` only (no `sessionId` column). The `NewsletterSubscriber` model does NOT yet exist and needs a new migration.

**Key architectural insight:** better-auth's `anonymous` plugin creates a real `User` record with `isAnonymous: true` for every unauthenticated visitor (triggered e.g. by `authClient.signIn.anonymous()` in `AddToCartButton.tsx`). This means `auth.api.getSession()` returns a valid `session.user.id` for anonymous users, and the existing `RecentlyViewedProduct` model's `userId` foreign key works for both anonymous and authenticated users — no `sessionId` column needed. The CONTEXT.md's "sessionId" terminology refers to the better-auth user ID that anonymous sessions receive.

**The challenge:** Anonymous users only get a userId if they have already triggered `signIn.anonymous()` somewhere. If a user visits a product page before any cart action (which triggers anonymous sign-in), the session may be null. The server action must handle the null session case gracefully — record nothing, or trigger anonymous sign-in on the server.

**Primary recommendation:** Use server-side `auth.api.getSession()` in a Server Action called from a `useEffect` client trigger on product page mount. Skip recording if session is null (don't block rendering). For the newsletter form, use `react-hook-form` + Zod + Server Action pattern consistent with `ContactInfoForm.tsx`.

---

## Standard Stack

### Core (all already in project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Prisma v7 | `^7.0.0` | DB reads/writes | Project DB layer; client at `~/generated/prisma/client` |
| better-auth | `^1.3.27` | Session retrieval | `auth.api.getSession({ headers: await headers() })` for server actions |
| react-hook-form | `^7.65.0` | Newsletter form | Project standard for all forms |
| Zod v4 | `^4.1.12` | Form validation | Project standard; schemas in `schema/` subdirectory |
| `@hookform/resolvers` | (installed) | zodResolver | Project standard resolver |
| shadcn/ui | (installed) | Form, Input, Button | Project UI library; new-york style |
| embla-carousel-react | `^8.6.0` | Carousel | Already used via `CardCarousel` + `withScrollState` HOC |
| next-intl | `^4.7.0` | i18n translations | All user-visible strings use `useTranslations` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `next/headers` | built-in | Server-side cookie/header access | In Server Actions to get session |
| `next/cache` | built-in | `revalidatePath` after mutations | After recording views/newsletter signups |
| `lucide-react` | `^0.546.0` | Icons (ChevronLeft/Right for carousel arrows) | If custom arrow buttons needed |

### No New Installations Required
All needed libraries are already installed. No `npm install` step.

---

## Architecture Patterns

### Recommended FSD Structure

```
src/
  entities/
    recently-viewed/
      api/
        record-view.ts          # Server Action — upsert RecentlyViewedProduct
        get-recently-viewed.ts  # Server fn — fetch product handles for current user
      ui/
        RecentlyViewedCarousel.tsx   # Client: carousel using CardCarousel + ProductCard
        RecentlyViewedSection.tsx    # Server: fetch + render or null
  features/
    newsletter/
      api/
        subscribe.ts             # Server Action — insert NewsletterSubscriber
      schema/
        newsletterSchema.ts      # Zod schema: email + gender
      ui/
        NewsletterForm.tsx        # Client: react-hook-form form
        NewsletterSection.tsx     # Wrapper with heading and layout
```

**Why this FSD placement:**
- `entities/recently-viewed/` — pure business entity (data + display), reusable across pages
- `features/newsletter/` — user-facing feature with form behaviour (matches `features/product/`, `features/auth/`)

### Pattern 1: Session-Aware Server Action with Anonymous Guard

Recording a product view requires getting the current user (anonymous or authenticated) from the server. The pattern matches how `isProductFavorite.ts` and checkout actions work:

```typescript
// src/entities/recently-viewed/api/record-view.ts
'use server';

import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';

export const recordProductView = async (
  productHandle: string,
  productId: string,
) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    // Anonymous user not yet signed in — skip silently
    return { success: false, reason: 'NO_SESSION' };
  }

  const userId = session.user.id;

  try {
    // Upsert: if already viewed, update viewedAt to move to front
    await prisma.recentlyViewedProduct.upsert({
      where: { userId_productId: { userId, productId } },
      update: { viewedAt: new Date() },
      create: { userId, productId, productHandle },
    });

    // Cap at 20: delete oldest beyond limit
    const records = await prisma.recentlyViewedProduct.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
      skip: 20,
      select: { id: true },
    });
    if (records.length > 0) {
      await prisma.recentlyViewedProduct.deleteMany({
        where: { id: { in: records.map((r) => r.id) } },
      });
    }

    return { success: true };
  } catch (error) {
    console.error('[recordProductView] failed', {
      step: 'prisma-recently-viewed',
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, reason: 'DB_ERROR' };
  }
};
```

### Pattern 2: Client-Side View Trigger via useEffect

The product page is a Server Component (`page.tsx`). Recording a view should not block rendering. Use a Client Component with `useEffect` that fires the server action after mount:

```typescript
// src/entities/recently-viewed/ui/ViewTracker.tsx
'use client';

import { useEffect } from 'react';
import { recordProductView } from '../api/record-view';

export const ViewTracker = ({
  productHandle,
  productId,
}: {
  productHandle: string;
  productId: string;
}) => {
  useEffect(() => {
    recordProductView(productHandle, productId);
    // Fire-and-forget; no state needed
  }, [productHandle, productId]);

  return null; // renders nothing
};
```

Drop `<ViewTracker handle={handle} productId={product.id} />` inside `ProductView.tsx` or `ProductSessionView.tsx`.

### Pattern 3: Server-Side Fetch + Conditional Render

The `RecentlyViewedSection` fetches from DB server-side, fetches Shopify product data, and returns null if empty — consistent with `ProductCarousel` which also returns null when no data:

```typescript
// src/entities/recently-viewed/ui/RecentlyViewedSection.tsx
import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@shared/lib/prisma';
import { getProductsByHandles } from '../api/get-products-by-handles';
import { RecentlyViewedCarousel } from './RecentlyViewedCarousel';

export const RecentlyViewedSection = async ({ locale }: { locale: string }) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;

  const records = await prisma.recentlyViewedProduct.findMany({
    where: { userId: session.user.id },
    orderBy: { viewedAt: 'desc' },
    take: 10,
    select: { productHandle: true },
  });

  if (records.length === 0) return null;

  const handles = records.map((r) => r.productHandle);
  const products = await getProductsByHandles(handles, locale);

  if (products.length === 0) return null;

  return <RecentlyViewedCarousel products={products} />;
};
```

### Pattern 4: Newsletter Form with Inline Success State

Follows `ContactInfoForm.tsx` pattern — `react-hook-form` + `zodResolver` + Server Action + success state swap:

```typescript
// src/features/newsletter/ui/NewsletterForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { subscribeToNewsletter } from '../api/subscribe';
import { newsletterSchema, NewsletterFormData } from '../schema/newsletterSchema';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@shared/ui/form';
import { Input } from '@shared/ui/input';
import { Button } from '@shared/ui/button';

export const NewsletterForm = () => {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: '', gender: 'woman' },
  });

  if (submitted) {
    return <p>Дякуємо! Ви підписані</p>;
  }

  async function onSubmit(data: NewsletterFormData) {
    await subscribeToNewsletter(data);
    setSubmitted(true); // treat duplicate as success — server action never throws
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* gender radio: Для неї / Для нього */}
        {/* email input */}
        {/* submit button: black bg, white text */}
      </form>
    </Form>
  );
};
```

### Pattern 5: Newsletter Server Action

```typescript
// src/features/newsletter/api/subscribe.ts
'use server';

import { prisma } from '@shared/lib/prisma';

export const subscribeToNewsletter = async ({
  email,
  gender,
}: {
  email: string;
  gender: string;
}) => {
  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { gender, subscribedAt: new Date() },
      create: { email, gender },
    });
    return { success: true };
  } catch (error) {
    console.error('[subscribeToNewsletter] failed', {
      step: 'prisma-newsletter',
      error: error instanceof Error ? error.message : String(error),
    });
    // Return success to caller — duplicate treated silently
    return { success: true };
  }
};
```

### Pattern 6: Fetching Products by Handle (for RecentlyViewed)

The existing `getProductsByIds` uses Shopify's `query` search with `id:` filters. For handles, use `handle:` filter with OR:

```typescript
// src/entities/recently-viewed/api/get-products-by-handles.ts
// Use storefrontClient.request with query: `handle:${handle1} OR handle:${handle2}`
// This is the same pattern as getProductsByIds but with `handle:` prefix
// Returns Product[] sorted by the order of handles array
```

Alternatively, use `Promise.all` with individual `getProduct` calls for up to 10 products — simpler and hits cached requests. For 10 products this is acceptable (not N+1 at scale since it's session-specific and short-lived).

### Anti-Patterns to Avoid

- **Recording views in Server Component render path:** Blocks page rendering; use `useEffect` client trigger instead
- **Using `router.refresh()` after recording a view:** The carousel is SSR-rendered; a full page refresh would flicker. Re-fetch carousel data separately or accept eventual consistency
- **Blocking newsletter submission on DB error:** Log the error server-side, always return success to avoid confusing the user
- **Using `getProduct()` for recently viewed fetch:** It uses `'use cache'` + `cacheLife("default")` per-product — fine for individual products but verify locale handling
- **Showing the section during SSR before session check:** Always return `null` from the server component if no session; never show a loading placeholder (per CONTEXT.md decision)

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Carousel UI | Custom scroll container | `CardCarousel` + `withScrollState` | Already built, handles scroll progress, drag, arrow buttons |
| Form state | Custom useState form | `react-hook-form` + `zodResolver` | Project standard; handles validation, error display |
| Session retrieval | Custom cookie parsing | `auth.api.getSession({ headers })` | better-auth handles anonymous + authenticated uniformly |
| DB upsert for recently viewed | Delete + create | `prisma.recentlyViewedProduct.upsert()` | Built-in, atomic |
| i18n strings | Hardcoded Ukrainian | `useTranslations` / `getTranslations` | Project i18n standard; needed for `ru` locale support |

**Key insight:** The entire carousel infrastructure (`CardCarousel`, `withScrollState`, `ProductCard`) already exists. The recently viewed section is composition of existing components, not new infrastructure.

---

## Common Pitfalls

### Pitfall 1: Anonymous Users Without a Session

**What goes wrong:** A user visits a product page without having triggered `signIn.anonymous()`. The `auth.api.getSession()` returns `null`. The `recordProductView` server action returns `{ success: false, reason: 'NO_SESSION' }` and nothing is recorded.

**Why it happens:** `signIn.anonymous()` is only triggered from `AddToCartButton` today. A user who browses products without adding to cart has no anonymous user ID.

**How to avoid:** Accept this limitation for Phase 8. The view tracker silently skips recording when no session exists. For users who do have a session (either anonymous or authenticated), recording works correctly. Do not block product page rendering over this.

**Warning signs:** Recently viewed section remains empty for new visitors who haven't added items to cart.

### Pitfall 2: Schema vs CONTEXT.md Mismatch on `sessionId`

**What goes wrong:** CONTEXT.md says "session ID from better-auth anonymous session" but the existing migration uses `userId`. This looks like a discrepancy.

**Why it happens:** CONTEXT.md uses "sessionId" loosely to mean the identifier better-auth assigns to a session. In practice, better-auth's `anonymous` plugin creates a real `User` with `isAnonymous: true`, giving a stable `userId` — the correct column to use.

**How to avoid:** The existing migration is correct. Use `userId` (not `sessionId`) in all code. Do NOT add a `sessionId` column. The `userId` is the right key for both anonymous and authenticated users.

**Warning signs:** Any attempt to read `session.session.token` or `session.session.id` as the identifier — use `session.user.id` instead.

### Pitfall 3: Prisma Client Import Path

**What goes wrong:** Using `@prisma/client` import instead of the project-specific generated path causes type errors or wrong client instantiation.

**Why it happens:** Prisma client is generated to non-standard path `generated/prisma` (configured in `schema.prisma` `output = "../generated/prisma"`).

**How to avoid:** Always import from `~/generated/prisma/client`:
```typescript
import { prisma } from '@shared/lib/prisma'; // correct — re-exports the configured client
// Never: import { PrismaClient } from '@prisma/client'
```

**Warning signs:** TypeScript errors about missing models or wrong types from Prisma client.

### Pitfall 4: Missing NewsletterSubscriber Migration

**What goes wrong:** The `NewsletterSubscriber` model is written in `schema.prisma` but `npx prisma migrate dev` has not been run, so the table doesn't exist in the DB.

**Why it happens:** Unlike `RecentlyViewedProduct` (already migrated), `NewsletterSubscriber` is new for Phase 8.

**How to avoid:** The plan must include a migration task as the first DB-related task. Run `npx prisma migrate dev --name add_newsletter_subscriber` after adding the model to schema.

**Warning signs:** `PrismaClientKnownRequestError` on newsletter subscription with "table not found" message.

### Pitfall 5: Shopify Product Fetch Order Mismatch

**What goes wrong:** The recently viewed section shows products in wrong order because Shopify's `handle:A OR handle:B` query doesn't respect insertion order.

**Why it happens:** Shopify returns results in its own sort order (relevance/default), not the order of the handles passed.

**How to avoid:** After fetching products from Shopify, re-sort them to match the order of `handles` array from the DB query (which is already sorted by `viewedAt DESC`):
```typescript
const productMap = new Map(products.map((p) => [p.handle, p]));
const sorted = handles.map((h) => productMap.get(h)).filter(Boolean);
```

### Pitfall 6: `'use cache'` Conflict in RecentlyViewed Server Component

**What goes wrong:** If `RecentlyViewedSection` uses `'use cache'` or is wrapped in a cached function, all users see the same cached products.

**Why it happens:** Accidentally applying `cacheLife()` to a per-user DB query.

**How to avoid:** Do NOT add `'use cache'` to `RecentlyViewedSection` or its DB query. User-specific data must be dynamic. Wrap the section in `<Suspense>` with `null` fallback on the page if needed for streaming.

### Pitfall 7: `getProduct` is Cached Per-Handle — Side Effect in ViewTracker

**What goes wrong:** `getProduct.ts` has `'use cache'` + `cacheTag`. Calling it for revalidation from `recordProductView` would bypass or pollute the cache.

**Why it happens:** The server action runs in a non-cached context, but Shopify product data is cached.

**How to avoid:** `recordProductView` only writes to DB — never calls Shopify. The RecentlyViewed section fetches Shopify data separately and doesn't need revalidation (it reads fresh from DB each page load since it's not cached).

---

## Code Examples

### Prisma Schema Additions

```prisma
// Add to schema.prisma — NewsletterSubscriber is new
// RecentlyViewedProduct already exists (migrated 20260228135549)

model NewsletterSubscriber {
  id           String   @id @default(cuid())
  email        String   @unique
  gender       String
  subscribedAt DateTime @default(now())
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("newsletter_subscriber")
}
```

### Zod Schema for Newsletter

```typescript
// src/features/newsletter/schema/newsletterSchema.ts
import { z } from 'zod';

export const newsletterSchema = z.object({
  email: z.string().email('Введіть коректний email'),
  gender: z.enum(['woman', 'man']).default('woman'),
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;
```

### Home Page Integration

The home page renders via `HeroPageBuilder` which loops over Sanity content blocks. Since the recently viewed section and newsletter section are NOT Sanity blocks, they must be appended OUTSIDE the Sanity content loop in `HeroPageBuilder.tsx` or in `PageContent` (the `view.tsx` widget):

```typescript
// src/widgets/home/ui/view.tsx — add after HeroPageBuilder
import { Suspense } from 'react';
import { RecentlyViewedSection } from '@entities/recently-viewed/ui/RecentlyViewedSection';
import { NewsletterSection } from '@features/newsletter/ui/NewsletterSection';

export const PageContent = async ({ params }) => {
  const { locale, gender } = await params;
  return (
    <div className="flex flex-col h-fit min-h-screen">
      <HeroPageBuilder gender={gender} locale={locale} />
      <Suspense fallback={null}>
        <RecentlyViewedSection locale={locale} />
      </Suspense>
      <NewsletterSection />
    </div>
  );
};
```

### Product Page Integration

In `ProductView.tsx`, add `ViewTracker` (client component) and `RecentlyViewedSection` after the related products block:

```typescript
// In ProductView.tsx — after relatedProducts block
import { ViewTracker } from '@entities/recently-viewed/ui/ViewTracker';
import { RecentlyViewedSection } from '@entities/recently-viewed/ui/RecentlyViewedSection';
import { Suspense } from 'react';

// Inside the return:
<ViewTracker productHandle={product.handle} productId={product.id} />
<Suspense fallback={null}>
  <RecentlyViewedSection locale={locale} />
</Suspense>
```

### Merging RecentlyViewed on Anonymous-to-Auth Upgrade

The existing `linkAnonymousDataToUser` in `on-link-account.ts` already handles `favoriteProduct.updateMany`. Add the same for `recentlyViewedProduct`:

```typescript
// In linkAnonymousDataToUser — inside the $transaction
await tx.recentlyViewedProduct.updateMany({
  where: { userId: anonymousUserId },
  data: { userId: newUserId },
});
```

This ensures viewed products carry over when an anonymous user signs up.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `sessionStorage` for recently viewed | DB-backed per-user (Prisma) | Phase 8 decision | Persists across devices, works server-side |
| Cookie-based newsletter forms | React Hook Form + Server Action + DB | Project standard | Consistent with all other forms |
| Separate anonymous/auth tracking | Unified `userId` via better-auth anonymous plugin | better-auth design | Single tracking column works for all users |

---

## Open Questions

1. **Do anonymous users auto-get a session before visiting a product page?**
   - What we know: `signIn.anonymous()` is only called from `AddToCartButton`. A fresh visitor to a product page may have no session.
   - What's unclear: Whether better-auth creates an anonymous session automatically on first request via middleware or only on explicit call.
   - Recommendation: Check `src/app/[locale]/layout.tsx` or middleware for auto-anonymous initialization. If not present, accept that views only track for users who have interacted with the cart. This is acceptable for Phase 8.

2. **Fetching recently viewed products by handle vs ID**
   - What we know: `RecentlyViewedProduct` stores `productHandle` (string). `getProductsByIds` uses `id:` Shopify filter. A parallel approach using `handle:` filter in the same query pattern or individual `getProduct` calls per handle.
   - What's unclear: Whether a batch `handle:A OR handle:B` query exists as an abstraction, or if individual `getProduct` calls (cached) are preferred.
   - Recommendation: For 10 products, use `Promise.all` with `storefrontClient.request` using a single `products(query: "handle:h1 OR handle:h2", first: 10)` call — mirrors `getProductsByIds` pattern exactly.

3. **i18n for newsletter hardcoded text**
   - What we know: CONTEXT.md says "hardcoded text" but the project uses `next-intl` for all user-facing strings.
   - What's unclear: Should the newsletter text be added to messages files or stay as literal Ukrainian strings?
   - Recommendation: Add to `messages/uk.json` and `messages/ru.json` under a `Newsletter` key. This is project convention and allows the Russian locale to display Russian text. It is "hardcoded" in the sense that Sanity doesn't control it, but it's not hardcoded in the i18n sense.

---

## Sources

### Primary (HIGH confidence)
- Project codebase direct inspection — `prisma/schema.prisma`, `src/features/auth/lib/auth.ts`, `src/features/auth/lib/on-link-account.ts`, `src/entities/home/ui/cardCarousel.tsx`, `src/entities/home/ui/with-scroll-state.tsx`, `src/entities/product/ui/ProductCard.tsx`, `src/entities/home/ui/product-carousel.tsx`, `src/widgets/product-view/ui/ProductView.tsx`, `src/features/product/api/toggle-favorite.ts`, `src/features/checkout/contact-info/ui/ContactInfoForm.tsx`
- `prisma/migrations/20260228135549_add_recently_viewed/migration.sql` — confirms RecentlyViewedProduct table already exists in DB with `userId` FK
- `package.json` — confirmed all needed libraries installed: better-auth 1.3.27, Prisma 7.0.0, react-hook-form 7.65.0, Zod 4.1.12, embla-carousel-react 8.6.0

### Secondary (MEDIUM confidence)
- CONTEXT.md phase decisions (2026-02-28) — locked implementation decisions used directly
- `src/features/auth/lib/auth.ts` — better-auth anonymous plugin configuration confirms anonymous users get real `User` records

### Tertiary (LOW confidence)
- Assumption that `products(query: "handle:h1 OR handle:h2")` works in Shopify Storefront API — mirrors the `id:` pattern in `getProductsByIds.ts` but not directly verified. Planner should note this as something to validate during implementation.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries in `package.json`, all patterns in codebase
- Architecture: HIGH — patterns directly derived from existing `toggle-favorite.ts`, `ContactInfoForm.tsx`, `CardCarousel`, `product-carousel.tsx`
- DB schema: HIGH — migration already applied; only `NewsletterSubscriber` is new
- Pitfalls: HIGH — based on direct code inspection of schema, session handling, cache directives
- Open questions: LOW — 3 items need validation during implementation but don't block planning

**Research date:** 2026-02-28
**Valid until:** 2026-03-30 (stable stack — no fast-moving dependencies)
