# Codebase Structure

**Analysis Date:** 2026-02-23

## Directory Layout

```
nnshop/
├── app/                          # Next.js 16 App Router with dynamic [locale] and route groups
│   └── [locale]/                 # Locale segment (uk, ru)
│       ├── (frontend)/           # Route group for frontend pages
│       │   ├── (home)/           # Home/collection pages
│       │   │   ├── [gender]/     # Gender segment (man, woman)
│       │   │   │   ├── (collection)/
│       │   │   │   │   └── [slug]/     # Collection detail page
│       │   │   │   └── page.tsx        # Gender home page
│       │   │   └── layout.tsx          # Gender layout
│       │   ├── (product)/              # Product pages route group
│       │   │   └── product/
│       │   │       └── [slug]/
│       │   │           └── page.tsx    # Product detail page
│       │   ├── (checkout)/             # Checkout pages route group
│       │   │   ├── checkout/
│       │   │   │   ├── info/
│       │   │   │   ├── delivery/
│       │   │   │   ├── payment/
│       │   │   │   ├── success/[orderId]/
│       │   │   │   ├── @receipt/       # Parallel route for sidebar
│       │   │   │   └── layout.tsx      # Multi-step wrapper
│       │   │   └── layout.tsx          # Checkout section layout
│       │   ├── @auth/                  # Parallel route for auth modal
│       │   │   ├── (.)auth/[authView]/ # Intercepted route
│       │   │   └── [...catchAll]/      # Fallback when modal not active
│       │   ├── @modal/                 # Parallel route for quick-view modal
│       │   │   └── (.)quick/[slug]/
│       │   ├── brand/[slug]/           # Brand detail
│       │   ├── brands/                 # Brands listing
│       │   ├── cart/                   # Shopping cart page
│       │   ├── favorites/              # Favorites listing
│       │   ├── orders/                 # User orders
│       │   ├── search/                 # Search results
│       │   ├── info/[slug]/            # CMS info pages (blog, about, etc.)
│       │   ├── layout.tsx              # Main layout (header, footer, providers)
│       │   └── opengraph-image.tsx     # Dynamic OG image
│       └── layout.tsx                  # Locale/i18n wrapper layout
│
├── app/studio/                   # Sanity CMS Studio
│   └── [[...tool]]/
│       ├── layout.tsx
│       └── page.tsx
│
├── src/                          # Source code (Feature-Sliced Design)
│   ├── app/                      # App-level providers and setup
│   │   └── providers/
│   │       ├── index.tsx         # Root providers component
│   │       └── authUIProvider.tsx
│   │
│   ├── entities/                 # Business domain models (reusable data contracts)
│   │   ├── product/              # Product entity
│   │   │   ├── api/
│   │   │   │   └── getProduct.ts
│   │   │   ├── ui/               # Reusable product display components
│   │   │   └── index.ts          # Public exports
│   │   ├── collection/           # Collection entity
│   │   │   ├── api/
│   │   │   ├── ui/
│   │   │   └── index.ts
│   │   ├── cart/                 # Shopping cart
│   │   │   ├── api/
│   │   │   └── index.ts
│   │   ├── order/                # Order records
│   │   │   ├── api/
│   │   │   ├── model/            # Zustand store
│   │   │   └── index.ts
│   │   ├── user/                 # User profile
│   │   │   ├── api/
│   │   │   └── index.ts
│   │   ├── favorite/             # Favorite tracking
│   │   │   ├── api/
│   │   │   └── index.ts
│   │   ├── brand/                # Brand entity
│   │   ├── hero/                 # Hero section entity
│   │   ├── liqpay/               # Payment gateway state
│   │   │   ├── model/
│   │   │   └── ui/
│   │   ├── checkout/             # Checkout entity
│   │   │   └── ui/
│   │   ├── announcement-bar/     # Site-wide announcements
│   │   ├── author/               # Blog author entity
│   │   ├── category/             # Product category
│   │   ├── customer/             # Shopify customer
│   │   ├── feature/              # Feature/highlight entity
│   │   ├── faq/                  # FAQ items
│   │   ├── hero/                 # Hero content
│   │   ├── metaobject/           # Shopify metaobjects
│   │   ├── path-sync/            # URL path tracking
│   │   ├── published-at/         # Publication date display
│   │   ├── slider/               # Image slider entity
│   │   ├── split-image/          # Split layout entity
│   │   ├── thank-page/           # Thank you page entity
│   │   ├── title/                # Title/heading entity
│   │   └── home/                 # Home page entities
│   │
│   ├── features/                 # User-facing business workflows (feature modules)
│   │   ├── auth/                 # Authentication
│   │   │   ├── ui/
│   │   │   └── lib/
│   │   │       ├── auth.ts       # better-auth server config
│   │   │       ├── auth-client.ts # better-auth client config
│   │   │       ├── on-link-account.ts # Server action
│   │   │       └── shopify/      # Shopify OAuth flow
│   │   ├── checkout/             # Multi-step checkout
│   │   │   ├── ui/
│   │   │   ├── api/              # Server actions (save steps, generate order ID)
│   │   │   ├── schema/           # Zod checkout form schema
│   │   │   ├── contact-info/     # Address/email collection
│   │   │   │   ├── ui/
│   │   │   │   ├── api/
│   │   │   │   └── schema/
│   │   │   ├── delivery/         # Shipping method selection (Nova Poshta)
│   │   │   │   ├── ui/
│   │   │   │   ├── api/
│   │   │   │   ├── model/
│   │   │   │   └── schema/
│   │   │   ├── payment/          # Payment gateway (LiqPay, bank transfer)
│   │   │   │   ├── ui/
│   │   │   │   ├── api/
│   │   │   │   ├── lib/          # LiqPay signing/validation
│   │   │   │   └── schema/
│   │   │   ├── receipt/          # Order confirmation sidebar
│   │   │   │   ├── ui/
│   │   │   │   └── model/        # Receipt state store
│   │   │   └── layout.tsx
│   │   ├── cart/                 # Shopping cart management
│   │   │   ├── ui/               # CartIcon, CartDropdown, CartPage
│   │   │   ├── api/              # resetCartSession.ts
│   │   │   └── index.ts
│   │   ├── product/              # Product features (favorites, quick-buy)
│   │   │   ├── ui/               # ProductOptions, Gallery, Description
│   │   │   ├── api/
│   │   │   │   ├── toggle-favorite.ts # Server action
│   │   │   │   ├── isProductFavorite.ts
│   │   │   │   └── subscribe-price.ts
│   │   │   └── quick-buy/        # Quick add to cart modal
│   │   │       ├── ui/
│   │   │       └── api/
│   │   ├── collection/           # Collection page features
│   │   │   ├── ui/
│   │   │   ├── api/              # getCollection.ts, related queries
│   │   │   └── actions.ts
│   │   ├── header/               # Header/navbar features
│   │   │   ├── ui/               # HeaderContainer, HamburgerMenu
│   │   │   ├── navigation/       # Menu, gender switcher
│   │   │   │   ├── ui/
│   │   │   │   └── api/          # saveGender.ts
│   │   │   ├── search/           # Search box
│   │   │   │   └── ui/
│   │   │   ├── cart/             # Cart dropdown
│   │   │   │   └── ui/
│   │   │   ├── account/          # User account dropdown
│   │   │   │   └── ui/
│   │   │   ├── language-switcher/ # Locale switcher
│   │   │   │   ├── ui/
│   │   │   │   └── api/          # set-locale.ts
│   │   ├── home/                 # Home page content
│   │   │   ├── ui/
│   │   │   └── api/              # fetchHeroContent.ts
│   │   ├── account/              # User account pages
│   │   │   └── ui/
│   │   ├── order/                # Order display/management
│   │   │   ├── ui/
│   │   │   └── api/
│   │   ├── novaPoshta/           # Delivery service integration
│   │   │   ├── ui/               # City/office selectors
│   │   │   ├── api/              # submit.ts (server action)
│   │   │   └── model/            # Zustand store for selected office
│   │   ├── favorites/            # Favorites page
│   │   │   └── ui/
│   │   ├── brand/                # Brand page
│   │   │   └── ui/
│   │   ├── blocks/               # CMS block features
│   │   │   ├── brand-grid/
│   │   │   └── split-image/
│   │   ├── promotion-popup/      # Marketing popup
│   │   │   └── ui/
│   │   ├── related-posts/        # Blog related articles
│   │   │   └── ui/
│   │   └── index.ts
│   │
│   ├── widgets/                  # Composite UI blocks (page sections)
│   │   ├── header/               # Header widget (orchestrates header features)
│   │   │   └── ui/
│   │   ├── footer/               # Footer widget
│   │   │   └── ui/
│   │   ├── checkout/             # Checkout flow widget
│   │   │   └── ui/               # Orchestrates payment, delivery, contact steps
│   │   ├── collection/           # Collection page widget
│   │   │   └── ui/               # Orchestrates filters, products grid
│   │   ├── product-view/         # Product page widget
│   │   │   └── ui/               # Orchestrates gallery, options, info
│   │   ├── home/                 # Home page widget
│   │   │   └── ui/               # Hero, collections carousel, etc.
│   │   ├── post/                 # Blog post widget
│   │   │   └── ui/
│   │   ├── post-card/            # Blog post card
│   │   │   └── ui/
│   │   ├── user-nav/             # User navigation sidebar
│   │   │   └── ui/
│   │   ├── settings-nav/         # Settings navigation
│   │   │   └── ui/
│   │   └── index.ts
│   │
│   └── shared/                   # Shared utilities and primitives
│       ├── lib/
│       │   ├── clients/          # Shopify, Sanity clients
│       │   │   ├── base-client.ts
│       │   │   ├── storefront-client.ts # Storefront API (public)
│       │   │   ├── admin-client.ts      # Admin API (OAuth token cached)
│       │   │   ├── customer-account-client.ts
│       │   │   ├── shopify-factory.ts   # OAuth token manager
│       │   │   ├── types.ts
│       │   │   └── index.ts
│       │   ├── shopify/
│       │   │   ├── client.ts     # storefrontClient singleton
│       │   │   ├── types/        # Generated GraphQL types (.d.ts)
│       │   │   │   └── storefront.generated.ts
│       │   │   └── query.ts
│       │   ├── sanity/           # Sanity utilities (duplicate with /sanity/)
│       │   ├── seo/
│       │   │   ├── generateMetadata.ts
│       │   │   ├── jsonld/
│       │   │   │   ├── product.ts
│       │   │   │   ├── organization.ts
│       │   │   │   └── breadcrumb.ts
│       │   │   └── index.ts
│       │   ├── utils/
│       │   │   ├── decodeHtmlEntities.ts
│       │   │   └── vendorToHandle.ts
│       │   ├── validation/       # Reusable Zod schemas
│       │   ├── prisma.ts         # Prisma client
│       │   └── index.ts
│       ├── sanity/               # Sanity CMS integration
│       │   ├── lib/
│       │   │   ├── client.ts     # sanityFetch() helper
│       │   │   ├── query.ts      # GROQ query definitions
│       │   │   ├── live.ts       # Live preview
│       │   │   ├── token.ts      # Auth token
│       │   │   ├── image.ts      # Image URL builder
│       │   │   └── fetchRedirects.ts # Build-time redirect fetching
│       │   ├── schemaTypes/      # Sanity schema definitions
│       │   │   ├── blocks/       # Page block schemas
│       │   │   └── shopify/      # Shopify integration schemas
│       │   ├── components/       # Sanity Studio UI components
│       │   │   ├── portableText/ # Custom block renderers
│       │   │   ├── shopify/      # Shopify-specific inputs
│       │   │   └── live/         # Live preview components
│       │   ├── presentation/     # Visual editing setup
│       │   ├── utils/
│       │   └── types.ts          # Generated Sanity types
│       ├── i18n/
│       │   ├── routing.ts        # next-intl routing, locales, genders
│       │   └── localization/     # Translation files and config
│       ├── store/                # Zustand client stores
│       │   ├── use-cart-note-store.ts
│       │   ├── use-fav-store.ts
│       │   └── use-path-store.ts
│       ├── hooks/
│       │   └── useDotButton.tsx
│       ├── types/
│       │   ├── product/
│       │   │   └── types.ts
│       │   ├── cart/
│       │   │   └── types.ts
│       │   └── index.ts
│       ├── ui/                   # shadcn/ui components and custom UI
│       │   ├── button.tsx
│       │   ├── input.tsx
│       │   ├── dropdown-menu.tsx
│       │   ├── JsonLd.tsx
│       │   └── ... (30+ shadcn components)
│       ├── utils/
│       │   └── cn.ts             # classname merge utility
│       ├── assets/
│       │   └── fonts/            # Custom font files
│       └── index.ts
│
├── public/                       # Static assets
├── messages/                     # i18n message files
│   ├── uk.json
│   └── ru.json
├── prisma/                       # Database schema and migrations
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── .planning/                    # (This directory)
│   └── codebase/
│       ├── ARCHITECTURE.md
│       └── STRUCTURE.md
├── proxy.ts                      # Middleware (routing, locale handling, redirects)
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── tsconfig.paths.json          # Path aliases
├── CLAUDE.md                    # Developer instructions for Claude Code
├── package.json
├── prisma.config.ts             # Prisma configuration
├── sanity.config.ts             # Sanity Studio configuration
└── .graphqlrc.ts                # GraphQL codegen configuration
```

## Directory Purposes

**`app/[locale]/`:**
- Purpose: Next.js App Router pages and layouts
- Contains: Page files (page.tsx), layout files (layout.tsx), route groups, parallel routes, intercepted routes
- Key pattern: `[locale]` parameter for i18n, route groups `(home)` `(product)` for shared layouts

**`src/entities/`:**
- Purpose: Reusable business domain models
- Contains: API query functions, display components, type definitions, entity-specific state
- Key pattern: Each entity has `api/`, `ui/`, `model/`, `index.ts` (public exports)

**`src/features/`:**
- Purpose: User-facing feature workflows
- Contains: UI components, server actions, client state stores, form schemas, feature-specific business logic
- Key pattern: Features can depend on entities and other features; subdivided into sub-features (e.g., checkout/payment, checkout/delivery)

**`src/widgets/`:**
- Purpose: Composite UI sections that combine features
- Contains: High-level page components that orchestrate multiple features
- Key pattern: Mostly UI, imported by app router pages and layouts

**`src/shared/lib/clients/`:**
- Purpose: External API client implementations
- Contains: `StorefrontClient`, `AdminClient`, `CustomerAccountClient`, `ShopifyFactory` for OAuth
- Key files: `base-client.ts` (abstract), `storefront-client.ts` (retry logic), `types.ts`

**`src/shared/lib/shopify/`:**
- Purpose: Shopify-specific utilities and types
- Contains: GraphQL type definitions (generated), client singleton, query helpers
- Key files: `client.ts` (exports `storefrontClient`), `types/storefront.generated.ts` (from `@shopify/api-codegen-preset`)

**`src/shared/sanity/`:**
- Purpose: Sanity CMS integration
- Contains: Schema types (generated), GROQ query builders, Studio components, preview setup
- Key files: `lib/client.ts` (`sanityFetch` helper), `schemaTypes/` (schema definitions), `types.ts` (generated)

**`src/shared/store/`:**
- Purpose: Client-side Zustand state stores
- Contains: Cart notes, favorites flag, path history stores
- Pattern: Persist middleware for localStorage

**`src/shared/ui/`:**
- Purpose: UI component library
- Contains: shadcn/ui primitives + custom components (Button, Input, Dialog, etc.)

**`src/shared/i18n/`:**
- Purpose: Internationalization setup
- Contains: `routing.ts` (locales: uk, ru), translation files, next-intl configuration
- Key pattern: Locale always in URL; Shopify queries use `@inContext(language: locale)`

## Key File Locations

**Entry Points:**
- Root app layout: `app/[locale]/(frontend)/layout.tsx`
- Product page: `app/[locale]/(frontend)/(product)/product/[slug]/page.tsx`
- Collection page: `app/[locale]/(frontend)/(home)/[gender]/(collection)/[slug]/page.tsx`
- Checkout flow: `app/[locale]/(frontend)/(checkout)/checkout/[step]/page.tsx`
- Auth modal: `app/[locale]/(frontend)/@auth/(.)auth/[authView]/page.tsx`

**Configuration:**
- Next.js: `next.config.ts` (fetches Sanity redirects at build)
- TypeScript: `tsconfig.json`, `tsconfig.paths.json` (path aliases: `@shared/*`, `@entities/*`, etc.)
- Middleware: `proxy.ts` (locale routing, redirects, typo fixes)
- Sanity: `sanity.config.ts`, `sanity.cli.ts`
- Prisma: `prisma.config.ts`, `prisma/schema.prisma`
- GraphQL codegen: `.graphqlrc.ts`

**Core Logic:**
- Auth: `src/features/auth/lib/auth.ts` (better-auth server), `src/features/auth/lib/auth-client.ts` (client)
- Shopify clients: `src/shared/lib/clients/` (base, storefront, admin, customer account)
- Sanity fetch: `src/shared/sanity/lib/client.ts` → `sanityFetch()` helper
- i18n routing: `src/shared/i18n/routing.ts` (locales, genders)

**Testing:**
- No test framework configured. No `*.test.*` or `*.spec.*` files in codebase.

**Database:**
- Schema: `prisma/schema.prisma`
- Migrations: `prisma/migrations/`
- Client: `src/shared/lib/prisma.ts`
- Generated: `generated/prisma/` (non-standard path, configured in tsconfig)

## Naming Conventions

**Files:**
- React components: `PascalCase.tsx` (e.g., `ProductCard.tsx`, `HeaderContainer.tsx`)
- Client-only components: `[Name]Client.tsx` suffix (e.g., `NavigationClient.tsx`, `QuickBuyModal.tsx`)
- Server actions: `camelCase.ts` (e.g., `toggle-favorite.ts`, `save-payment-info.ts`)
- Utility/helper functions: `camelCase.ts` (e.g., `generateOrderId.ts`, `getPaymentInfo.ts`)
- Queries/fragments: `UPPER_SNAKE_CASE` in files (e.g., `GET_PRODUCT_QUERY`, `PRODUCT_METAFIELDS_FRAGMENT`)
- Types/interfaces: `PascalCase` (e.g., `CartInput`, `Product`)
- Zustand stores: `use[Name]Store.ts` (e.g., `useCartNoteStore.ts`, `useFavStore.ts`)

**Directories:**
- Features/entities: `kebab-case` (e.g., `checkout`, `product`, `cart`, `quick-buy`)
- Components: `PascalCase` or `kebab-case` folder with index (e.g., `ProductCard/` → `ProductCard.tsx`)
- Utilities: `camelCase` (e.g., `utils/`, `lib/`, `api/`)

**Functions/Variables:**
- Server actions: `camelCase` (e.g., `toggleFavoriteProduct`, `savePaymentInfo`)
- React hooks: `useXxx` (e.g., `useDotButton`)
- Utility functions: `camelCase` (e.g., `decodeHtmlEntities`, `generateOrderId`)

## Where to Add New Code

**New Feature:**
- Create `src/features/[feature-name]/` with subdirectories:
  - `ui/` — React components
  - `api/` — Server actions or data fetching
  - `schema/` — Zod form validation (if forms exist)
  - `model/` — Zustand stores (if state needed)
  - `lib/` — Helper functions
  - `index.ts` — Public exports
- Import in page layouts or feature components as needed
- If feature needs entity data, import from `src/entities/[entity]/api/`

**New Entity:**
- Create `src/entities/[entity-name]/` with:
  - `api/` — Query functions calling `storefrontClient.request()` or `sanityFetch()`
  - `ui/` — Display components for the entity
  - `model/` — Entity-specific Zustand store (if needed)
  - `schema/` — Zod schemas (if needed for validation)
  - `index.ts` — Public exports
- Entity APIs should return typed data; queries declare cache tags for revalidation

**New Page/Route:**
- Create under `app/[locale]/(frontend)/[group]/[segment]/page.tsx`
- Use route groups `(home)`, `(product)`, `(checkout)` for shared layouts
- Implement as Server Component; import widgets and features
- If data fetch needed, call entity API functions
- If auth check needed, use `auth()` from better-auth
- If form needed, use react-hook-form + Zod schema from feature `schema/`

**New Utility:**
- Reusable across multiple features → `src/shared/lib/utils/` or `src/shared/utils/`
- Feature-specific helper → `src/features/[feature]/lib/`
- Entity-specific helper → `src/entities/[entity]/lib/`

**New Client Component:**
- If interactive (button, modal, form) → Create in feature or entity `ui/`
- Suffix with `Client.tsx` if using hooks
- Wrap Server Components using this component
- Keep close to where used; only move to shared if used in multiple features

**New Schema/Validation:**
- Form schemas → `src/features/[feature]/schema/`
- Shared validation → `src/shared/lib/validation/`
- Use Zod v4; resolver: `@hookform/resolvers`

**New Zustand Store:**
- Client-side state → `src/shared/store/use[Name]Store.ts`
- Feature-specific state → `src/features/[feature]/model/use[Name]Store.ts`
- Use `persist()` middleware for localStorage persistence

## Special Directories

**`generated/prisma/`:**
- Purpose: Prisma client output (non-standard location)
- Generated: Yes (by `prisma generate`)
- Committed: No (in .gitignore)
- Configuration: In `prisma.config.ts`

**`src/shared/sanity/schemaTypes/`:**
- Purpose: Sanity schema definitions
- Generated: Partial (types.ts is generated)
- Committed: Yes (schema definitions)
- Note: Types exported to `src/shared/sanity/types.ts` after `npm run typegen`

**`src/shared/lib/shopify/types/`:**
- Purpose: GraphQL generated types
- Generated: Yes (by `npm run graphql-codegen`)
- Committed: No (in .gitignore)
- Source: `@shopify/api-codegen-preset` from Shopify Storefront API schema

**`.planning/codebase/`:**
- Purpose: GSD mapping documents
- Generated: No (created by agent)
- Committed: Yes
- Files: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md, STACK.md, INTEGRATIONS.md

---

*Structure analysis: 2026-02-23*
