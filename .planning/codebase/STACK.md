# Technology Stack

**Analysis Date:** 2026-02-23

## Languages

**Primary:**
- TypeScript 5 - Complete codebase coverage for type safety and developer experience
- React 19.2.3 - UI layer with Server Components and Client Components

**Secondary:**
- JavaScript - Configuration files and tooling
- GraphQL - Shopify Storefront and Admin API queries

## Runtime

**Environment:**
- Node.js - Server runtime (version specified by `.nvmrc` if present, otherwise latest supported by Next.js 16)

**Package Manager:**
- npm 11.6.3 - Primary package manager
- Lockfile: `package-lock.json` (present - inferred from standard npm setup)

## Frameworks

**Core:**
- Next.js 16.1.0 - React metaframework with App Router and Turbopack
- React 19.2.3 - UI component library
- React DOM 19.2.3 - DOM rendering layer

**State Management:**
- Zustand - Client-side state management (imported via package.json dependency)
- nuqs 2.8.6 - URL search parameters as synchronized state

**Forms & Validation:**
- react-hook-form 7.65.0 - Form state management
- @hookform/resolvers 5.2.2 - Resolver adapter for Zod validation
- Zod 4.1.12 - Schema validation and type inference

**Styling:**
- Tailwind CSS 4 (via @tailwindcss/postcss 4) - Utility-first CSS framework
- shadcn/ui (new-york style) - Pre-built accessible components using Radix UI primitives
- @tailwindcss/typography 0.5.19 - Prose styling plugin
- styled-components 6.1.19 - CSS-in-JS for dynamic component styles

**UI Component Primitives:**
- @radix-ui/react-* (multiple modules) - Unstyled accessible component library
  - accordion, avatar, checkbox, dialog, dropdown-menu, label, navigation-menu, select, separator, slider, slot, tooltip

**Carousel & Gallery:**
- embla-carousel-react 8.6.0 - Carousel component library
- embla-carousel-autoplay 8.6.0 - Autoplay plugin
- embla-carousel-auto-scroll 8.6.0 - Auto-scroll plugin
- embla-carousel-auto-height 8.6.0 - Dynamic height plugin
- photoswipe 5.4.4 - Image gallery with zoom
- react-photoswipe-gallery 4.0.0 - React wrapper for PhotoSwipe

**Internationalization (i18n):**
- next-intl 4.7.0 - Next.js i18n routing and translations with locales `uk` (default) and `ru`
- @formatjs/intl-localematcher 0.6.2 - BCP47 language matching

**Animation:**
- framer-motion 12.23.24 - Production-ready animation library

**Testing:**
- No test framework configured (see CONCERNS.md)

**Build/Dev Tools:**
- Turbopack - Fast bundler used by Next.js 16 dev server and build
- TypeScript 5 - Type checking and compilation

## Key Dependencies

**Critical:**
- @prisma/client 7.0.0 - Database ORM (generated to `generated/prisma` at build time)
- @prisma/adapter-pg 7.0.0 - PostgreSQL adapter for Prisma
- @prisma/extension-accelerate 2.0.2 - Connection pooling and query caching
- pg 8.16.3 - Native PostgreSQL client for low-level operations

**Authentication & Authorization:**
- better-auth 1.3.27 - Authentication framework with built-in session management
  - Location: `src/features/auth/lib/auth.ts` (server) and `src/features/auth/lib/auth-client.ts` (client)
  - Supports email/password, Google OAuth, Shopify OAuth, anonymous sessions
  - UI components via @daveyplate/better-auth-ui 3.3.15

**Shopify Integration:**
- @shopify/storefront-api-client 1.0.9 - Shopify Storefront GraphQL API client
- @shopify/api-codegen-preset 1.2.1 - Type generation from Shopify API schema
  - Client: `StorefrontClient` at `src/shared/lib/clients/storefront-client.ts`
  - Implements retry logic (3 retries, exponential backoff on 502/503)
  - Locale-aware queries via `@inContext(language: ...)` directive

**CMS & Content:**
- sanity 4.10.3 - Headless CMS for content management
- next-sanity 11.5.5 - Next.js integration for Sanity
- @sanity/image-url 1.2.0 - URL builder for Sanity images
- @sanity/asset-utils 2.3.0 - Asset handling utilities
- @sanity/vision 4.10.3 - Sanity query builder and debugger
- @sanity/assist 5.0.0 - AI-powered content assistance
- @sanity/document-internationalization 4.1.1 - Multi-language document management
- sanity-plugin-internationalized-array 3.2.0 - Translatable array field plugin
- @sanity/color-input 4.0.6 - Color picker input
- @sanity/icons 3.7.4 - Icon library

**Email & Communication:**
- resend 3.5.0 - Transactional email service for password resets, order confirmations
- axios 1.13.2 - HTTP client for eSputnik integration (email marketing)

**Payment & Delivery:**
- LiqPay - Payment gateway integration (custom implementation at `src/entities/liqpay/`)
- Nova Poshta - Delivery service integration (form at `src/features/novaPoshta/`)

**Utility Libraries:**
- dayjs 1.11.18 - Lightweight date/time library
- lodash 4.17.21 - Utility function library
- currency-symbol-map 5.1.0 - Currency symbol lookup
- libphonenumber-js 1.12.35 - Phone number formatting and validation
- class-variance-authority 0.7.1 - Variant API for component styling
- clsx 2.1.1 - Dynamic className concatenation
- tailwind-merge 3.3.1 - Smart Tailwind CSS class merging
- sonner 2.0.7 - Toast notification library
- input-otp 1.4.2 - OTP input component
- react-intersection-observer 10.0.0 - Lazy loading and visibility detection
- use-debounce 10.0.6 - Debounce hook
- @custom-react-hooks/use-window-size 1.5.1 - Window size tracking hook
- @uidotdev/usehooks 2.4.1 - Collection of React hooks

**Security & Compliance:**
- @captchafox/react 1.10.0 - CAPTCHA widget integration
- @marsidev/react-turnstile 1.3.1 - Cloudflare Turnstile CAPTCHA

**Monitoring & Analytics:**
- @vercel/analytics 1.6.1 - Vercel analytics for user behavior tracking
- @vercel/speed-insights 1.3.1 - Web Core Vitals monitoring

**Other:**
- accept-language 3.0.20 - HTTP Accept-Language header parsing
- negotiator 0.6.4 - Content negotiation utilities
- schema-dts 1.1.5 - Schema.org JSON-LD types

## Configuration

**Environment:**
- Next.js configuration: `next.config.ts`
  - Fetches redirects from Sanity at build time
  - Image optimization with Shopify CDN and Sanity CDN remote patterns
  - Allowed dev origins for localhost and staging domains
- Prisma configuration: `prisma.config.ts` and `prisma/schema.prisma`
  - Database URL from `DATABASE_URL` environment variable
  - Client generated to non-standard path: `generated/prisma`
- TypeScript configuration: `tsconfig.json` with path aliases in `tsconfig.paths.json`
- GraphQL code generation: `.graphqlrc.ts`
  - Generates Shopify Storefront API types to `src/shared/lib/shopify/types/`
  - API version 2025-10

**Key Environment Variables Required:**
- `BETTER_AUTH_SECRET` - Session encryption key
- `NEXT_PUBLIC_BASE_URL` - Application URL for auth and redirects
- `SHOPIFY_STOREFRONT_API_TOKEN` - Public Storefront API token
- `SHOPIFY_STORE_DOMAIN` - Shopify store domain (e.g., `mystore.myshopify.com`)
- `SHOPIFY_API_VERSION` - Shopify API version (currently `2025-10`)
- `SHOPIFY_ADMIN_API_KEY` - Admin API credentials
- `SHOPIFY_ADMIN_API_SECRET_KEY` - Admin API credentials
- `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` - Customer Account API credentials
- `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET` - Customer Account API credentials
- `SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID` - Shopify shop ID for Customer Account
- `SHOPIFY_CUSTOMER_ACCOUNT_AUTH_BASE_URL` - Customer Account auth endpoint
- `SHOPIFY_CUSTOMER_ACCOUNT_AUTH_URL` - Customer Account authorization path
- `SHOPIFY_CUSTOMER_ACCOUNT_TOKEN_URL` - Customer Account token endpoint
- `GOOGLE_CLIENT_ID` - Google OAuth credentials
- `GOOGLE_CLIENT_SECRET` - Google OAuth credentials
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_SANITY_PROJECT_ID` - Sanity project ID
- `NEXT_PUBLIC_SANITY_DATASET` - Sanity dataset name
- `NEXT_PUBLIC_SANITY_API_VERSION` - Sanity API version (defaults to `2025-10-19`)
- `NEXT_PUBLIC_SANITY_REVALIDATE_SECRET` - Revalidation webhook secret
- `SANITY_API_READ_TOKEN` - Sanity API token for server-side queries
- `RESEND_API_KEY` - Resend email service API key
- `ESPUTNIK_API_LOGIN` - eSputnik email marketing credentials
- `ESPUTNIK_API_KEY` - eSputnik email marketing credentials
- `LIQPAY_PUBLIC_KEY` - LiqPay payment gateway public key
- `LIQPAY_PRIVATE_KEY` - LiqPay payment gateway private key
- `NEXT_PUBLIC_SITE_URL` - Public site URL for social sharing (defaults to `https://miomio.com.ua`)

**Build:**
- Build command runs `npx prisma generate` before Next.js build to generate Prisma client
- Turbopack enabled for both dev and build
- TypeScript strict mode enabled, build errors not ignored

## Linting & Formatting

**Linting:**
- ESLint 9.39.1 with flat config (`eslint.config.mjs`)
  - @next/eslint-plugin-next (16.1.0) - Next.js recommended and core-web-vitals rules
  - @typescript-eslint/eslint-plugin - TypeScript syntax and type-aware rules
  - eslint-plugin-react-hooks - React hooks rules
  - eslint-config-prettier - Prettier integration
  - Ignores: `node_modules`, `.next`, `build`, `next-env.d.ts`, `src/shared/lib/shopify/types`
  - Rules: @typescript-eslint/no-explicit-any and @typescript-eslint/ban-ts-comment disabled

**Formatting:**
- Prettier 3.6.2
  - Config: `.prettierrc`
  - Single quotes, trailing commas, 80 char line width, 2-space tabs
  - No semicolon suppression, JSX double quotes

**Git Hooks:**
- husky 9.1.7 - Git hooks runner
- lint-staged 16.2.4 - Run linting on staged files

## Platform Requirements

**Development:**
- Node.js 18+ (inferred from Next.js 16 minimum requirements)
- npm 11.6.3 or compatible

**Production:**
- Vercel (inferred from @vercel/analytics, @vercel/speed-insights, next.config.ts allowed origins)
- PostgreSQL 12+ database
- Cloudflare (for Turnstile CAPTCHA)

---

*Stack analysis: 2026-02-23*
