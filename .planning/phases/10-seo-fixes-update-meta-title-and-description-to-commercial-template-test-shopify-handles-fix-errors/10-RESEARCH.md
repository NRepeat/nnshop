# Phase 10: SEO Fixes — Research

**Researched:** 2026-03-05
**Domain:** Next.js metadata generation, Shopify Storefront API, SEO templates
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Template to use:**
- Products (Шаблон 1 — універсальний):
  - UA Title: `{productType} {vendor} {title} | MioMio`
  - UA Description: `Фото, характеристики та доступні розміри в наявності. Зручне оформлення замовлення онлайн і доставка по Україні ✔️`
  - RU Title: `{productType} {vendor} {title} | MioMio`
  - RU Description: `Фото, характеристики и доступные размеры в наличии. Удобное оформление заказа онлайн и доставка по Украине ✔️`
  - If `productType` is empty: fall back to `{vendor} {title} | MioMio`
  - If `vendor` is empty: fall back to `{title} | MioMio`
  - Do NOT use `product.description` (body copy) as meta description

- Collections/Categories (Шаблон 1 — стандартний комерційний):
  - UA Title: `Купити {collection.title} | MioMio`
  - UA Description: `Обирайте {collection.title} в MioMio: актуальні моделі, популярні бренди та зручна доставка по Україні.`
  - RU Title: `Купить {collection.title} | MioMio`
  - RU Description: `Выбирайте {collection.title} в MioMio: актуальные модели, популярные бренды и доставка по Украине.`

- Brands (Шаблон 1 — комерційний):
  - UA Title: `{brand} — купити онлайн | MioMio`
  - UA Description: `Моделі бренду в MioMio: фото, доступні розміри та актуальна наявність. Доставка по Україні ✔️`
  - RU Title: `{brand} — купить онлайн | MioMio`
  - RU Description: `Модели бренда в MioMio: фото, доступные размеры и актуальное наличие. Доставка по Украине ✔️`

**Where templates live:**
- All logic goes in `src/shared/lib/seo/generateMetadata.ts`
- Functions `generateProductMetadata`, `generateCollectionMetadata`, and a new `generateBrandMetadata` accept `locale` and use locale-aware template strings
- Brand page (`app/[locale]/(frontend)/brand/[slug]/page.tsx`) should use `generateBrandMetadata`

**Locale-aware generation:**
- `uk` locale → Ukrainian templates; `ru` locale → Russian templates

**Handle test script:**
- Purpose: find products from the reference TSV that do NOT exist on the new Shopify store
- Implementation: Node.js script at `scripts/test-handles.ts` (or `.mjs`)
- Method: Use Shopify Storefront API to query each handle via `productByHandle` query
- Input: handles extracted from TSV (column: Address → extract slug after `/product/`)
- Output: Two lists — handles that resolve OK, handles that return null (not found)
- Run with: `npx ts-node scripts/test-handles.ts` or `node --loader ts-node/esm`

**Fixing handle errors:**
- If null: investigate whether product exists under different handle; create Shopify redirect or document as truly missing

**What NOT to change:**
- `generatePageMetadata` base function — keep as-is
- JSON-LD (`jsonld/product.ts`) — separate concern
- Static pages meta — require Sanity edits, separate work

### Claude's Discretion

No discretion areas specified.

### Deferred Ideas (OUT OF SCOPE)

- Static pages (Contacts, Delivery, Payment, Blog) meta updates — need Sanity content edits, separate phase
- H1/heading structure fixes from the SEO doc — separate phase
- URL/slug normalization recommendations from the SEO doc — separate phase
- JSON-LD structured data improvements — separate work
</user_constraints>

---

## Summary

Phase 10 fixes three SEO problems that have been confirmed by audit: product meta descriptions currently render verbatim Shopify product description body copy (200–600 chars of marketing prose) instead of a commercial template; collection and brand pages have bare titles with no suffix and generic fallback descriptions; and an unknown number of old miomio.com.ua product URLs may not resolve on the new store.

The work divides cleanly into two tracks. Track 1 is a pure TypeScript edit to `src/shared/lib/seo/generateMetadata.ts`: update `generateProductMetadata` to accept `vendor` and `productType`, add `generateBrandMetadata`, and update `generateCollectionMetadata` to use the locked template strings. Track 2 is a standalone Node.js script (`scripts/test-handles.mjs`) that reads the TSV, extracts the 1738 product handles, fires Storefront API queries (batched or sequential), and writes two lists.

All required Shopify fields (`vendor`, `productType`) are already fetched by the existing `GET_PRODUCT_QUERY`. The brand page's `generateMetadata` function currently bypasses the shared SEO utility entirely and writes a raw `{ title, description }` literal — it needs to call the new `generateBrandMetadata` function instead.

**Primary recommendation:** Update `generateMetadata.ts` in three function edits, update the three calling page files, then write the handle-test script as a self-contained `.mjs` that calls the Shopify Storefront GraphQL endpoint directly via `fetch` with `dotenv`.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js Metadata API | 16.1.0 | `generateMetadata` export for `<head>` tags | Built-in; already used throughout |
| `dotenv` | ^17.2.3 | Load `.env.local` in standalone script | Already in dependencies |
| `tsx` | ^4.20.6 | Run TypeScript scripts from command line | Already in devDependencies |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Node.js built-in `fs` | built-in | Read TSV file in script | For reading the reference TSV |
| Node.js built-in `fetch` | Node 18+ | HTTP calls to Storefront API | Avoids extra dependency in script |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `.mjs` plain script | `tsx` with path aliases | tsx is available but path aliases (@shared/*) don't resolve in scripts context without extra tsconfig-paths setup — plain fetch + dotenv is simpler and matches existing scripts/ pattern |
| Sequential API calls | Batch via productByHandle aliases | Batching is faster for 1738 handles but requires more complex GraphQL; sequential with rate limiting is safer and simpler for a one-time audit script |

**Installation:** No new packages required.

---

## Architecture Patterns

### File Structure Impact

```
src/shared/lib/seo/
└── generateMetadata.ts          # EDIT: update 2 functions, add 1 new function

app/[locale]/(frontend)/
├── (product)/product/[slug]/page.tsx           # no change needed (already calls generateProductMetadata)
├── (home)/[gender]/(collection)/[slug]/page.tsx # no change needed (already calls generateCollectionMetadata)
└── brand/[slug]/page.tsx                        # EDIT: call generateBrandMetadata

scripts/
└── test-handles.mjs             # NEW: handle audit script
```

### Pattern 1: generateProductMetadata Signature Change

**What:** Extend the product parameter type to include `vendor` and `productType` for title construction.
**When to use:** Whenever product page calls `generateProductMetadata`.

Current signature:
```typescript
// src/shared/lib/seo/generateMetadata.ts (CURRENT)
export function generateProductMetadata(
  product: {
    title: string;
    description?: string | null;
    featuredImage?: { url: string } | null;
  },
  locale: string,
  slug: string
): Metadata
```

Required signature (add vendor, productType):
```typescript
// src/shared/lib/seo/generateMetadata.ts (NEW)
export function generateProductMetadata(
  product: {
    title: string;
    vendor?: string | null;
    productType?: string | null;
    featuredImage?: { url: string } | null;
  },
  locale: string,
  slug: string
): Metadata
```

The product page already passes the full `product` object from `getProduct` (which returns a `GetProductByHandleQuery` result that includes `vendor` and `productType`). The field is confirmed present in `GET_PRODUCT_QUERY`:
```graphql
# getProduct.ts lines 47-48
vendor
productType
```

### Pattern 2: Title Construction with Fallback Chain

**What:** Build title from available fields with graceful fallback.
**When to use:** `generateProductMetadata` title.

```typescript
// Title construction inside generateProductMetadata
function buildProductTitle(
  title: string,
  vendor?: string | null,
  productType?: string | null
): string {
  const parts = [productType, vendor, title].filter(Boolean);
  // parts will always have at least [title]
  // if productType missing: [vendor, title] | MioMio
  // if both missing: [title] | MioMio
  return `${parts.join(' ')} | MioMio`;
}
```

### Pattern 3: Locale-Switched Description

**What:** Return fixed commercial description string based on locale.
**When to use:** All three metadata functions.

```typescript
// Pattern for locale switch — apply in all three functions
const isUk = locale === 'uk';

// Product:
const description = isUk
  ? 'Фото, характеристики та доступні розміри в наявності. Зручне оформлення замовлення онлайн і доставка по Україні ✔️'
  : 'Фото, характеристики и доступные размеры в наличии. Удобное оформление заказа онлайн и доставка по Украине ✔️';
```

### Pattern 4: generateBrandMetadata — New Function

**What:** New function using brand title (collection.title) for brand pages.
**When to use:** Brand page `generateMetadata`.

```typescript
export function generateBrandMetadata(
  brand: {
    title: string;
    image?: { url: string } | null;
  },
  locale: string,
  slug: string
): Metadata {
  const isUk = locale === 'uk';
  const title = isUk
    ? `${brand.title} — купити онлайн | MioMio`
    : `${brand.title} — купить онлайн | MioMio`;
  const description = isUk
    ? 'Моделі бренду в MioMio: фото, доступні розміри та актуальна наявність. Доставка по Україні ✔️'
    : 'Модели бренда в MioMio: фото, доступные размеры и актуальное наличие. Доставка по Украине ✔️';

  return generatePageMetadata(
    { title, description, image: brand.image?.url },
    locale,
    `/brand/${slug}`
  );
}
```

### Pattern 5: Brand Page Calling generateBrandMetadata

Current brand page `generateMetadata` (WRONG — bypasses shared utility, raw object, no template):
```typescript
// app/[locale]/(frontend)/brand/[slug]/page.tsx (CURRENT)
return {
  title: `${collection.collection?.title}`,
  description: collection.collection?.description,
};
```

Required (CORRECT — uses template, adds canonical/OG/Twitter, no description body copy):
```typescript
// app/[locale]/(frontend)/brand/[slug]/page.tsx (NEW)
import { generateBrandMetadata } from '@shared/lib/seo/generateMetadata';

return generateBrandMetadata(
  {
    title: collection.collection.title,
    image: collection.collection.image,  // check if image field is available on getCollection result
  },
  locale,
  decodedSlug
);
```

### Pattern 6: Handle Test Script

**What:** Self-contained `.mjs` that reads the TSV, extracts handles from the Address column, queries Shopify Storefront API, outputs results.
**Key insight:** The existing scripts in `scripts/` all use plain `.js` with CommonJS `require()` and `fetch()`. The handle script can use `.mjs` (ESM) to use `import` without needing a build step. `dotenv` is already in dependencies so `dotenv/config` import loads `.env.local`.

```javascript
// scripts/test-handles.mjs — approximate structure
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import 'dotenv/config';

const TSV_PATH = resolve(process.cwd(), '.planning/02-2026 _ Додаток до аналізу нового сайту _ https___www.miomio.com.ua_ - Description outside head.tsv');
const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_TOKEN = process.env.SHOPIFY_STOREFRONT_SECRET_TOKEN;
const SHOPIFY_VERSION = process.env.SHOPIFY_API_VERSION;

// 1. Parse TSV — header row, then data rows
// Column 0 = Address: "https://www.miomio.com.ua/uk/product/{handle}"
// Extract handle = last path segment after /product/

// 2. Query: { product(handle: $handle) { id handle } }
// Returns null if not found

// 3. Rate-limit: ~2 requests/second to avoid Shopify throttling (429)

// 4. Write results to:
//    scripts/handles-ok.txt
//    scripts/handles-missing.txt
```

**Storefront API endpoint pattern (confirmed from storefront-client.ts):**
```
POST https://{SHOPIFY_STORE_DOMAIN}/api/{SHOPIFY_API_VERSION}/graphql.json
Header: Shopify-Storefront-Private-Token: {SHOPIFY_STOREFRONT_SECRET_TOKEN}
```

**Query to use (minimal — just check existence):**
```graphql
query CheckHandle($handle: String!) {
  product(handle: $handle) {
    id
    handle
  }
}
```

Note: The existing `getProduct.ts` uses `product(handle: $handle, id: $variant)` — the standalone script uses `product(handle: $handle)` only (no variant needed, just existence check).

**Run command:**
```bash
node scripts/test-handles.mjs
```

Or if TypeScript is preferred:
```bash
npx tsx scripts/test-handles.ts
```

**Recommendation:** Use `.mjs` (plain JS). The script has no app logic, needs only `fetch` + file I/O + dotenv. TypeScript adds friction (no path alias resolution in script context) without benefit. Existing scripts (`fetch-pages.js`, `populate-pages.js`) establish `.js` as the pattern.

**dotenv loading note:** `dotenv` v17 is in `dependencies`. In `.mjs`: `import 'dotenv/config'` auto-loads `.env`. For `.env.local` (which holds the actual token), pass explicit path: `dotenv.config({ path: '.env.local' })`.

**TSV scale:** 1738 data rows (+ 1 header = 1739 total lines). At 2 req/s sequential, ~14 minutes to scan all. Consider batching (multiple queries in one POST) to speed up.

### Anti-Patterns to Avoid

- **Using `product.description` as meta description:** This is the root cause of the current SEO problem — body copy leaking into meta. The new template uses a fixed commercial string, NOT `product.description`.
- **Using `collection.description` as meta description:** Same issue for collection/brand pages.
- **Building title without `| MioMio` suffix:** Current brand and collection pages both omit this. Must be included.
- **Importing `@shared/*` path aliases in standalone scripts:** tsconfig paths with `moduleResolution: bundler` are Next.js/bundler-specific and don't work with `tsx` or `node` directly without `tsconfig-paths` register. Use plain `fetch()` in the script.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rate-limit delays in script | Custom token-bucket | `setTimeout` + simple counter | One-time script; 500ms delay between calls is sufficient |
| TSV parsing | Custom CSV parser | Split by `\t` + split by `\n` | TSV has known structure; no nested quotes in Address column |

**Key insight:** This phase is configuration changes to existing functions, not new infrastructure. The "hard" part (Storefront API client, metadata plumbing) is already built.

---

## Common Pitfalls

### Pitfall 1: `generateProductMetadata` caller passes full product object — type extension is backward-compatible

**What goes wrong:** Developer changes the function parameter type and assumes the caller needs updating.
**Why it happens:** The product page passes `product` (the full result from `getProduct`). Since TypeScript uses structural typing, adding optional fields `vendor?: string | null` and `productType?: string | null` is backward-compatible — existing callers continue to work.
**How to avoid:** Make new fields optional (`?`) in the parameter interface. The full product object already satisfies the extended interface.
**Warning signs:** TypeScript errors at call sites would indicate required (non-optional) fields were added.

### Pitfall 2: Brand page uses `collection.collection?.title` (double-nested) — watch nullability

**What goes wrong:** The brand page's `getCollection` returns `{ collection: { collection: {...} } }` (nested structure). The `generateBrandMetadata` call must use the inner `collection.collection` object, not `collection`.
**Why it happens:** `getCollection` returns `{ collection: CollectionQuery }` where `CollectionQuery.collection` is the actual Shopify collection.
**How to avoid:** Pass `collection.collection.title` (and `collection.collection.image`) to `generateBrandMetadata`. Guard the null case with early return `if (!collection.collection) return { title: 'Brand Not Found' }`.

### Pitfall 3: `getCollection` return shape — check if `image` field is present

**What goes wrong:** `generateBrandMetadata` parameter includes `image` but if `getCollection` query doesn't fetch `image`, the field will be `undefined`.
**Why it happens:** The collection query may not include `image` in its fields — this needs verification against the actual `getCollection.ts` implementation.
**How to avoid:** Check `getCollection.ts` query — if `image` is not fetched, pass `undefined` for image in `generateBrandMetadata`. Do not add `image` to the query as a side-effect of this phase.
**Warning signs:** TypeScript will error if `image` is not in the returned type.

### Pitfall 4: dotenv path in `.mjs` script — `.env` vs `.env.local`

**What goes wrong:** `import 'dotenv/config'` loads `.env` but `SHOPIFY_STOREFRONT_SECRET_TOKEN` is in `.env.local`. The script exits with "missing token" error.
**Why it happens:** Next.js loads `.env.local` automatically; standalone Node scripts do not.
**How to avoid:** Explicitly: `dotenv.config({ path: resolve(process.cwd(), '.env.local') })` before the import. Also load `.env` first for fallback.

### Pitfall 5: Shopify `productType` may be empty string

**What goes wrong:** Template shows `" Vendor Title | MioMio"` (leading space) when `productType` is empty string but not null/undefined.
**Why it happens:** Empty string is falsy in filter but `filter(Boolean)` handles it — empty string IS falsy so `filter(Boolean)` correctly excludes it.
**How to avoid:** Use `.filter(Boolean)` or `.filter(s => s && s.trim())` — `filter(Boolean)` works correctly since `''` is falsy.

### Pitfall 6: TSV handle extraction — `/product/` path segment

**What goes wrong:** Script extracts wrong segment from URL like `https://www.miomio.com.ua/uk/product/kedy-zhinochi-ash-movie`.
**Why it happens:** URL has multiple path segments; need the last one after `/product/`.
**How to avoid:**
```javascript
// Correct extraction pattern:
const url = 'https://www.miomio.com.ua/uk/product/kedy-zhinochi-ash-movie';
const handle = url.split('/product/')[1]; // 'kedy-zhinochi-ash-movie'
```

---

## Code Examples

### Current generateProductMetadata (to understand what changes)

```typescript
// Source: src/shared/lib/seo/generateMetadata.ts (current, lines 49-67)
export function generateProductMetadata(
  product: {
    title: string;
    description?: string | null;       // ← REMOVE: was used as description, now unused
    featuredImage?: { url: string } | null;
  },
  locale: string,
  slug: string
): Metadata {
  return generatePageMetadata(
    {
      title: product.title,            // ← CHANGE: becomes template title
      description: product.description || `${product.title} — купити в інтернет-магазині Mio Mio`,  // ← CHANGE: becomes fixed locale string
      image: product.featuredImage?.url,
    },
    locale,
    `/product/${slug}`
  );
}
```

### Updated generateProductMetadata

```typescript
// Source: CONTEXT.md decision — commercial template
export function generateProductMetadata(
  product: {
    title: string;
    vendor?: string | null;
    productType?: string | null;
    featuredImage?: { url: string } | null;
  },
  locale: string,
  slug: string
): Metadata {
  const titleParts = [product.productType, product.vendor, product.title].filter(Boolean);
  const title = `${titleParts.join(' ')} | MioMio`;

  const description = locale === 'uk'
    ? 'Фото, характеристики та доступні розміри в наявності. Зручне оформлення замовлення онлайн і доставка по Україні ✔️'
    : 'Фото, характеристики и доступные размеры в наличии. Удобное оформление заказа онлайн и доставка по Украине ✔️';

  return generatePageMetadata(
    { title, description, image: product.featuredImage?.url },
    locale,
    `/product/${slug}`
  );
}
```

### Updated generateCollectionMetadata

```typescript
// Source: CONTEXT.md decision — standard commercial template
export function generateCollectionMetadata(
  collection: {
    title: string;
    image?: { url: string } | null;
  },
  locale: string,
  slug: string,
  gender?: string,
): Metadata {
  const prefix = gender ? `/${gender}` : '';
  const isUk = locale === 'uk';

  const title = isUk
    ? `Купити ${collection.title} | MioMio`
    : `Купить ${collection.title} | MioMio`;

  const description = isUk
    ? `Обирайте ${collection.title} в MioMio: актуальні моделі, популярні бренди та зручна доставка по Україні.`
    : `Выбирайте ${collection.title} в MioMio: актуальные модели, популярные бренды и доставка по Украине.`;

  return generatePageMetadata(
    { title, description, image: collection.image?.url },
    locale,
    `${prefix}/${slug}`
  );
}
```

Note: The current `generateCollectionMetadata` signature includes `description?: string | null` in the collection parameter. This field can be removed from the parameter type since the commercial template no longer uses it. However, removing it is backward-compatible since existing callers passing `description` will simply have the field ignored.

### New generateBrandMetadata

```typescript
// Source: CONTEXT.md decision — commercial brand template
export function generateBrandMetadata(
  brand: {
    title: string;
    image?: { url: string } | null;
  },
  locale: string,
  slug: string
): Metadata {
  const isUk = locale === 'uk';

  const title = isUk
    ? `${brand.title} — купити онлайн | MioMio`
    : `${brand.title} — купить онлайн | MioMio`;

  const description = isUk
    ? 'Моделі бренду в MioMio: фото, доступні розміри та актуальна наявність. Доставка по Україні ✔️'
    : 'Модели бренда в MioMio: фото, доступные размеры и актуальное наличие. Доставка по Украине ✔️';

  return generatePageMetadata(
    { title, description, image: brand.image?.url },
    locale,
    `/brand/${slug}`
  );
}
```

### Updated Brand Page generateMetadata

```typescript
// Source: app/[locale]/(frontend)/brand/[slug]/page.tsx — updated import + call
import { generateBrandMetadata } from '@shared/lib/seo/generateMetadata';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const decodedSlug = decodeURIComponent(slug);

  try {
    const { collection } = await getCollection({
      handle: decodedSlug,
      first: 1,
      locale,
    });

    if (!collection.collection) {
      return { title: 'Brand Not Found' };
    }

    return generateBrandMetadata(
      {
        title: collection.collection.title,
        image: collection.collection.image ?? null,  // adjust if image not in query
      },
      locale,
      decodedSlug
    );
  } catch {
    return { title: 'Brand Not Found' };
  }
}
```

### Handle Test Script Skeleton

```javascript
// scripts/test-handles.mjs
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import dotenv from 'dotenv';

// Load env files (local overrides base)
dotenv.config({ path: resolve(process.cwd(), '.env') });
dotenv.config({ path: resolve(process.cwd(), '.env.local'), override: true });

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_SECRET_TOKEN;
const VERSION = (process.env.SHOPIFY_API_VERSION || '').trim();
const API_URL = `https://${DOMAIN}/api/${VERSION}/graphql.json`;

const TSV_FILE = resolve(process.cwd(), '.planning/02-2026 _ Додаток до аналізу нового сайту _ https___www.miomio.com.ua_ - Description outside head.tsv');

// Parse TSV — col 0 is Address
const lines = readFileSync(TSV_FILE, 'utf-8').split('\n').slice(1); // skip header
const handles = lines
  .map(line => line.split('\t')[0]?.trim())
  .filter(Boolean)
  .map(url => url.split('/product/')[1])
  .filter(Boolean);

console.log(`Testing ${handles.length} handles...`);

const QUERY = `
  query CheckHandle($handle: String!) {
    product(handle: $handle) {
      id
      handle
    }
  }
`;

async function checkHandle(handle) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Shopify-Storefront-Private-Token': TOKEN,
    },
    body: JSON.stringify({ query: QUERY, variables: { handle } }),
  });
  const { data } = await res.json();
  return data?.product ?? null;
}

// Sequential with delay to avoid 429
const ok = [];
const missing = [];
const delay = ms => new Promise(r => setTimeout(r, ms));

for (let i = 0; i < handles.length; i++) {
  const handle = handles[i];
  const product = await checkHandle(handle);
  if (product) {
    ok.push(handle);
    process.stdout.write(`[${i + 1}/${handles.length}] OK: ${handle}\n`);
  } else {
    missing.push(handle);
    process.stdout.write(`[${i + 1}/${handles.length}] MISSING: ${handle}\n`);
  }
  if (i < handles.length - 1) await delay(500); // 2 req/s
}

writeFileSync('scripts/handles-ok.txt', ok.join('\n'), 'utf-8');
writeFileSync('scripts/handles-missing.txt', missing.join('\n'), 'utf-8');

console.log(`\nDone. OK: ${ok.length}, Missing: ${missing.length}`);
console.log('Results: scripts/handles-ok.txt, scripts/handles-missing.txt');
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `product.description` as meta description | Fixed commercial template string | Phase 10 | Eliminates body copy in `<meta name="description">` |
| `collection.title` bare (no suffix) | `Купити {title} | MioMio` | Phase 10 | Adds commercial intent signal + brand suffix |
| Brand: `title: collection.title` raw object | `generateBrandMetadata()` | Phase 10 | Adds canonical URL, OG tags, Twitter card, template title |

---

## Open Questions

1. **Does `getCollection` query include `image` field?**
   - What we know: `generateCollectionMetadata` currently accepts `image` parameter; brand page currently doesn't pass image at all
   - What's unclear: Whether `getCollection.ts` query fetches `collection.image` — not checked in this research
   - Recommendation: Inspect `getCollection.ts` before writing brand page update. If image is not in the query result type, pass `undefined` (or `null`) for image in `generateBrandMetadata` call rather than adding image to the query in this phase.

2. **TSV encoding for Cyrillic handles**
   - What we know: TSV file contains Cyrillic characters in descriptions; handle URLs appear to be ASCII (transliterated slugs like `chelsi-ash-genesis-sequoia`)
   - What's unclear: Whether any handles contain encoded characters that need `decodeURIComponent`
   - Recommendation: Apply `decodeURIComponent` on each extracted handle as a safety measure.

3. **Shopify rate limits for 1738 handle checks**
   - What we know: Shopify Storefront API has rate limits; StorefrontClient uses retry on 502/503
   - What's unclear: Exact rate limit for private token Storefront API (likely 2 req/s or higher)
   - Recommendation: 500ms delay between requests (2 req/s) is conservative and safe; total runtime ~14 minutes. If faster is needed, reduce to 200ms (5 req/s).

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection:
  - `src/shared/lib/seo/generateMetadata.ts` — current implementation verified line by line
  - `src/entities/product/api/getProduct.ts` — confirmed `vendor` and `productType` in query
  - `app/[locale]/(frontend)/(product)/product/[slug]/page.tsx` — confirmed it calls `generateProductMetadata`
  - `app/[locale]/(frontend)/brand/[slug]/page.tsx` — confirmed bare title object, no template
  - `app/[locale]/(frontend)/(home)/[gender]/(collection)/[slug]/page.tsx` — confirmed it calls `generateCollectionMetadata`
  - `src/shared/lib/clients/storefront-client.ts` — confirmed endpoint format and header name
  - `package.json` — confirmed `dotenv`, `tsx` available; no test framework

### Secondary (MEDIUM confidence)
- `.planning/02-2026 _ Додаток до аналізу нового сайту _ https___www.miomio.com.ua_ - Description outside head.tsv` — 1738 handle rows confirmed, URL structure confirmed
- `scripts/fetch-pages.js` — confirms existing scripts use plain JS + `fetch()` pattern

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages, verified existing stack
- Architecture: HIGH — all file paths and signatures verified from codebase
- Pitfalls: HIGH — identified from actual code, not speculation
- Handle script approach: MEDIUM — dotenv path loading for `.env.local` is standard but the exact rate limit behavior is untested

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (stable codebase, 30 days)
