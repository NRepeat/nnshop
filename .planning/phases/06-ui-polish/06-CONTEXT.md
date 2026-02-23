# Phase 06: Pre-Launch UI Polish — Context

## Phase Goal

Complete the visible UI gaps before launch: add CMS-managed footer content (social links, hours, address, payment icons), fix the currency display to show "грн" instead of "₴", add a favicon, and clean up the language switcher button styling.

## Source

Requirements extracted from `.planning/Miomio.com.ua.md` — the client's live task checklist.

Pending items addressed in this phase:
- `[ ] значок ₴ на грн поменять` — currency symbol change
- `[ ] фавиконка` — favicon missing
- `[ ] язык убрать або видоизменить красную полоску при наведении` — language switcher hover state
- `[ ] доработать футер — соцсети, график работы, адрес. подписка на новости, иконки виза мастеркард` — footer completion

## What Was Found (Investigation 2026-02-23)

### Footer (`src/widgets/footer/ui/Footer.tsx`)
- Entirely static: renders only logo + copyright + 5 nav links from i18n translations
- No Sanity fetch at all
- `footerSettings` object schema exists at `src/shared/sanity/schemaTypes/shopify/shemas/objects/global/footer.ts` but:
  - Has only a single unused `text` (portable text) field
  - Is NOT registered in `siteSettingsType.ts` (not in the document's fields array)
  - Has no FOOTER_QUERY in `src/shared/sanity/lib/query.ts`
- Revalidation route (`app/api/revalidate/path/route.ts`) already includes `'footer'` in LAYOUT_TYPES — so revalidation plumbing exists

### Favicon
- No `app/favicon.ico`, `app/icon.tsx`, or any icon file in the Next.js app dir
- `public/` contains only generic Next.js template assets
- Root layout (`app/[locale]/(frontend)/layout.tsx`) has `metadataBase` but no `icons` metadata
- Fix: create `app/icon.tsx` using Next.js ImageResponse — generates a branded "M" icon (black bg, white letter), replaces cleanly with the real logo later

### Currency Symbol
- Pattern in 11 files: `const currency = getSymbolFromCurrency(currencyCode) || currencyCode`
- `getSymbolFromCurrency('UAH')` returns `₴`
- Client wants `грн` text label instead
- Fix: `src/shared/lib/utils/getCurrencySymbol.ts` utility that returns `'грн'` for UAH, delegates to `currency-symbol-map` for others
- 11 files to update (mechanical import + call rename):
  1. `src/widgets/product-view/ui/Price.tsx`
  2. `src/features/favorites/ui/FavoriteProductCard.tsx`
  3. `src/features/checkout/receipt/ui/OrderSummary.tsx`
  4. `src/features/cart/ui/CartPage.tsx`
  5. `src/features/cart/ui/CartItem.tsx`
  6. `src/features/header/cart/ui/Content.tsx`
  7. `src/features/header/cart/ui/Item.tsx`
  8. `src/entities/home/ui/SyncedCarousels.tsx`
  9. `src/entities/home/ui/product-carousel.tsx`
  10. `src/entities/product/ui/ProductCard.tsx`
  11. `src/entities/product/ui/ProductCardSPP.tsx`

### Language Switcher (`src/features/header/language-switcher/ui/LanguageSwitcher.tsx`)
- Trigger button: `className="h-full border-b-2 border-foreground bg-foreground hover:border-b-2 hover:border-b-foreground transition-colors"`
- Both default and hover states are identical (border-foreground on foreground bg = invisible border)
- Client task: "remove or restyle the red bar on hover (can increase on hover)"
- The "red bar" likely appeared at some point and was partially removed; current state is a dead hover class
- Fix: remove the non-functional border classes; the button variant="default" already provides visual styling

### siteSettings Schema (`src/shared/sanity/schemaTypes/siteSettingsType.ts`)
- Has: `infoBar`, `header`, `brandsNavigation`
- Missing: `footerSettings` field — needs to be added

## Architecture Decisions

- **Footer fetches from Sanity at render time** — Server Component, same pattern as Header (`HEADER_QUERY` → `sanityFetch`)
- **footerSettings added to siteSettings document** — consistent with infoBar and header being sub-objects of siteSettings
- **Social links as array of {platform, url}** — client manages platforms via Studio, no code change needed when adding/removing social accounts
- **Payment methods as multiselect enum** — 'visa' | 'mastercard' | 'liqpay' | 'novapay' | 'mono' — rendered as text badges (no SVG dependency)
- **workingHours and address as localized objects** — `{ uk: string, ru: string }` consistent with other localized strings in schema
- **Newsletter subscription deferred** — requires eSputnik API integration, separate phase
- **getCurrencySymbol wrapper** — single place to override symbols, keeps all 11 files as one-line change

## Phase Scope Boundaries

**IN scope:**
- Favicon (branded placeholder icon, client replaces with real logo)
- Currency display (₴ → грн via shared utility)
- Footer: Sanity schema fields, siteSettings registration, GROQ query, component rendering
- Language switcher button: remove dead hover border class

**OUT of scope (deferred):**
- Footer newsletter subscription (eSputnik integration — own phase)
- Self-pickup delivery option (4 locations, schema + form — own phase)
- Email order templates (Shopify admin config — not a code change)
- Blog/info page migration (content work — not code)
- Key CRM / Viber / Telegram bot integration (integrations milestone)

## Key Files

| File | Change |
|------|--------|
| `app/icon.tsx` | NEW — branded favicon via ImageResponse |
| `src/shared/lib/utils/getCurrencySymbol.ts` | NEW — UAH override utility |
| 11 price files | UPDATE — import getCurrencySymbol, replace getSymbolFromCurrency call |
| `src/shared/sanity/schemaTypes/shopify/shemas/objects/global/footer.ts` | UPDATE — add socialLinks, workingHours, address, paymentMethods fields |
| `src/shared/sanity/schemaTypes/siteSettingsType.ts` | UPDATE — register footerSettings field |
| `src/shared/sanity/lib/query.ts` | UPDATE — add FOOTER_QUERY |
| `src/widgets/footer/ui/Footer.tsx` | UPDATE — fetch CMS data, render new columns |
| `src/features/header/language-switcher/ui/LanguageSwitcher.tsx` | UPDATE — remove dead border-b classes |

## Wave Structure

| Wave | Plans | Depends on |
|------|-------|------------|
| 1 | 06-01 (favicon + currency), 06-02 (footer CMS + component) | — |
| 2 | 06-03 (language switcher + build gate) | 06-01, 06-02 |
