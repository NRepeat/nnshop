# External Integrations

**Analysis Date:** 2026-02-23

## APIs & External Services

**E-Commerce Platform:**
- **Shopify Storefront API** (GraphQL) - Product catalog, collections, cart management, checkout
  - SDK/Client: `@shopify/storefront-api-client` 1.0.9
  - Implementation: `src/shared/lib/clients/storefront-client.ts` (custom wrapper with retry logic)
  - Auth: `SHOPIFY_STOREFRONT_API_TOKEN` (public token via `Shopify-Storefront-Private-Token` header)
  - Features: Locale-aware queries (`@inContext` directive), 3-retry exponential backoff on 502/503
  - API Version: `2025-10`

- **Shopify Admin API** (GraphQL) - Order management, draft orders
  - SDK/Client: `@shopify/storefront-api-client` (custom Admin wrapper)
  - Implementation: `src/shared/lib/clients/admin-client.ts`
  - Auth: `X-Shopify-Access-Token` header with tokens cached in Prisma DB
  - OAuth flow managed by `ShopifyFactory` at `src/shared/lib/clients/shopify-factory.ts`
  - Credentials: `SHOPIFY_ADMIN_API_KEY`, `SHOPIFY_ADMIN_API_SECRET_KEY`, `SHOPIFY_STORE_DOMAIN`

- **Shopify Customer Account API** - User account and order history
  - Implementation: `src/shared/lib/clients/customer-account-client.ts`
  - Endpoints: `shopify.com/{shopId}/account/...`
  - OAuth credentials: `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID`, `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET`
  - Auth paths: `SHOPIFY_CUSTOMER_ACCOUNT_AUTH_BASE_URL`, `SHOPIFY_CUSTOMER_ACCOUNT_AUTH_URL`, `SHOPIFY_CUSTOMER_ACCOUNT_TOKEN_URL`
  - Shop ID: `SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID`

**Social Authentication:**
- **Google OAuth** - Social sign-up and login
  - Credentials: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - Implementation: better-auth plugin at `src/features/auth/lib/auth.ts` (line 65-69)
  - Account linking: Enabled with trusted provider

- **Shopify OAuth** - Sign in with Shopify account
  - Implementation: Custom Shopify OAuth client at `src/features/auth/lib/shopify/client.ts`
  - Account linking: Enabled with trusted provider
  - Merges anonymous sessions on sign-in via `linkAnonymousDataToUser()` hook

**Content & CMS:**
- **Sanity v4** - Headless CMS for pages, blog, settings, hero blocks, redirects
  - SDK: `sanity` 4.10.3, `next-sanity` 11.5.5
  - Project ID: `NEXT_PUBLIC_SANITY_PROJECT_ID`
  - Dataset: `NEXT_PUBLIC_SANITY_DATASET`
  - API Version: `NEXT_PUBLIC_SANITY_API_VERSION` (defaults to `2025-10-19`)
  - Studio: Mounted at `/studio` with internationalization plugins
  - Read token: `SANITY_API_READ_TOKEN` (server-side queries)
  - Revalidation: Webhook secret `NEXT_PUBLIC_SANITY_REVALIDATE_SECRET`
  - Plugins: Document internationalization, internationalized arrays, AI assist, vision tool
  - Usage: Server-side fetching via `sanityFetch()` in `src/shared/sanity/lib/query.ts`
  - Types: Generated via `npm run typegen` to `src/shared/sanity/types.ts`

## Data Storage

**Databases:**
- **PostgreSQL** - Primary application database
  - Connection: `DATABASE_URL` environment variable
  - Client: Prisma v7 ORM with `@prisma/adapter-pg`
  - Schema: `prisma/schema.prisma`
  - Client generated to: `generated/prisma/client` (non-standard path)
  - Models: User, Session, Account (better-auth), Cart, Order, Favorites, ContactInformation, DeliveryInformation, PaymentInformation, NovaPoshtaDepartment, ShopifySession, FavoriteProduct
  - Migrations: Run via `npx prisma migrate dev`

**File Storage:**
- **Shopify CDN** - Product images and media
  - Remote pattern: `https://cdn.shopify.com`
  - Configured in `next.config.ts` for Next.js image optimization

- **Sanity CDN** - CMS content images and assets
  - Remote pattern: `https://cdn.sanity.io`
  - Image URL builder: `@sanity/image-url`
  - Configured in `next.config.ts` for Next.js image optimization

- **Local filesystem** - No explicit local file storage detected; client-side uploads likely processed through Shopify or Sanity

**Caching:**
- **Prisma Accelerate** - Connection pooling and query caching
  - Package: `@prisma/extension-accelerate` 2.0.2
- **Next.js Data Cache** - `'use cache'` and `cacheLife()` directives with `revalidate` tags
- **Next.js Request Cache** - `force-cache` and `no-store` caching strategies

## Authentication & Identity

**Auth Provider:**
- **better-auth** 1.3.27 - Multi-strategy authentication framework
  - Server config: `src/features/auth/lib/auth.ts`
  - Client config: `src/features/auth/lib/auth-client.ts`
  - Database: Prisma adapter with PostgreSQL
  - Session duration: 7 days, update age 24 hours, cookie cache 5 minutes
  - Strategies:
    - Email/Password - Basic email/password authentication
    - Google OAuth - Social sign-in
    - Shopify OAuth - Shopify customer sign-in
    - Anonymous sessions - Temporary sessions that link to auth on sign-in
  - UI: Components via `@daveyplate/better-auth-ui`
  - Password reset flow: Uses eSputnik email event system
  - Account linking: Enabled for Shopify and Google with automatic data merging

**Email Verification:**
- Not required by default (requireEmailVerification: false in better-auth config)

## Email & Messaging

**Transactional Email:**
- **Resend** - Passwordless emails and transactional messages
  - SDK: `resend` 3.5.0
  - API Key: `RESEND_API_KEY`
  - Implementation: `src/shared/lib/resend.ts`
  - Use case: Order confirmations, password resets

**Email Marketing:**
- **eSputnik** - Email marketing and automation platform
  - API Version: v1
  - Endpoint: `https://esputnik.com/api/v1`
  - Credentials: `ESPUTNIK_API_LOGIN`, `ESPUTNIK_API_KEY` (Basic auth)
  - Implementation: `src/shared/lib/mailer.ts`
  - Feature: Event-based email triggers (e.g., `password_reset`)
  - Events sent with: eventTypeKey, keyValue (email), and key-value params

## Payment Processing

**Payment Gateway:**
- **LiqPay** - Ukrainian payment gateway for orders
  - Endpoint: `https://www.liqpay.ua/api/`
  - Public Key: `LIQPAY_PUBLIC_KEY`
  - Private Key: `LIQPAY_PRIVATE_KEY`
  - Implementation: Custom LiqPay class at `src/entities/liqpay/model/index.tsx`
  - Features: Payment form generation, signature hashing, API integration via axios
  - UI: `src/entities/liqpay/ui/Form.tsx` and `src/entities/liqpay/ui/SdkButton.tsx`
  - Form data: customer info (name, email, phone), order ID, amount, currency
  - Documentation: https://www.liqpay.ua/documentation/uk

## Delivery & Logistics

**Delivery Service:**
- **Nova Poshta** - Ukrainian parcel delivery service
  - Implementation: `src/features/novaPoshta/api/submit.ts` (stub)
  - Form UI: `src/features/novaPoshta/ui/NovapostForm.tsx` and `src/features/novaPoshta/ui/NovaPoshtaBlock.tsx`
  - Database: Stores selected department in `DeliveryInformation` and `NovaPoshtaDepartment` models
  - Features: Department selection, geolocation data (latitude, longitude)
  - Status: Integration partially implemented (form collects data but submit is a stub)

## Monitoring & Observability

**Error Tracking:**
- Not detected - No Sentry, LogRocket, or similar error tracking configured

**Logs:**
- Console-based logging
  - Used in: `src/features/auth/lib/auth.ts` for auth hooks
  - Used in: `src/shared/lib/clients/storefront-client.ts` for API errors and retries
  - Pattern: `console.log()`, `console.error()` for debugging and error reporting

**Analytics & Monitoring:**
- **Vercel Analytics** (`@vercel/analytics`) - User behavior and traffic tracking
- **Vercel Speed Insights** (`@vercel/speed-insights`) - Core Web Vitals monitoring
- Both injected at app root level

## CAPTCHA & Security

**Bot Protection:**
- **Cloudflare Turnstile** - CAPTCHA alternative
  - SDK: `@marsidev/react-turnstile` 1.3.1
  - Use case: Form submission protection

- **CaptchaFox** - Alternative CAPTCHA provider
  - SDK: `@captchafox/react` 1.10.0
  - Use case: Form submission protection

## CI/CD & Deployment

**Hosting:**
- **Vercel** - Deployment platform (inferred from analytics, speed-insights, and config)
  - Environment: `.vercel/.env.production.local` (exists - see STACK.md forbidden_files note)
  - Allowed origins: development.nninc.uk, staging domains, localhost

**CI Pipeline:**
- Not detected - No GitHub Actions, CircleCI, or similar CI configuration found

**Build Process:**
- Next.js build with Turbopack
- Prisma client generation before build
- GraphQL codegen for Shopify types (manual: `npm run graphql-codegen`)
- Sanity typegen (manual: `npm run typegen`)

## Webhooks & Callbacks

**Incoming (Webhooks Received):**
- **Sanity Revalidation Webhook** - ISR cache revalidation on content updates
  - Secret: `NEXT_PUBLIC_SANITY_REVALIDATE_SECRET`
  - Likely handler: `/api/*` route for Sanity webhook

- **LiqPay Callbacks** - Payment status updates
  - Likely callback URL configured in LiqPay dashboard (not found in code)

- **Nova Poshta Webhooks** - Delivery status updates (if implemented)

**Outgoing (Webhooks Sent):**
- **eSputnik Event Triggers** - Email marketing events sent to eSputnik
  - Endpoint: `https://esputnik.com/api/v1/event`
  - Events: password_reset, signup_confirmation (inferred)

- **Shopify Draft Order Updates** - Orders created and updated via Admin API
  - Used for payment and checkout workflow

## Data Flow Summary

1. **Authentication**: User logs in via email/password, Google OAuth, or Shopify OAuth → better-auth creates session → stored in PostgreSQL
2. **Shopping**: Browse products via Shopify Storefront API → filter by gender/collection → add to Shopify cart
3. **Checkout**: Collect user contact/delivery info → validate Nova Poshta location → create Shopify Draft Order → initiate LiqPay payment
4. **Payment**: LiqPay processes payment → callback triggers order finalization → eSputnik sends confirmation email via Resend
5. **Content**: CMS editors manage pages in Sanity Studio → webhook revalidates Next.js ISR cache → changes live on site

## Environment Configuration

**Required env vars for integrations:**
- Shopify: SHOPIFY_STOREFRONT_API_TOKEN, SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_API_KEY, SHOPIFY_ADMIN_API_SECRET_KEY, SHOPIFY_API_VERSION, SHOPIFY_CUSTOMER_ACCOUNT_*
- Google: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- Database: DATABASE_URL
- Sanity: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_READ_TOKEN, NEXT_PUBLIC_SANITY_REVALIDATE_SECRET
- Email: RESEND_API_KEY, ESPUTNIK_API_LOGIN, ESPUTNIK_API_KEY
- Payment: LIQPAY_PUBLIC_KEY, LIQPAY_PRIVATE_KEY
- Auth: BETTER_AUTH_SECRET, NEXT_PUBLIC_BASE_URL
- Monitoring: (Vercel managed automatically)

**Secrets location:**
- `.env` - Local development (gitignored)
- `.env.local` - Local overrides (gitignored)
- `.env.production.local` - Production overrides (gitignored)
- Vercel environment variables - Production deployment

---

*Integration audit: 2026-02-23*
