# Phase 11: Analyze Project and Prepare for Production — Integrate PostHog Monitoring - Research

**Researched:** 2026-03-08
**Domain:** Production readiness audit (security, code quality, env vars) + PostHog analytics integration + Next.js security headers
**Confidence:** HIGH (stack well-documented; codebase scanned directly; PostHog patterns verified from official tutorials)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Audit output**
- Fix issues directly — no separate report file. Findings get fixed inline.
- Audit covers: Security + Code quality + Environment variables
- Target: fix everything found, not just production-critical items

**Security audit scope**
- Scan for exposed secrets / env vars that should not be NEXT_PUBLIC_
- Check server actions for missing auth guards
- Review XSS and injection risks at system boundaries
- Verify Shopify Storefront API token is not exposed to client bundle

**Code quality audit scope**
- Remove all console.log / console.error left in production code paths (Phase 1 rule)
- Fix TypeScript `any` casts and `@ts-ignore` / `@ts-expect-error` where avoidable
- Remove dead code, unused imports, TODO comments that are blocking
- Clean up any `// @ts-ignore` patterns introduced during rapid development

**Environment variables audit**
- Document all env vars in use across the codebase
- Verify NEXT_PUBLIC_ prefix is only on vars that must be client-accessible
- Confirm no sensitive keys are exposed via NEXT_PUBLIC_ or leaked to client bundles

**PostHog events — checkout funnel (primary focus)**
- Track: product_viewed → add_to_cart → checkout_started → payment_initiated → order_placed
- Cart abandonment via funnel drop-off analysis (no separate event needed)

**PostHog events — cart interactions**
- `add_to_cart`: product id, variant id, price, quantity
- `remove_from_cart`: product id, variant id

**PostHog user identification**
- Call `posthog.identify(userId, { email })` when user signs in
- Anonymous events before sign-in merge automatically on identify
- On sign-out call `posthog.reset()`

**Error tracking**
- PostHog exception autocapture enabled (client-side only)
- Sentry is NOT added — PostHog exception capture is sufficient to start
- Previous Phase 1 decision to use Sentry is superseded

**Production checklist — build**
- `npm run build` must pass with zero TypeScript errors
- ESLint must pass clean
- `prisma generate` must run cleanly

**Production checklist — config**
- `next.config.ts` review: security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- CSP if feasible
- Verify `robots.txt` correct for production
- Verify `sitemap.xml` accessible at /sitemap.xml

**Deployment target**
- Vercel — env vars managed in Vercel dashboard

### Claude's Discretion
- Exact security header values (compatible with Shopify embeds and LiqPay iframe)
- robots.txt exact rules (derived from route structure)
- Whether to add a `.env.example` file documenting all required vars

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

---

## Summary

This phase combines three work streams: (1) a codebase audit with inline fixes for console logs, TypeScript any casts, and env var exposure, (2) PostHog analytics integration using the standard Next.js App Router Provider pattern, and (3) production configuration hardening (security headers, robots.txt, env documentation).

The codebase scan reveals significant concrete work: ~140+ console.log/console.error/console.warn calls scattered across server actions and client components, ~50+ TypeScript `any`/`@ts-ignore` suppressions, one env var security concern (`NEXT_PUBLIC_SANITY_REVALIDATE_SECRET` is a webhook secret that should not be client-exposed), and `robots.txt` currently blocks all crawlers (`disallow: '/'`) which would be catastrophic in production. All other sensitive secrets (SHOPIFY_ADMIN, LIQPAY_PRIVATE_KEY, DATABASE_URL, RESEND_API_KEY, BETTER_AUTH_SECRET) are correctly kept off NEXT_PUBLIC_.

PostHog integration for Next.js App Router is well-documented: install `posthog-js`, create a client-side Provider wrapping the app, add a separate PageView component with `usePathname` + `useSearchParams` (needed because App Router uses client-side navigation), and call `posthog.identify(userId, { email })` from the auth state effect. Exception autocapture is enabled via PostHog project settings (not posthog.init() options).

**Primary recommendation:** Fix robots.txt first (it blocks all crawlers in production), then integrate PostHog, then clean console logs and TypeScript any casts, then add security headers.

---

## Codebase Audit Findings

### CRITICAL: robots.txt blocks all crawlers

**File:** `app/robots.ts`
**Current state:**
```typescript
rules: [{ userAgent: '*', disallow: '/' }]
```
This blocks ALL search engine crawlers from the entire site. In production this means the site will not be indexed. Must be fixed before launch.

**Correct production rules:**
```typescript
rules: [
  {
    userAgent: '*',
    allow: '/',
    disallow: ['/api/', '/studio/', '/uk/auth/', '/ru/auth/', '/checkout/'],
  },
]
```

### SECURITY CONCERN: NEXT_PUBLIC_SANITY_REVALIDATE_SECRET

**Files:** `app/api/revalidate/menu/route.ts`, `src/shared/sanity/env.ts`

`NEXT_PUBLIC_SANITY_REVALIDATE_SECRET` is used as a webhook authentication secret in `app/api/revalidate/menu/route.ts`. The `NEXT_PUBLIC_` prefix means this value is bundled into the client-side JavaScript and visible to anyone who inspects the bundle. A webhook secret being publicly readable defeats its purpose.

**Fix:** Rename to `SANITY_REVALIDATE_SECRET` (no NEXT_PUBLIC_ prefix). It is used in two places:
- `app/api/revalidate/menu/route.ts` (API route — server-only, no issue reading non-public env)
- `src/shared/sanity/env.ts` (reads it — this file is used by both server and client; verify actual import paths)

**Note:** Sanity project ID and dataset are legitimately NEXT_PUBLIC_ — needed by the Sanity Studio client and live preview which run in the browser.

### Env vars: all sensitive keys are correctly server-only

The following sensitive vars do NOT have NEXT_PUBLIC_ prefix (confirmed by codebase scan):
- `SHOPIFY_STOREFRONT_SECRET_TOKEN` — Shopify Storefront API token
- `SHOPIFY_ADMIN_SECRET_TOKEN` / `SHOPIFY_ADMIN_API_KEY` — Admin API
- `DATABASE_URL` — Neon PostgreSQL
- `LIQPAY_PRIVATE_KEY` — payment gateway private key
- `RESEND_API_KEY` — email service
- `BETTER_AUTH_SECRET` — auth signing secret
- `SANITY_API_READ_TOKEN` — Sanity read token
- `GOOGLE_CLIENT_SECRET` — OAuth

**Legitimately NEXT_PUBLIC_:**
- `NEXT_PUBLIC_BASE_URL` — needed by better-auth client (runs in browser)
- `NEXT_PUBLIC_SITE_URL` — used in client-rendered components
- `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET` — Sanity Studio and live preview
- `NEXT_PUBLIC_SANITY_API_VERSION` — Sanity config
- `NEXT_PUBLIC_NP_WIDGET_API_KEY` — Nova Poshta widget is client-side
- `NEXT_PUBLIC_POSTHOG_KEY` — will be added (PostHog requires NEXT_PUBLIC_)
- `NEXT_PUBLIC_POSTHOG_HOST` — will be added

**Questionable:**
- `NEXT_PUBLIC_SANITY_REVALIDATE_SECRET` — webhook secret, should not be client-exposed (see above)

### Console log violations (high volume)

Files with `console.log` (highest priority to fix — Phase 1 rule):
- `src/entities/favorite/api/add-to-fav.ts:16` — logs session (PII violation)
- `src/entities/customer/api/create-customer-token.ts:34,56` — 2x console.log in auth path
- `src/entities/cart/api/update-cart-delivery-preferences.ts` — 10+ console.log/warn calls
- `src/entities/cart/api/update-discount-codes.ts:140` — `console.log(JSON.stringify(response, null, 2))` in production
- `src/entities/cart/api/get.ts:174` — `console.log('🚀 ~ getCart ~ error:', error)`
- `src/entities/recently-viewed/api/record-view.ts:11` — `console.log('recordProductView', ...)`
- `src/entities/recently-viewed/ui/ViewTracker.tsx:22` — client component console.log
- `src/entities/home/ui/main-collection-grid.tsx:24` — `console.log(JSON.stringify(...))` in RSC
- `src/shared/lib/clients/shopify-factory.ts:184` — `console.log(JSON.stringify(body, null, 2))`
- `src/features/header/language-switcher/api/set-locale.ts:5` — logs on every locale switch
- `src/features/header/navigation/api/setCookieGender.ts:8` — logs on every gender cookie set
- `src/shared/lib/customer-account.ts:48` — logs mapped user data (PII)
- `src/features/checkout/delivery/api/saveDeliveryInfo.ts:120` — success log in production
- `src/shared/lib/clients/storefront-client.ts:70` — logs fetch details
- `src/features/product/quick-buy/api/create-quick-order.ts:135,160` — 2x debug logs
- `src/features/novaPoshta/ui/NovaPoshtaButton.tsx` — 10+ console.log/warn calls (geolocation debug)
- `src/features/collection/ui/ActiveFilterChip.tsx:22` — logs filter object
- `src/features/collection/ui/ActiveFiltersCarousel.tsx:29` — logs active filters
- `src/features/header/cart/ui/RemoveItemButton.tsx:25` — logs on every remove
- `src/shared/sanity/schemaTypes/shopify/shemas/objects/global/linkInternal.ts:35` — logs selection

Files with `console.error` in error catch blocks (acceptable, but remove debug-looking ones):
- `src/entities/cart/api/get.ts:174` — uses emoji `🚀` which is a debug marker
- `src/entities/customer/api/create-customer.ts:96` — uses emoji `🚀`

### TypeScript any suppressions

~50+ instances of `as any`, `@ts-ignore`, `@ts-expect-error`. High-value targets:
- `src/features/home/ui/HeroPageBuilder.tsx` — 10+ `(block as any)` spreads (TYPE-01 requirement)
- `src/features/checkout/payment/ui/PaymentForm.tsx` — 3x `@ts-ignore`
- `src/features/checkout/delivery/ui/DeliveryForm.tsx` — 2x `@ts-ignore`
- `src/entities/slider/ui/Slider.tsx` — 2x `@ts-expect-error sanity`
- `src/entities/product/ui/AddToCartButton.tsx` — 2x `@ts-expect-error`
- `src/features/collection/ui/CollectionFilters.tsx` — `as any` on i18n key lookup
- `src/entities/home/ui/SyncedCarousels.tsx` — `product as any as Product`

### Dead code

- `src/entities/favorite/api/add-to-fav.ts` — TODO comment, stub implementation (logs but doesn't write DB). `toggleFavoriteProduct` in `src/features/product/api/toggle-favorite.ts` is the real implementation. The `addToFavorites` stub should be removed or completed.

### Server actions security check

All security-sensitive server actions check session before operating. Confirmed with `auth.api.getSession({ headers: await headers() })` in:
- `src/features/order/api/create.ts` — returns error if no session
- `src/features/checkout/*/api/*` — all guarded
- `src/features/product/api/toggle-favorite.ts` — checks `session?.user?.id`
- Cart operations — all guarded

**One stub that logs session data:** `src/entities/favorite/api/add-to-fav.ts` has `console.log(..., session)` on line 16 — PII violation.

---

## Standard Stack

### Core (PostHog)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| posthog-js | ^1.357.1 | Client-side analytics, event capture, session replay | Official PostHog browser SDK, React hooks included |

**Installation:**
```bash
npm install posthog-js
```
No `posthog-node` needed — exception autocapture is client-side only per the locked decision. If server-side event capture is added later, add `posthog-node`.

### Env vars required for PostHog
```
NEXT_PUBLIC_POSTHOG_KEY=phc_XXXX
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```
`NEXT_PUBLIC_POSTHOG_HOST` should be `https://eu.i.posthog.com` for EU data residency (PostHog EU cloud) or `https://us.i.posthog.com` for US. Confirm with project settings.

---

## Architecture Patterns

### Recommended PostHog File Structure

```
src/
├── shared/
│   └── lib/
│       └── posthog/
│           ├── PostHogProvider.tsx     # Client component, posthog.init()
│           ├── PostHogPageView.tsx     # Client component, usePathname tracking
│           └── usePostHogIdentify.ts   # Hook: identify/reset on auth state change
```

Or co-locate under `src/features/analytics/` per FSD if preferred.

### Pattern 1: PostHogProvider (Client Component)

**What:** Wraps posthog.init() client-side and provides PostHog context via posthog-js/react
**When to use:** In the root layout as a client component wrapper

```typescript
// src/shared/lib/posthog/PostHogProvider.tsx
'use client';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false,          // manual pageview via PostHogPageView
    autocapture: true,                // clicks, form submissions, etc.
    // Exception autocapture is enabled in PostHog project settings, not here
  });
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <PHProvider client={posthog}>{children}</PHProvider>;
}
```

**Critical:** `typeof window !== 'undefined'` guard prevents init running on the server. Without this guard, posthog.init() will throw during SSR because it accesses browser APIs.

### Pattern 2: Manual Pageview Tracking

**What:** Captures $pageview on every route change (needed because App Router uses client-side navigation — PostHog's automatic pageview detection misses route changes)
**When to use:** Placed inside PostHogProvider, wrapped in Suspense

```typescript
// src/shared/lib/posthog/PostHogPageView.tsx
'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';

export function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', { $current_url: url });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}
```

**In layout.tsx** (place inside Suspense because useSearchParams() requires it):
```typescript
<PostHogProvider>
  <Suspense fallback={null}>
    <PostHogPageView />
  </Suspense>
  {children}
</PostHogProvider>
```

### Pattern 3: User Identification

**What:** Links PostHog anonymous session to authenticated user when better-auth session resolves
**Where:** Client component that has access to the session — co-locate with existing auth state logic

The project already exports `useSession` from `src/features/auth/lib/client.ts`.

```typescript
// src/shared/lib/posthog/usePostHogIdentify.ts
'use client';
import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import { useSession } from '@features/auth/lib/client';

export function usePostHogIdentify() {
  const posthog = usePostHog();
  const { data: session } = useSession();

  useEffect(() => {
    if (!posthog) return;

    if (session?.user) {
      if (!posthog._isIdentified()) {
        posthog.identify(session.user.id, {
          email: session.user.email,
          name: session.user.name,
        });
      }
    } else {
      if (posthog._isIdentified()) {
        posthog.reset();
      }
    }
  }, [posthog, session]);
}
```

Call `usePostHogIdentify()` from a persistent client component (e.g., the existing `GenderProvider` or a new `AnalyticsProvider`).

**Challenge with better-auth + PostHog:** `posthog.identify()` must be called client-side. better-auth's `hooks.after` runs server-side. Solution: watch the `useSession()` hook in a client component (shown above) rather than trying to identify from server hooks.

### Pattern 4: Custom Event Capture

**What:** Capture checkout funnel events from existing client component action points
**Where:** Within existing button handlers and navigation events

```typescript
// In AddToCartButton.tsx (already a client component)
import { usePostHog } from 'posthog-js/react';

const posthog = usePostHog();

// On successful add to cart:
posthog?.capture('add_to_cart', {
  product_id: productId,
  variant_id: variantId,
  price: price,
  quantity: quantity,
});
```

**Funnel events and their trigger points:**
| Event | File | Trigger |
|-------|------|---------|
| `product_viewed` | `src/entities/recently-viewed/ui/ViewTracker.tsx` | component mount (already fires on product page load) |
| `add_to_cart` | `src/entities/product/ui/AddToCartButton.tsx` | after `result.success` (line ~137) |
| `checkout_started` | Checkout entry point / router push to `/checkout` | on navigation to checkout |
| `payment_initiated` | `src/features/checkout/payment/ui/PaymentForm.tsx` | on form submit before createOrder |
| `order_placed` | `src/features/checkout/payment/ui/PaymentForm.tsx` | after successful createOrder |
| `remove_from_cart` | `src/features/header/cart/ui/RemoveItemButton.tsx` | on successful remove |

### Pattern 5: Exception Autocapture

**What:** PostHog captures unhandled JS exceptions automatically when enabled in project settings
**Setup:** In PostHog Dashboard → Project Settings → Error Tracking → toggle "Enable exception autocapture"

No code changes required for basic autocapture. PostHog will inject an error listener after `posthog.init()`.

For Next.js App Router error boundaries, create `error.tsx` files and optionally call `posthog.captureException(error)` manually for caught errors that don't propagate:

```typescript
// app/[locale]/(frontend)/error.tsx (already exists per git status)
'use client';
import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';

export default function Error({ error }: { error: Error }) {
  const posthog = usePostHog();
  useEffect(() => {
    posthog?.captureException(error);
  }, [error, posthog]);
  // ... render error UI
}
```

**Note:** `app/[locale]/(frontend)/error.tsx` appears in git status as a new untracked file — it already exists and may already handle errors. Review before adding PostHog to it.

### Pattern 6: Security Headers in next.config.ts

```typescript
// next.config.ts — add headers() function
async headers() {
  const securityHeaders = [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' }, // SAMEORIGIN not DENY — LiqPay uses iframe
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(self)', // geolocation needed for NP widget
    },
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload',
    },
    { key: 'X-DNS-Prefetch-Control', value: 'on' },
  ];

  return [
    {
      source: '/(.*)',
      headers: securityHeaders,
    },
  ];
},
```

**CSP note:** A strict CSP is difficult with Shopify CDN, LiqPay, Nova Poshta widget, Sanity Studio, and PostHog all making external requests. Recommend deferring CSP to a follow-up phase or using report-only mode initially. The other headers provide meaningful protection without CSP complexity.

**X-Frame-Options: SAMEORIGIN** is correct for this project because LiqPay loads content in an iframe within the same site context. DENY would break this.

**Geolocation permission:** Nova Poshta widget (`NovaPoshtaButton.tsx`) uses `navigator.geolocation` — `Permissions-Policy` must include `geolocation=(self)`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Analytics events | Custom event queue | posthog.capture() | Handles batching, retry, offline queue |
| User identity merge | Custom anonymous→auth merge | PostHog's built-in merge via identify() | PostHog automatically merges anonymous events on identify |
| Exception capture | Custom window.onerror handler | PostHog exception autocapture | Captures stack traces, source maps, browser context |
| Pageview tracking | Route change listener | PostHogPageView with usePathname | Handles parallel routes, intercepted routes, search params |
| Security headers | Per-route middleware | next.config.ts headers() | Applied at the edge, before any middleware |

---

## Common Pitfalls

### Pitfall 1: posthog.init() Running on Server (SSR crash)

**What goes wrong:** PostHog's init() accesses `window`, `document`, and `navigator` — server-safe APIs. Without a `typeof window !== 'undefined'` guard, the app crashes during SSR.
**Why it happens:** Next.js App Router server renders components. Even a `'use client'` component has its module loaded on the server for SSR.
**How to avoid:** Guard `posthog.init()` with `if (typeof window !== 'undefined')` or call it only inside `useEffect`.
**Warning signs:** `ReferenceError: window is not defined` in server logs.

### Pitfall 2: Duplicate Pageviews

**What goes wrong:** PostHog JS automatically fires `$pageview` on init. If `capture_pageview: false` is not set AND you also have a `PostHogPageView` component firing events, each page visit gets counted twice.
**How to avoid:** Always set `capture_pageview: false` in `posthog.init()` when using manual tracking.

### Pitfall 3: useSearchParams() Without Suspense

**What goes wrong:** Next.js requires `useSearchParams()` to be wrapped in a `<Suspense>` boundary. Without it, the entire route opts out of static rendering and triggers a Next.js build warning/error.
**How to avoid:** Wrap `<PostHogPageView>` in `<Suspense fallback={null}>` in layout.tsx.

### Pitfall 4: identify() Called On Every Render

**What goes wrong:** Calling `posthog.identify()` on every component render creates excessive API calls and can reset the session.
**How to avoid:** Use `posthog._isIdentified()` to guard the call. Only call identify once per session per user.

### Pitfall 5: robots.txt Blocking Production Traffic (CRITICAL — ALREADY EXISTS)

**What goes wrong:** `app/robots.ts` currently returns `disallow: '/'` which blocks all crawlers. This is catastrophic for SEO in production.
**Why it happens:** Typically set during development to prevent indexing of staging environments, then forgotten.
**How to avoid:** Fix before production deploy. Use environment-based logic if needed: `process.env.NODE_ENV === 'production' ? allow : disallow`.

### Pitfall 6: console.log with PII in Production

**What goes wrong:** `src/entities/favorite/api/add-to-fav.ts` logs the full session object, which includes user ID and email. `src/shared/lib/customer-account.ts` logs `mappedUserData` (user data). In production these appear in Vercel function logs, visible to developers with dashboard access.
**How to avoid:** Remove all console.log calls from production code paths. Use console.error only in catch blocks for error conditions, without PII.

### Pitfall 7: NEXT_PUBLIC_ on a Webhook Secret

**What goes wrong:** `NEXT_PUBLIC_SANITY_REVALIDATE_SECRET` is bundled into client JS. Anyone who reads the JS bundle can extract this value and call the revalidation endpoint.
**How to avoid:** Rename to `SANITY_REVALIDATE_SECRET`. Update both files that reference it. The API route is server-only, the sanity env.ts needs to be checked for client usage.

### Pitfall 8: Vercel Analytics Already Installed

`@vercel/analytics` and `@vercel/speed-insights` are already in `package.json`. Check that they are already initialized in the layout so PostHog is added alongside them (not duplicating purposes). Vercel Analytics tracks request-level data; PostHog tracks user behavior events. Both are needed.

---

## Code Examples

Verified patterns from official sources:

### PostHogProvider (client component, SSR-safe)
```typescript
// Source: PostHog official tutorial — posthog.com/tutorials/nextjs-app-directory-analytics
// Source: reetesh.in/blog/posthog-integration-in-next.js-app-router

'use client';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false,
    autocapture: true,
  });
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <PHProvider client={posthog}>{children}</PHProvider>;
}
```

### PostHogPageView component
```typescript
// Source: reetesh.in/blog/posthog-integration-in-next.js-app-router

'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';

export function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', { $current_url: url });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}
```

### User identification with session guard
```typescript
// Source: clerk.com/blog/how-to-use-clerk-with-posthog-identify-in-nextjs (adapted for better-auth)

useEffect(() => {
  if (!posthog) return;
  if (session?.user && !posthog._isIdentified()) {
    posthog.identify(session.user.id, {
      email: session.user.email,
      name: session.user.name,
    });
  } else if (!session?.user && posthog._isIdentified()) {
    posthog.reset();
  }
}, [posthog, session]);
```

### Security headers in next.config.ts
```typescript
// Source: nextjs.org/docs/pages/api-reference/config/next-config-js/headers
// Pattern verified by multiple Next.js security guides

async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      ],
    },
  ];
},
```

### robots.ts corrected
```typescript
// Source: nextjs.org/docs/app/api-reference/file-conventions/metadata/robots

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://miomio.com.ua';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/studio/', '/uk/auth/', '/ru/auth/', '/checkout/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Sentry for error tracking | PostHog exception autocapture | Phase 11 decision | Eliminates Sentry SDK dependency; PostHog covers both analytics + errors |
| Manual robots.txt file | `app/robots.ts` (App Router convention) | Next.js App Router | Already implemented correctly, just wrong content |
| next-sitemap package | `app/sitemap.ts` (built-in) | Next.js 13+ | Already correctly implemented with pagination |
| posthog.init() in _app.js | `PostHogProvider` Client Component | Next.js App Router | SSR-safe pattern; server components can't initialize browser SDKs |

**Note on `defaults: '2026-01-30'` option:** Recent PostHog docs (early 2026) show a `defaults` config key. This is a newer option that applies a set of sensible defaults as of a given date. The CONTEXT.md specifies `autocapture: true` and `capture_exceptions: true` in init config — the `defaults` key may cover these. Verify in PostHog dashboard which settings it controls. If using `defaults`, still set `capture_pageview: false` explicitly.

---

## .env.example Recommendation

Claude's Discretion area: recommend adding `.env.example` with all required vars and safe placeholder values. This documents what Vercel env vars need to be set. Include:

```
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_POSTHOG_KEY=phc_XXXX
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-02-19
NEXT_PUBLIC_NP_WIDGET_API_KEY=your_np_api_key
BETTER_AUTH_SECRET=your_secret
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_SECRET_TOKEN=shpat_xxx
SHOPIFY_ADMIN_SECRET_TOKEN=shpat_xxx
SHOPIFY_ADMIN_API_KEY=xxx
SHOPIFY_ADMIN_API_SECRET_KEY=shpss_xxx
SHOPIFY_API_VERSION=2025-10
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID=xxx
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET=xxx
SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID=xxx
DATABASE_URL=postgresql://...
LIQPAY_PRIVATE_KEY=xxx
LIQPAY_PUBLIC_KEY=xxx
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@your-domain.com
ESPUTNIK_API_KEY=xxx
ESPUTNIK_API_LOGIN=xxx
SANITY_API_READ_TOKEN=skXxx
SANITY_REVALIDATE_SECRET=xxx   # renamed from NEXT_PUBLIC_SANITY_REVALIDATE_SECRET
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
BLOB_BASE_URL=https://...
PRICE_APP_URL=https://...
```

---

## Open Questions

1. **PostHog EU vs US data residency**
   - What we know: Two hosts exist — `eu.i.posthog.com` and `us.i.posthog.com`
   - What's unclear: Which region the project uses (depends on where the PostHog account was created)
   - Recommendation: Check PostHog dashboard → Project Settings → "Project API Key" section for the correct host URL. Default to EU for GDPR compliance given Ukrainian user base.

2. **`capture_exceptions: true` vs project settings toggle**
   - What we know: CONTEXT.md mentions `capture_exceptions: true` as a posthog.init() option. Research shows exception autocapture is enabled via PostHog Dashboard → Error Tracking toggle, not necessarily a JS init option.
   - What's unclear: Whether `capture_exceptions` is a valid posthog.init() key in posthog-js 1.x or if it's dashboard-only
   - Recommendation: Enable the toggle in PostHog dashboard AND include `capture_exceptions: true` in init config (belt-and-suspenders). If the key is unrecognized it will be silently ignored.

3. **`NEXT_PUBLIC_SANITY_REVALIDATE_SECRET` usage in sanity/env.ts**
   - What we know: `src/shared/sanity/env.ts` exports this as an env var. Need to verify if this export is consumed by any client-side code.
   - What's unclear: Whether `sanity/env.ts` is imported in any `'use client'` components
   - Recommendation: Before renaming, grep import paths of `sanity/env.ts` to confirm it's only used server-side.

4. **TypeScript any casts — how many are fixable vs truly needed**
   - What we know: ~50+ suppressions exist; HeroPageBuilder has the highest concentration (TYPE-01 requirement target)
   - What's unclear: Exact count of avoidable vs blocked-by-sanity-types casts
   - Recommendation: Fix HeroPageBuilder first (satisfies TYPE-01); for Sanity-related suppression where `typegen` could fix it, run `npm run typegen` after Sanity schema updates.

---

## Sources

### Primary (HIGH confidence)
- https://posthog.com/tutorials/nextjs-app-directory-analytics — PostHog official App Router tutorial
- https://posthog.com/docs/libraries/next-js — PostHog official Next.js docs
- https://clerk.com/blog/how-to-use-clerk-with-posthog-identify-in-nextjs — identify/reset pattern
- https://nextjs.org/docs/pages/api-reference/config/next-config-js/headers — Next.js security headers API
- Direct codebase scan — console.log violations, NEXT_PUBLIC_ env vars, robots.ts, sitemap.ts, next.config.ts

### Secondary (MEDIUM confidence)
- https://reetesh.in/blog/posthog-integration-in-next.js-app-router — PostHog App Router provider pattern (cross-referenced with official tutorial)
- https://posthog.com/docs/error-tracking/installation/nextjs — PostHog error tracking (JS-rendered, content extracted via search)
- https://blog.logrocket.com/using-next-js-security-headers/ — security header values and tradeoffs

### Tertiary (LOW confidence)
- WebSearch summary on `defaults: '2026-01-30'` posthog.init option — unverified against PostHog JS config reference directly; flag for validation

---

## Metadata

**Confidence breakdown:**
- PostHog integration pattern: HIGH — official tutorial code extracted, patterns verified from multiple sources
- Security headers: HIGH — Next.js official docs, standard HTTP security references
- Codebase audit findings: HIGH — direct file scan, not inference
- Exception autocapture config: MEDIUM — dashboard toggle confirmed, JS init option `capture_exceptions` not directly verified against posthog-js source
- `SANITY_REVALIDATE_SECRET` rename: HIGH — NEXT_PUBLIC_ analysis is deterministic

**Research date:** 2026-03-08
**Valid until:** 2026-04-08 (PostHog JS releases frequently but core integration API is stable; security header values are stable)
