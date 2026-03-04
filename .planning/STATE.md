---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
last_updated: "2026-03-04T08:43:10.342Z"
progress:
  total_phases: 8
  completed_phases: 5
  total_plans: 29
  completed_plans: 22
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-23)

**Core value:** The checkout-to-order flow works reliably and securely for every user — anonymous or authenticated — without data leaks, silent failures, or broken UI.
**Current focus:** Phase 6 — UI Polish

## Current Position

Phase: 8 of 7 (Recently Viewed + Newsletter)
Plan: 3 of 4 in current phase
Status: In progress
Last activity: 2026-03-02 - Completed quick task 1: add isBrand checkbox to Sanity collection schema and update frontend

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

## Accumulated Context

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

### Roadmap Evolution

- Phase 8 added: Recently Viewed Products section and Newsletter subscription section
- Phase 9 added: ФРОНТ — убрать доставку из чекаута, НП виджет, статусы заказов, корзина, швидке замовлення, related products, дисконт, телефон/вайбер, меню, логотипы брендов, тест стежити за ціною

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

Last session: 2026-03-02
Stopped at: Completed quick task 3 — sharedSection document type, sharedSectionRef pageBuilder block, GROQ dereference, HeroPageBuilder recursive rendering
Resume file: None
