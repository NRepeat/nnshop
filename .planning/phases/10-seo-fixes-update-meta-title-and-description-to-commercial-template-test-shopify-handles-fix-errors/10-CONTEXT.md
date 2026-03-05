# Phase 10: SEO Fixes — Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement commercial meta title/description templates (Шаблон 1 — комерційний) across all
dynamic page types (products, collections, brands), create a Node.js script to test Shopify
product handles for broken/404 URLs, and fix any errors discovered by the script.

Static content pages and blog are out of scope — they have fixed strings handled separately.

</domain>

<decisions>
## Implementation Decisions

### Template to use
- **Products (Шаблон 1 — універсальний):**
  - UA Title: `{productType} {vendor} {title} | MioMio`
  - UA Description: `Фото, характеристики та доступні розміри в наявності. Зручне оформлення замовлення онлайн і доставка по Україні ✔️`
  - RU Title: `{productType} {vendor} {title} | MioMio`
  - RU Description: `Фото, характеристики и доступные размеры в наличии. Удобное оформление заказа онлайн и доставка по Украине ✔️`
  - If `productType` is empty: fall back to `{vendor} {title} | MioMio`
  - If `vendor` is empty: fall back to `{title} | MioMio`
  - Do NOT use `product.description` (body copy) as meta description

- **Collections/Categories (Шаблон 1 — стандартний комерційний):**
  - UA Title: `Купити {collection.title} | MioMio`
  - UA Description: `Обирайте {collection.title} в MioMio: актуальні моделі, популярні бренди та зручна доставка по Україні.`
  - RU Title: `Купить {collection.title} | MioMio`
  - RU Description: `Выбирайте {collection.title} в MioMio: актуальные модели, популярные бренды и доставка по Украине.`

- **Brands (Шаблон 1 — комерційний):**
  - UA Title: `{brand} — купити онлайн | MioMio`
  - UA Description: `Моделі бренду в MioMio: фото, доступні розміри та актуальна наявність. Доставка по Україні ✔️`
  - RU Title: `{brand} — купить онлайн | MioMio`
  - RU Description: `Модели бренда в MioMio: фото, доступные размеры и актуальное наличие. Доставка по Украине ✔️`

### Where templates live
- All logic goes in `src/shared/lib/seo/generateMetadata.ts`
- Functions `generateProductMetadata`, `generateCollectionMetadata`, and a new
  `generateBrandMetadata` function accept `locale` and use locale-aware template strings
- Brand page (`app/[locale]/(frontend)/brand/[slug]/page.tsx`) should use `generateBrandMetadata`
  instead of its current bare `title: collection.title`

### Locale-aware generation
- The `generateMetadata.ts` functions already receive `locale` — use it to switch UA/RU strings
- `uk` locale → Ukrainian templates; `ru` locale → Russian templates

### Handle test script
- **Purpose:** find products from the reference TSV (old miomio.com.ua URLs) that do NOT exist
  on the new Shopify store
- **Implementation:** Node.js script at `scripts/test-handles.ts` (or `.mjs`)
- **Method:** Use Shopify Storefront API to query each handle via `productByHandle` query
- **Input:** List of handles extracted from TSV file (column: Address → extract slug after `/product/`)
- **Output:** Two lists — handles that resolve OK, handles that return null (not found)
- **Script location:** `scripts/test-handles.ts`
- **Run with:** `npx ts-node scripts/test-handles.ts` or `node --loader ts-node/esm`

### Fixing handle errors
- If the script finds handles that return null, investigate whether the product exists under
  a different handle in Shopify
- Fix approach: create Shopify redirects (via Admin API or Shopify dashboard) from old handle
  to new handle if the product exists; or document as truly missing products

### What NOT to change
- `generatePageMetadata` base function — keep as-is, templates are built on top
- JSON-LD (`jsonld/product.ts`) — separate concern, not this phase
- Static pages meta (contacts, delivery, payment) — require Sanity edits, separate work

</decisions>

<specifics>
## Specific Ideas

- Reference document: `.planning/02-2026 _ Рекомендації щодо URL, мета-тегів та структури заголовків _ https___italishoes.com.ua_.md`
- TSV of current broken descriptions: `.planning/02-2026 _ Додаток до аналізу нового сайту _ https___www.miomio.com.ua_ - Description outside head.tsv`
- The TSV shows ~50 products with description body copy as meta description (200-600 chars) — these are the main issue to fix
- Product fields available in current API: `product.title`, `product.vendor`, `product.productType` — all already fetched in `getProduct.ts`
- Brand page currently does bare `title: collection.title` (e.g., "Area Forte") — no ` | MioMio` suffix, no template
- Collection page currently does bare `title: collection.title` (e.g., "Піджаки") — too short

</specifics>

<deferred>
## Deferred Ideas

- Static pages (Contacts, Delivery, Payment, Blog) meta updates — need Sanity content edits, separate phase
- H1/heading structure fixes from the SEO doc — separate phase
- URL/slug normalization recommendations from the SEO doc — separate phase
- JSON-LD structured data improvements — separate work

</deferred>

---

*Phase: 10-seo-fixes-update-meta-title-and-description-to-commercial-template-test-shopify-handles-fix-errors*
*Context gathered: 2026-03-05*
