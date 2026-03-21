---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 12-02-PLAN.md — htmlLimitedBots and DraftModeTools Suspense fix
last_updated: "2026-03-21T13:35:06.685Z"
last_activity: 2026-03-21
progress:
  total_phases: 17
  completed_phases: 8
  total_plans: 38
  completed_plans: 35
  percent: 50
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-23)

**Core value:** The checkout-to-order flow works reliably and securely for every user — anonymous or authenticated — without data leaks, silent failures, or broken UI.
**Current focus:** Phase 10 — SEO Fixes

## Current Position

Phase: 10 (SEO fixes — commercial meta templates)
Plan: 2 of 2 in current phase completed
Status: In progress
Last activity: 2026-03-21

Progress: [█████░░░░░] 50%

## Performance Metrics

**Velocity:**

- Total plans completed: 3
- Average duration: 2.7 min
- Total execution time: 0.13 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-security | 2 | 7 min | 3.5 min |
| 02-core-flow-reliability | 1 | 1 min | 1 min |

**Recent Trend:**

- Last 5 plans: 01-01 (3 min), 01-02 (4 min), 02-03 (1 min)
- Trend: Consistent (3 plans)

*Updated after each plan completion*
| Phase 02-core-flow-reliability P02 | 2 | 3 tasks | 2 files |
| Phase 02-core-flow-reliability P01 | 3 | 2 tasks | 1 files |
| Phase 03-visible-bug-fixes P01 | 1 | 1 tasks | 1 files |
| Phase 03-visible-bug-fixes P02 | 8 | 2 tasks | 4 files |
| Phase 03-visible-bug-fixes P03 | 6 | 2 tasks | 6 files |
| Phase 04-code-quality P03 | 4 | 2 tasks | 1 files |
| Phase 04-code-quality P04 | 4 | 2 tasks | 4 files |
| Phase 06-ui-polish P02 | 2 | 3 tasks | 4 files |
| Phase 06-ui-polish P01 | 3 | 2 tasks | 13 files |
| Phase 06-ui-polish P03 | 4 | 2 tasks | 1 files |
| Phase 07-lighthouse-audit-fixes P03 | 5 | 3 tasks | 2 files |
| Phase 08 P01 | 2 | 3 tasks | 8 files |
| Phase 08 P02 | 2 | 3 tasks | 3 files |
| Phase 08 P03 | 2 | 2 tasks | 4 files |
| Phase 09-sku-097-217-92-92-ghoud-agl P01 | 5 | 2 tasks | 2 files |
| Phase 09-sku-097-217-92-92-ghoud-agl P03 | 2 | 2 tasks | 2 files |
| Phase 09 P04 | 3 | 2 tasks | 4 files |
| Phase 09-sku-097-217-92-92-ghoud-agl P02 | 6 | 2 tasks | 2 files |
| Phase 09-sku-097-217-92-92-ghoud-agl P05 | 2 | 1 tasks | 1 files |
| Phase 10-seo-fixes-update-meta-title-and-description-to-commercial-template-test-shopify-handles-fix-errors P01 | 3 | 3 tasks | 2 files |
| Phase 10-seo-fixes P02 | 5 | 1 tasks | 1 files |
| Phase 11-analyze-project-and-prepare-for-production-integrate-posthog-monitoring P01 | 5 | 2 tasks | 5 files |
| Phase 11 P02 | 2 | 2 tasks | 20 files |
| Phase 11 P03 | 5 | 2 tasks | 6 files |
| Phase 11 P04 | 2 | 2 tasks | 5 files |
| Phase 11-analyze-project-and-prepare-for-production-integrate-posthog-monitoring P05 | 6 | 1 tasks | 2 files |
| Phase 12-seo-technical-bugs P02 | 8 | 2 tasks | 2 files |
| Phase 12-seo-technical-bugs-fix-repetitive-path-404s-search-page-noindex-and-tags-outside-head P01 | 3 | 2 tasks | 4 files |

## Accumulated Context

### Roadmap Evolution

- Phase 12 added: SEO Technical Bugs — fix repetitive path 404s, search page noindex, tags outside head
- Phase 13 added: SEO Redirect Architecture — simplify redirect chains to single 301, fix language routing
- Phase 14 added: SEO Meta Data Templates — fix short/long/duplicate titles and missing meta descriptions
- Phase 15 added: SEO Schema Markup — add OnlineStore, WebSite, SearchAction, ItemList, shipping/return schemas
- Phase 16 added: SEO Image Alt Text — add descriptive alt text to all product and content images
- Phase 17 added: Gender Navigation Architecture — derive gender from URL instead of cookie to fix back navigation state bug

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Init]: Sentry chosen for error tracking (excellent Next.js integration, generous free tier)
- [Init]: DOMPurify adopted for HTML sanitization (belt-and-suspenders even for trusted Shopify source)
- [Init]: No test infrastructure this milestone; code fixes are the priority
- [Init]: Fix fragile flows without full rewrite — add logging, transactions, idempotency within existing structure
- [01-01]: Empty databaseHooks.user.create.after handler kept as async () => {} — no parameter, preserves hook registration point for future use
- [01-01]: Server actions handling PII must not use console.log; use console.error only in catch blocks
- [01-02]: isomorphic-dompurify pinned to ^2.36.0 (not @latest); v3.x uses ESM-only jsdom@28 which breaks CommonJS require() on Vercel
- [01-02]: t.raw('shippingAndReturnsContent') dangerouslySetInnerHTML in ProductInfo.tsx not sanitized — developer-controlled translation string, not external HTML
- [01-02]: next.config.ts allowedDevOrigins is dev-server-only and does NOT affect Server Action CSRF protection
- [02-03]: Remove outer try/catch around Promise.allSettled — allSettled never rejects; the catch was dead code masking real errors
- [02-03]: Re-throw after logging in linkAnonymousDataToUser — satisfies CONTEXT.md decision: propagate Prisma transaction errors up to caller
- [02-03]: orderId: undefined included in rejection log shape for consistency with error-logging convention
- [Phase 02-02]: Used @features/auth/lib/client for useSession import (not auth-client.ts which doesn't export it) — consistent with codebase pattern
- [Phase 02-02]: DB save catch logs structured { step, userId, orderId, error } shape for Phase 5 Sentry upgrade compatibility — does not re-throw
- [Phase 02-01]: withRetry wraps only addLinesToCart — buyer identity update is non-fatal and logged but not retried
- [Phase 02-01]: Shopify API calls execute before prisma.$transaction to avoid 5s timeout exhaustion on network I/O
- [Phase 02-01]: toast() not toast.error() for cart merge failure — neutral phrasing per CONTEXT.md UX decision
- [Phase 03-01]: Removed console.error from FavSession catch block — Phase 1 decision states client handlers should not log to console; toast is the user-facing signal
- [Phase 03-01]: Used toast() (neutral) not toast.error() for FavSession error feedback — consistent with Phase 2 UX pattern for cart merge failure
- [Phase 03-visible-bug-fixes]: VIBER_PHONE_NUMBER env var has no NEXT_PUBLIC_ prefix — AnnouncementBar is a Server Component, phone number must not be exposed to client bundle
- [Phase 03-visible-bug-fixes]: Viber phone resolution priority: Sanity viberPhone -> VIBER_PHONE_NUMBER env -> null (link hidden when both empty)
- [Phase 03-03]: CartSheetController uses children pattern not direct import — required for RSC compatibility; functions cannot cross server/client boundary
- [Phase 03-03]: Cart Sheet outer wrapper moved to CartSheetController; CartSheet renders only SheetTrigger+content fragment; onOpenChange handles both open (openCart) and close (closeCart) in controlled mode
- [Phase 03-03]: AddToCartButton onSuccess called after result.success — fires only on confirmed Shopify add success, not on error paths
- [Phase 04-code-quality]: Unexported inline interfaces AnonymousUserArg and NewUserArg used instead of T & Record<string, any> for cart buyer identity update parameters
- [Phase 06-ui-polish]: Explicit type annotations for Footer map callbacks (no as-any) until typegen regenerates FOOTER_QUERYResult
- [Phase 06-ui-polish]: sanityFetch imported from @shared/sanity/lib/client — matches Header component pattern
- [06-01]: getCurrencySymbol wraps currency-symbol-map with UAH->'грн' override; fallback to currencyCode for unknown currencies
- [06-01]: Item.tsx hardcoded getSymbolFromCurrency('UAH') — replaced with getCurrencySymbol('UAH'), now returns 'грн'
- [06-01]: CartPage.tsx had getSymbolFromCurrency only in commented JSX — updated for consistency
- [Phase 06-ui-polish]: LanguageSwitcher trigger button className reduced to h-full — variant=default provides all visual styles; border-b-2 border-foreground on bg-foreground background is invisible dead code
- [Phase 06-ui-polish]: app/icon.svg accepted as favicon artifact instead of app/icon.tsx — commit da4dde4 replaced ImageResponse with real brand SVG after 06-01; both fulfill UI-01
- [Phase 07-03]: AccordionPrimitive.Header rendered via asChild+div to suppress h3 — no h3 emitted on product page, heading sequence is now sequential
- [Phase 07-03]: PersistLinkNavigation uses plain ul/li (not NavigationMenuList) because neither Header.tsx nor HeaderContent.tsx provide NavigationMenu context at call sites
- [Phase 08]: NewsletterSubscriber is standalone (no User relation) — email-only identification, no auth required
- [Phase 08]: subscribeToNewsletter always returns success:true — duplicate emails treated silently
- [Phase 08]: getProductsByHandles post-sorts results to match DB viewedAt DESC order after Shopify fetch
- [08-02]: Suspense fallback=null for RecentlyViewedSection — section streams in silently; no skeleton shown
- [08-02]: ViewTracker placed after relatedProducts block — records view without blocking above-fold rendering
- [08-02]: RecentlyViewedSection guards three null cases: no session, empty DB records, empty Shopify products
- [08-03]: z.input<typeof newsletterSchema> used as TFieldValues for useForm — Zod .default() makes input type optional but output required; using input type prevents resolver TS mismatch
- [08-03]: NewsletterSection heading hardcoded Ukrainian — consistent with CONTEXT.md screenshot; form strings remain i18n via useTranslations
- [Phase 09-01]: grandTotal = totalAmount (no shippingFee) in OrderSummary — shipping removed from receipt sidebar per user decision
- [Phase 09-01]: cartAmount = goodsTotal (no shippingFee) in Payment — payment amount no longer includes shipping calculation
- [Phase 09-03]: openCart() placed after toast.success and before onSuccess — consistent with Phase 3 confirmed-success pattern
- [Phase 09-03]: QuickBuyModal phone reset to '+38' not empty on reopen — UA country code pre-fill guides users; validation requires complete number
- [Phase 09-04]: SKU-based related product matching inserted as second-priority filler between manual metafield IDs and productType filler
- [Phase 09-04]: console.log removed from ProductSessionView, ProductView, getProduct.ts — Phase 1 violations cleared
- [Phase 09-02]: OrderStatusBadge uses cn() with bg-green-100/bg-red-100 Tailwind classes; ОТМЕНЕН maps to red (isRed) per CONTEXT.md; ON_HOLD stays red consistent with original destructive variant; geolocation errors silent (widget defaults to Kyiv); console.log with department PII removed; origin-check console.warn retained
- [Phase 09-05]: DiscountCodeInput placed in shared content JSX variable in OrderSummary — renders in both collapsible (mobile) and static (desktop) views without duplication
- [Phase 10-01]: generateProductMetadata filter(Boolean) on [productType, vendor, title] handles empty strings without leading spaces
- [Phase 10-01]: Brand page null guard: check collection.collection (inner Shopify object) not outer collection wrapper from getCollection
- [Phase 10-01]: generateCollectionMetadata description param kept in signature for backward compat but ignored — use commercial templates instead
- [Phase 10-02]: NEXT_PUBLIC_SANITY_REVALIDATE_SECRET force-committed to git via b82caa3 despite scripts/ being in .gitignore — utility script for one-time SEO audit
- [Phase 11-01]: SANITY_REVALIDATE_SECRET (no NEXT_PUBLIC_) is server-only — used in API routes and env.ts; intentionally unavailable in client bundle
- [Phase 11-01]: robots.ts: disallow array covers /api/, /studio/, /uk/auth/, /ru/auth/, /checkout/ — all other paths crawlable
- [Phase 11-01]: layout.tsx robots field omitted entirely — Next.js default allows indexing without explicit declaration
- [Phase 11]: [11-02]: get.ts catch block console.log with emoji replaced with console.error — non-PII error logging kept per Phase 1 decision
- [Phase 11]: [11-02]: NovaPoshtaButton geolocation debug logs removed — silent fallback to Kyiv maintained via widget default
- [Phase 11-03]: PostHogProvider is outermost wrapper; AnalyticsIdentifier inline component calls usePostHogIdentify inside PHProvider context
- [Phase 11-03]: capture_pageview: false in posthog.init() prevents double-counting with manual PostHogPageView
- [Phase 11-04]: checkout_started placed in ContactInfoForm (checkout entry client) not non-existent CheckoutEntry.tsx — first interactive client component on /checkout/info route
- [Phase 11-04]: posthog?.capture() optional chaining throughout — safe if PostHog fails to initialize; events only fire on confirmed success paths
- [Phase 11]: X-Frame-Options SAMEORIGIN (not DENY) — preserves LiqPay payment iframe compatibility
- [Phase 11]: Permissions-Policy geolocation=(self) — required for Nova Poshta widget navigator.geolocation
- [Phase 11]: .env.example force-committed past .gitignore (.env*) — documentation not secrets
- [Phase 12-02]: htmlLimitedBots: /.*/ regex literal (not string) forces metadata resolution for all user agents including Screaming Frog, fixing Next.js 15.2+ streaming metadata placing tags outside head
- [Phase 12-02]: DraftModeTools Suspense moved from after </body> to inside <body> as last child — fixes invalid HTML without breaking Sanity draft mode

### Roadmap Evolution

- Phase 8 added: Recently Viewed Products section and Newsletter subscription section
- Phase 9 added: ФРОНТ — убрати доставку з чекауту, НП віджет, статуси замовлень, корзина, швидке замовлення, related products, дисконт, телефон/вайбер, меню, логотипи брендів, тест стежити за ціною
- Phase 10 added: SEO fixes — update meta title and description to commercial template, test Shopify handles, fix errors
- Phase 11 added: Analyze project and prepare for production — integrate PostHog monitoring

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 1 | add isBrand checkbox to Sanity collection schema and update frontend | 2026-03-02 | dbebcd4 | [1-add-isbrand-checkbox-to-sanity-collectio](./quick/1-add-isbrand-checkbox-to-sanity-collectio/) |
| 3 | add reusable shared section block type to pageBuilder | 2026-03-02 | 608aaab | [3-add-reusable-shared-section-block-type-t](./quick/3-add-reusable-shared-section-block-type-t/) |

## Session Continuity

Last session: 2026-03-21T13:35:01.213Z
Stopped at: Completed 12-02-PLAN.md — htmlLimitedBots and DraftModeTools Suspense fix
Resume file: None
