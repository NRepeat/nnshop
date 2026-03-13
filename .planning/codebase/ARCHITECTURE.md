# Architecture

**Analysis Date:** 2026-02-23

## Pattern Overview

**Overall:** Feature-Sliced Design (FSD) + Next.js 16 App Router with SSR-first Server Components

**Key Characteristics:**
- Server-first data fetching with Next.js Server Components and Server Actions
- Feature/domain-organized code structure (not technical organization)
- Multi-layer architecture: entities → features → widgets → pages
- Polyglot data sources: Shopify Storefront API (GraphQL), Shopify Admin API, Sanity CMS (GROQ), PostgreSQL (Prisma)
- Client state management via Zustand with local persistence
- Static type generation from GraphQL and Sanity schemas at build time

## Layers

**Entities:**
- Purpose: Business domain models and reusable data contracts (product, cart, collection, user, order, etc.)
- Location: `src/entities/`
- Contains: API query functions, UI components for entity display, Zustand models for entity-specific state, schemas/validation
- Depends on: `@shared/lib/` (clients, types, utilities)
- Used by: Features and widgets that need to display or manage entities
- Example: `src/entities/product/` contains `getProduct()` query, `Product` type, UI components like category displays

**Features:**
- Purpose: User-facing business workflows and feature modules (auth, checkout, product quick-buy, favorites, etc.)
- Location: `src/features/`
- Contains: Feature-specific UI components, server actions, API functions, local state stores, form schemas, business logic
- Depends on: Entities, shared utilities, other features (cart depends on product, checkout depends on cart)
- Used by: Widgets, page layouts, other features
- Example: `src/features/checkout/` has payment, delivery, contact-info sub-features with their own api/, ui/, model/, schema/

**Widgets:**
- Purpose: Composite UI blocks that orchestrate features and entities (header, footer, checkout flow, product page sections)
- Location: `src/widgets/`
- Contains: High-level page section components that combine multiple features
- Depends on: Features, entities, shared UI
- Used by: App router page.tsx and layout.tsx files
- Example: `src/widgets/checkout/ui/` is the checkout orchestrator; `src/widgets/header/ui/` composes navigation, search, cart, account

**Shared:**
- Purpose: Cross-cutting concerns and utilities used everywhere
- Location: `src/shared/`
- Contains:
  - `lib/clients/` — Shopify (Storefront, Admin), Sanity, Prisma clients with retry logic
  - `lib/shopify/` — Shopify GraphQL types (generated), query/mutation helpers
  - `lib/seo/` — Metadata generation, JSON-LD schemas
  - `lib/utils/` — General utilities (HTML decoding, vendor mapping)
  - `lib/validation/` — Zod schema definitions
  - `sanity/` — Sanity CMS client, schema types, preview components, GROQ query builders
  - `store/` — Zustand stores (cart notes, favorites, path history)
  - `ui/` — shadcn/ui components and custom UI primitives
  - `hooks/` — Custom React hooks
  - `i18n/` — next-intl routing and localization setup
  - `types/` — Shared TypeScript types for cart, products, etc.
  - `utils/` — Shared utility functions

**App Router:**
- Purpose: Route handling and page composition
- Location: `app/[locale]/`
- Routes organized as: `[locale]/(frontend)` with groups like `(home)`, `(product)`, `(checkout)` for shared layouts
- Parallel routes: `@auth/` for authentication modal, `@modal/` for quick-view
- Uses Server Components by default; Client Components suffixed with `Client.tsx`

## Data Flow

**Product Browsing Flow:**

1. User visits `/uk/woman/collection/[slug]`
2. `app/[locale]/(frontend)/(home)/[gender]/(collection)/[slug]/page.tsx` (Server Component)
3. Server Component calls `getCollection()` from `src/entities/collection/api/`
4. Entity API fetches from Shopify Storefront via `storefrontClient.request()` with `@inContext(language: uk)`
5. Component renders collection UI, passes product data to feature components
6. Client-side features (favorites, quick-buy) hydrate with Zustand stores and server actions

**Checkout Flow:**

1. User navigates to `/[locale]/checkout/info`
2. Parallel checkout layout renders from `src/widgets/checkout/`
3. Contact info feature (`src/features/checkout/contact-info/`) loads via `get-contact-info.ts` server action
4. Form submission triggers `save-contact-info.ts` server action with Zod validation
5. Prisma updates session in PostgreSQL
6. Server action calls `revalidatePath()` to refresh UI
7. Receipt sidebar (parallel route `@receipt/`) updates client-side via Zustand

**State Management Flow:**

- **Server State:** Session, database records (user, cart, orders, favorites) — fetched server-side in Server Components
- **URL State:** Search params via `nuqs` (e.g., gender, sort, page) — persistent in URL, hydrated client-side
- **Client State:** Cart notes, favorites toggle optimism, form state — Zustand stores with localStorage persistence
- **Transient State:** Modal visibility, dropdown menus — React local state in Client Components

**Data Fetching Patterns:**

```
Server Component renders
  ↓
Calls entity API function (getProduct, getCollection, etc.)
  ↓
Entity API uses storefrontClient.request() or sanityFetch()
  ↓
Returns typed data (GraphQL codegen or Sanity types)
  ↓
Component renders with data or suspends (Suspense boundary)
  ↓
Client Components wrap interactive parts (favorites button, quick-buy modal)
  ↓
Client handlers call server actions for mutations (toggleFavorite, savePaymentInfo, etc.)
```

## Key Abstractions

**Shopify Client System:**
- Purpose: Abstract GraphQL API communication with retry logic and auth handling
- Examples:
  - `src/shared/lib/clients/storefront-client.ts` — Public Storefront API for products/collections/cart
  - `src/shared/lib/clients/admin-client.ts` — Admin API for order management (via OAuth token cached in DB)
  - `src/shared/lib/clients/customer-account-client.ts` — Customer Account API for customer portals
- Pattern: Implements `ShopifyClient` interface; `StorefrontClient` has retry logic (3 attempts, exponential backoff for 502/503)

**Entity API Layer:**
- Purpose: Centralize data fetching with caching tags and locale awareness
- Examples: `src/entities/product/api/getProduct.ts`, `src/entities/collection/api/getCollection.ts`
- Pattern: Async functions that call `storefrontClient.request()` or `sanityFetch()`, return typed data, declare cache tags for revalidation

**Server Actions:**
- Purpose: Handle mutations from Client Components without exposing API routes
- Examples: `src/features/product/api/toggle-favorite.ts`, `src/features/checkout/contact-info/api/save-contact-info.ts`
- Pattern: `'use server'` directive at file top, receive session/user from context, validate input (Zod), mutate database/external services, revalidate cache

**Zustand Stores:**
- Purpose: Lightweight client-side state with optional persistence
- Examples: `src/shared/store/use-cart-note-store.ts`, `src/shared/store/use-fav-store.ts`
- Pattern: `create<State>()` with `persist()` middleware, methods for read/write, localStorage key

**Form Schemas:**
- Purpose: Type-safe form validation and generation
- Location: Co-located in feature `schema/` subdirectories (e.g., `src/features/checkout/payment/schema/`)
- Tool: `react-hook-form` + `Zod v4` + `@hookform/resolvers`
- Pattern: `Zod.object()` schema defines form shape, resolver validates, component renders inputs with error messages

## Entry Points

**App Entry (Root Layout):**
- Location: `app/[locale]/(frontend)/layout.tsx`
- Triggers: Every request with `[locale]` parameter
- Responsibilities: Wrap with providers (`NextIntlClientProvider`, `NuqsAdapter`, `Toaster`), render `<Header />`, `<Footer />`, main content slot

**Middleware/Proxy:**
- Location: `proxy.ts` at project root
- Triggers: All non-API requests (matcher: `/((?!api|trpc|_next|_vercel|studio|.*\\..*).*)/`)
- Responsibilities:
  - Redirect `/` → `/uk/woman` (default gender)
  - Redirect locale-less paths → `/uk/[path]` (enforce locale prefix)
  - Fix typo: `/uk/productt/[slug]` → `/uk/product/[slug]` (301)
  - Delegate to `next-intl` middleware for locale routing

**Sanity Studio:**
- Location: `app/studio/[[...tool]]/page.tsx`
- Triggers: `/studio` route
- Responsibilities: Render Sanity Studio for CMS content editing

**Page Routes:**
- Collection: `app/[locale]/(frontend)/(home)/[gender]/(collection)/[slug]/page.tsx` — Server Component fetching collection + products
- Product: `app/[locale]/(frontend)/(product)/product/[slug]/page.tsx` — Server Component with metadata, favorites, related products
- Checkout: `app/[locale]/(frontend)/(checkout)/checkout/[step]/page.tsx` — Multi-step form with parallel `@receipt/` sidebar
- Auth Modal: `app/[locale]/(frontend)/@auth/(.)auth/[authView]/page.tsx` — Intercepted route for sign-in/sign-up as modal

## Error Handling

**Strategy:** Error boundaries, try-catch in server actions, typed error responses, user-friendly fallbacks

**Patterns:**

- **Server Actions:** Wrap in try-catch, return `{ success: false, error: 'ERROR_CODE' }` object (see `toggleFavoriteProduct()`)
- **Entity APIs:** Throw on HTTP/GraphQL errors; caller (Server Component) handles via error boundary or `notFound()`
- **Shopify Client:** Retry on 502/503 with exponential backoff; throw after max retries
- **Form Validation:** Zod schema errors collected, displayed inline in form (via react-hook-form)
- **Page Not Found:** Server Components call `notFound()` (e.g., missing product); renders 404 page
- **Request Cancellation:** Storefront Client explicitly ignores AbortError (user navigated away)

## Cross-Cutting Concerns

**Logging:** `console.log()` / `console.error()` at key points (Shopify retries, errors). No centralized logger configured.

**Validation:** Zod schemas co-located in feature `schema/` dirs. Applied in:
- Form submission (react-hook-form)
- Server action parameters (explicit validation calls)
- API request bodies (payment, delivery info)

**Authentication:** `better-auth` server config at `src/features/auth/lib/auth.ts`; client at `src/features/auth/lib/auth-client.ts`
- Supports: Email/password, Google OAuth, Shopify OAuth
- Anonymous sessions merge on sign-in
- Session passed as parameter to server actions

**Caching & Revalidation:**
- Next.js `revalidatePath()` / `revalidateTag()` for ISR
- Shopify Storefront uses `cache: 'force-cache'` with tags (e.g., `product-${id}`)
- Sanity uses `revalidate: 60` by default, `tags: []` disables caching
- Prisma generates to non-standard path: `generated/prisma`

**Internationalization:**
- `next-intl` for routing and message translations
- Locales: `uk` (default), `ru` in `src/shared/i18n/routing.ts`
- Messages: JSON files in `messages/` directory
- Shopify queries use `@inContext(language: uk | ru)` directive
- URLs always include locale prefix: `/uk/...` or `/ru/...`

**SEO:**
- Metadata generation: `src/shared/lib/seo/generateMetadata.ts` for products
- JSON-LD schemas: `src/shared/lib/seo/jsonld/` for structured data
- OG image generation: `app/[locale]/(frontend)/opengraph-image.tsx`
- Redirects from Sanity fetched at build time via `next.config.ts`

---

*Architecture analysis: 2026-02-23*
