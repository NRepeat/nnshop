---
phase: 20-search-page-filters-pagination-and-sort
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/features/search/lib/queries.ts
  - src/features/search/api/search-products.ts
  - src/features/search/ui/SearchPageContent.tsx
  - src/features/search/ui/SearchPageGridWrapper.tsx
  - src/features/search/index.ts
  - app/[locale]/(frontend)/search/page.tsx
  - messages/uk.json
  - messages/ru.json
  - messages/en.json
autonomous: true
requirements:
  - SEARCH-PAGE-PARITY
must_haves:
  truths:
    - "User on /uk/search?q=... sees more than 10 results (pagination not capped)"
    - "User can open the FilterSheet on the /search page and select filters (size, color, brand, price)"
    - "Selected filters appear as chips in the ActiveFiltersCarousel above the grid and persist in the URL"
    - "User can change sort order (relevance / price asc / price desc) and the grid re-renders accordingly"
    - "User can click 'Show more' to load the next page of results without losing filters or sort"
    - "Predictive popup (header search) is unchanged — still uses predictiveSearch, still capped at 10"
    - "Page initial render is server-side (HTML contains products on first response, not after JS hydration)"
    - "Locale routing is preserved — /ru/search returns RU-localized results, /uk/search returns UK"
    - "robots noindex header on /search is preserved"
  artifacts:
    - path: "src/features/search/lib/queries.ts"
      provides: "SEARCH_QUERY GraphQL doc using root search() with productFilters + sortKey + after"
      contains: "SEARCH_QUERY"
    - path: "src/features/search/api/search-products.ts"
      provides: "searchProducts() server helper returning { products, productFilters, pageInfo, totalCount }"
      exports: ["searchProducts"]
    - path: "src/features/search/ui/SearchPageContent.tsx"
      provides: "Server component rendering filter bar + grid + load more for /search"
      exports: ["SearchPageContent"]
    - path: "src/features/search/ui/SearchPageGridWrapper.tsx"
      provides: "Client wrapper holding grid + LoadMore for search results (mirrors ClientGridWrapper)"
      exports: ["SearchPageGridWrapper"]
    - path: "app/[locale]/(frontend)/search/page.tsx"
      provides: "Thin Suspense-wrapped page shell calling SearchPageContent"
      contains: "SearchPageContent"
  key_links:
    - from: "app/[locale]/(frontend)/search/page.tsx"
      to: "src/features/search/ui/SearchPageContent.tsx"
      via: "import + JSX render"
      pattern: "SearchPageContent"
    - from: "src/features/search/ui/SearchPageContent.tsx"
      to: "src/features/search/api/search-products.ts"
      via: "await searchProducts({ query, locale, searchParams, first, after })"
      pattern: "searchProducts\\("
    - from: "src/features/search/ui/SearchPageContent.tsx"
      to: "@features/collection/ui/FilterSheet"
      via: "import + render with productFilters"
      pattern: "FilterSheet"
    - from: "src/features/search/ui/SearchPageGridWrapper.tsx"
      to: "@features/collection/ui/LoadMore"
      via: "import + render with pageInfo"
      pattern: "LoadMore"
---

<objective>
Replace the `predictiveSearch`-based /search page (capped at 10, no filters, no sort, no pagination) with a full-featured results page driven by Shopify Storefront's root `search` query. Reuse the collection module's filter/sort/active-chips/load-more UI primitives so /search reaches feature parity with collection pages, while leaving the header predictive popup completely untouched.

Purpose: /search is currently degenerate compared to /man and /woman collection pages — users typing a query get a 10-item snapshot with no way to refine. This phase brings the search results UX up to par.

Output:
- `src/features/search/lib/queries.ts` extended with `SEARCH_QUERY`
- `src/features/search/api/search-products.ts` (new server helper)
- `src/features/search/ui/SearchPageContent.tsx` (new server component)
- `src/features/search/ui/SearchPageGridWrapper.tsx` (new client wrapper)
- `src/features/search/index.ts` updated barrel exports
- `app/[locale]/(frontend)/search/page.tsx` thinned to render `SearchPageContent`
- 3 i18n message bumps for new strings under `Search` namespace
</objective>

<execution_context>
@/Users/mnmac/Development/nnshop/.claude/get-shit-done/workflows/execute-plan.md
@/Users/mnmac/Development/nnshop/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/phases/19-search-refactor-fsd-structure-quick-fixes/19-01-SUMMARY.md

# Reference patterns to mirror
@src/features/collection/ui/CollectionGrid.tsx
@src/features/collection/ui/ClientGridWrapper.tsx
@src/features/collection/ui/FilterSheet.tsx
@src/features/collection/ui/SortSelect.tsx
@src/features/collection/ui/ActiveFiltersCarousel.tsx
@src/features/collection/ui/LoadMore.tsx
@src/features/collection/lib/filterProducts.ts
@src/entities/collection/api/getCollection.ts
@src/entities/collection/api/query.ts

# Files to modify
@src/features/search/lib/queries.ts
@src/features/search/api/predictive-search.ts
@src/features/search/index.ts
@app/[locale]/(frontend)/search/page.tsx
@src/features/search/ui/SearchResultsGrid.tsx

# Storefront types
@src/shared/lib/shopify/types/storefront.types.d.ts

<interfaces>
<!-- Key types and contracts. Use these directly. -->

From `@shared/lib/shopify/types/storefront.types` (.d.ts lines 7440, 7670–7796):
```typescript
// Root search query takes these args:
type QueryRootSearchArgs = {
  after?: string | null;
  before?: string | null;
  first?: number | null;
  last?: number | null;
  prefix?: SearchPrefixQueryType | null;        // 'LAST' | 'NONE'
  productFilters?: ProductFilter[] | null;       // SAME ProductFilter type used by collections
  query: string;                                 // required
  reverse?: boolean | null;
  sortKey?: SearchSortKeys | null;               // 'RELEVANCE' | 'PRICE' (NO BEST_SELLING, NO CREATED)
  types?: SearchType[] | null;                   // ['PRODUCT'] for product-only
  unavailableProducts?: SearchUnavailableProductsType | null;
};

// Returns:
type SearchResultItemConnection = {
  edges: { cursor: string; node: SearchResultItem }[];
  nodes: SearchResultItem[];                     // SearchResultItem = Article | Page | Product
  pageInfo: PageInfo;                            // hasNextPage, hasPreviousPage, endCursor, startCursor
  productFilters: Filter[];                      // SAME Filter[] type FilterSheet expects
  totalCount: number;
};

enum SearchSortKeys { Price = 'PRICE', Relevance = 'RELEVANCE' }
```

From `@features/collection/ui/FilterSheet`:
```typescript
type Props = {
  filters: Filter[] | undefined;
  initialFilters: Filter[] | undefined;
  hideVendor?: boolean;
};
```
✅ The `Filter[]` returned by `search.productFilters` is structurally identical to the one returned by `collection.products.filters`. Direct reuse is safe — no adapter needed.

From `@features/collection/ui/LoadMore`:
```typescript
function LoadMore({ handle, initialPageInfo }: { handle: string; initialPageInfo: PageInfo }): JSX.Element
```
LoadMore is collection-agnostic in practice: its only effect is `setLimit(limit + 20)` via nuqs (`shallow: false`), which triggers a server re-render of the parent page. The `handle` prop is documented as unused in the new logic (see `LoadMore.tsx` line 11–20 comment). We can pass `handle="search"` (or the query string) — it does nothing functional, just satisfies the type.

From `src/features/search/lib/queries.ts` (existing):
- `PREDICTIVE_SEARCH_QUERY`, `DEFAULT_PREDICTIVE_LIMIT`, `SEARCHABLE_FIELDS` — leave intact, popup uses these.

From `src/features/search/api/predictive-search.ts` (existing):
- `predictiveSearch({ query, locale, limit, searchableFields })` — leave intact, popup uses this.

Sort enum mapping (URL → Storefront):
| URL `?sort=` value     | sortKey      | reverse |
|------------------------|--------------|---------|
| (absent / `trending`)  | `RELEVANCE`  | `false` |
| `price-asc`            | `PRICE`      | `false` |
| `price-desc`           | `PRICE`      | `true`  |
| `created-desc`         | `RELEVANCE`  | `false` (search has no CREATED key — fall back to relevance, do NOT crash) |

URL searchParam keys (mirror collections):
- `q` — search query (required; if missing, show empty state)
- `sort` — `price-asc` | `price-desc` | `created-desc` | absent
- `limit` — pagination cursor proxy (default 24, increment 24)
- `minPrice`, `maxPrice` — numeric price bounds
- `rozmir` — semicolon-joined size slugs
- any other key matching a `productFilters` filter id segment — semicolon-joined value slugs (e.g. `?color=chornyi;bilyi`)
</interfaces>
</context>

<assumptions>
Defaults chosen for --auto mode (document and proceed; no clarifying questions):

1. **Page size = 24.** Collections use 20; search bumped to 24 because (a) result sets are typically smaller and 24 fills 4 columns × 6 rows cleanly on lg, (b) reduces "load more" clicks for short queries. Increment per click: 24.

2. **Reuse `LoadMore` from `@features/collection/ui` as-is.** Its `nuqs`-based `?limit` mechanism is collection-agnostic — the only effect is bumping a URL param and forcing SSR re-render. `handle` prop is documented unused (LoadMore.tsx line 11–20). No new component needed. We pass `handle={query}` purely to satisfy the type.

3. **Reuse `ClientGridWrapper` is NOT viable** because it pulls in collection-specific `filterProducts` client-side post-filtering logic (size slugs, optionGroups) that depends on collection filter definitions. We build a slimmer `SearchPageGridWrapper` that does the same favorites-fetch + ClientGrid + LoadMore wiring without the size/option client-side filter pass. (Server-side `productFilters` already filters via the GraphQL query, so client-side filtering is unnecessary for /search.)

4. **Cursor pagination via "fetch first N" pattern** (matches collections): we don't track `endCursor` across requests. Each render asks for `first: limit` from the start. `?limit` grows. Yes, this re-fetches earlier pages on every "Show more" click — but it's how collections already work, keeps URL shareable, and avoids stateful cursor tracking. Trade-off accepted for consistency.

5. **Sort enum mapping:** `RELEVANCE` is default. `created-desc` (newest) is silently mapped to `RELEVANCE` since `SearchSortKeys` only has `Price` and `Relevance`. The SortSelect dropdown will still show "Newest" as an option (no UI changes to SortSelect — keeps shared component intact); on /search it just degrades to relevance. Acceptable in --auto mode; if product wants to hide "Newest" on /search, that's a follow-up using `hideVendor`-like prop.

6. **Filter param parsing reuses collection logic.** Same `toFilterSlug` decoding, same semicolon split, same `JSON.parse(filterValue.input)` ProductFilter assembly as `getCollection.ts` lines 165–197. We extract this into `searchProducts` directly (don't re-export from collection module — keeps search self-contained).

7. **`unavailableProducts: HIDE`** — mirror collections' `[{ available: true }]` filter behavior. Search query has a dedicated arg `unavailableProducts: SearchUnavailableProductsType` ('SHOW' | 'HIDE' | 'LAST'). We pass `HIDE` so out-of-stock products are excluded server-side.

8. **`prefix: LAST`** — enables partial-word match on the last term (typing "kros" matches "kросівки"). Matches predictive popup expectation.

9. **`types: [PRODUCT]`** — exclude Article and Page from results. The page renders only products.

10. **No `CollectionFilterBar`** equivalent on /search. Collections render an inline filter bar AND the FilterSheet. /search starts with FilterSheet only (drawer trigger button) — simpler, fewer components to reskin, mobile-friendly. Inline bar is a follow-up if requested.

11. **Translations:** existing `Search` namespace already has `title`, `resultsFor`, `errorFetchingResults`, `noResults`, `tryAgain`. We add `totalResults` ("{count} results" pluralized) for the count badge above the grid. Reuse `CollectionPage.sort.*` and `LoadMore.showMore` — no new keys there.

12. **`SearchResultItem` is a union (`Article | Page | Product`)** — even though we pass `types: [PRODUCT]`, the GraphQL response edges still have `node: SearchResultItem`. We narrow with `... on Product { ... }` inline fragment in the query and runtime-filter `__typename === 'Product'` in the helper for type safety.
</assumptions>

<tasks>

<task type="auto">
  <name>Task 1: Add SEARCH_QUERY GraphQL doc and searchProducts server helper</name>
  <files>
    src/features/search/lib/queries.ts,
    src/features/search/api/search-products.ts,
    src/features/search/index.ts
  </files>
  <action>
**1a. Extend `src/features/search/lib/queries.ts`** — append (do NOT remove `PREDICTIVE_SEARCH_QUERY`, `DEFAULT_PREDICTIVE_LIMIT`, `SEARCHABLE_FIELDS`):

```graphql
export const SEARCH_QUERY = `#graphql
  query SearchProducts(
    $query: String!
    $first: Int
    $after: String
    $productFilters: [ProductFilter!]
    $sortKey: SearchSortKeys
    $reverse: Boolean
  ) {
    search(
      query: $query
      first: $first
      after: $after
      productFilters: $productFilters
      sortKey: $sortKey
      reverse: $reverse
      types: [PRODUCT]
      prefix: LAST
      unavailableProducts: HIDE
    ) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
      productFilters {
        id
        label
        type
        values {
          id
          label
          count
          input
        }
      }
      edges {
        cursor
        node {
          __typename
          ... on Product {
            id
            title
            handle
            availableForSale
            productType
            vendor
            totalInventory
            tags
            createdAt
            metafield(namespace: "custom", key: "znizka") {
              value
              namespace
              key
            }
            variants(first: 250) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  quantityAvailable
                  price { amount currencyCode }
                  compareAtPrice { amount currencyCode }
                  selectedOptions { name value }
                }
              }
            }
            options {
              name
              optionValues { name }
            }
            priceRange {
              minVariantPrice { amount currencyCode }
              maxVariantPrice { amount currencyCode }
            }
            featuredImage {
              url
              altText
              width
              height
            }
            media(first: 20) {
              edges {
                node {
                  previewImage {
                    url
                    width
                    height
                    altText
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const DEFAULT_SEARCH_PAGE_SIZE = 24;
```

Field set MUST match what `ProductCardSPP` and `filterProducts` need (see `getCollection`'s `query.ts` for the canonical product field set — replicate; do NOT add `description` or `seo` to keep the query lean). Mirroring `GetCollectionWithProducts` ensures `metafield(custom.znizka)` discount renders correctly per Phase 19's R-02 fix.

**1b. Create `src/features/search/api/search-products.ts`** — server helper. Use `'use server'`-style direct call (no `'use cache'` because search results are query-dependent and cardinality is unbounded; matches `predictive-search.ts`):

```typescript
import { storefrontClient } from '@shared/lib/shopify/client';
import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import {
  Filter,
  PageInfo,
  Product,
  ProductFilter,
  SearchSortKeys,
} from '@shared/lib/shopify/types/storefront.types';
import { toFilterSlug } from '@shared/lib/filterSlug';
import { SEARCH_QUERY, DEFAULT_SEARCH_PAGE_SIZE } from '../lib/queries';

export type SearchProductsResult = {
  products: Product[];
  productFilters: Filter[];
  pageInfo: PageInfo;
  totalCount: number;
};

type Args = {
  query: string;
  locale: string;
  searchParams?: { [key: string]: string | string[] | undefined };
  first?: number;
  after?: string;
};

export async function searchProducts(args: Args): Promise<SearchProductsResult> {
  const { query, locale, searchParams, first, after } = args;

  // Step 1: First fetch — get filter definitions (lean query, no products needed for defs).
  // We need filter defs to translate URL slugs → ProductFilter inputs.
  // Storefront's search query returns productFilters in the same shape as collection.products.filters,
  // so we do a lightweight first call (first: 1) and reuse the productFilters from it for translation.
  // (Alternative: do a single call. Chose two-call to keep filter def lookup independent of result page size.
  //  Acceptable cost since both are cached at the edge per storefrontClient defaults.)

  let translatedFilters: ProductFilter[] = [];
  if (searchParams) {
    const defResponse = await storefrontClient.request<
      { search: { productFilters: Filter[] } },
      { query: string; first: number }
    >({
      query: SEARCH_QUERY,
      language: locale.toUpperCase() as StorefrontLanguageCode,
      variables: { query, first: 1 },
    });
    const filterDefs = defResponse.search?.productFilters ?? [];

    for (const [key, value] of Object.entries(searchParams)) {
      if (key === 'q' || key === 'sort' || key === 'limit') continue;
      if (key === 'minPrice' || key === 'maxPrice') continue;

      const definition = filterDefs.find((f) => {
        const segment = f.id.split('.').pop() || '';
        return toFilterSlug(segment) === key || f.id.endsWith(`.${key}`);
      });
      if (!definition) continue;

      const values = Array.isArray(value)
        ? value
        : (value as string).split(';');
      values.forEach((v) => {
        const fv = definition.values.find((d) => toFilterSlug(d.label) === v);
        if (fv) {
          try {
            translatedFilters.push(JSON.parse(fv.input));
          } catch {}
        }
      });
    }

    if (searchParams.minPrice || searchParams.maxPrice) {
      const priceFilter: ProductFilter = { price: {} };
      if (searchParams.minPrice)
        priceFilter.price!.min = parseFloat(searchParams.minPrice as string);
      if (searchParams.maxPrice)
        priceFilter.price!.max = parseFloat(searchParams.maxPrice as string);
      translatedFilters.push(priceFilter);
    }
  }

  // Step 2: Sort mapping (URL → SearchSortKeys).
  // Search has only RELEVANCE and PRICE; created-desc falls back to RELEVANCE.
  let sortKey: SearchSortKeys | undefined;
  let reverse = false;
  const sortParam = searchParams?.sort as string | undefined;
  switch (sortParam) {
    case 'price-asc':
      sortKey = 'PRICE' as SearchSortKeys;
      reverse = false;
      break;
    case 'price-desc':
      sortKey = 'PRICE' as SearchSortKeys;
      reverse = true;
      break;
    case 'created-desc':
    case 'trending':
    default:
      sortKey = 'RELEVANCE' as SearchSortKeys;
      reverse = false;
  }

  // Step 3: Real fetch.
  const response = await storefrontClient.request<
    {
      search: {
        totalCount: number;
        pageInfo: PageInfo;
        productFilters: Filter[];
        edges: { cursor: string; node: Product & { __typename: string } }[];
      };
    },
    {
      query: string;
      first: number;
      after?: string;
      productFilters?: ProductFilter[];
      sortKey?: SearchSortKeys;
      reverse?: boolean;
    }
  >({
    query: SEARCH_QUERY,
    language: locale.toUpperCase() as StorefrontLanguageCode,
    variables: {
      query,
      first: first ?? DEFAULT_SEARCH_PAGE_SIZE,
      after,
      productFilters: translatedFilters.length > 0 ? translatedFilters : undefined,
      sortKey,
      reverse,
    },
  });

  const products = (response.search?.edges ?? [])
    .filter((e) => e.node.__typename === 'Product')
    .map((e) => e.node as Product);

  return {
    products,
    productFilters: response.search?.productFilters ?? [],
    pageInfo: response.search?.pageInfo ?? {
      hasNextPage: false,
      hasPreviousPage: false,
      endCursor: null,
      startCursor: null,
    } as PageInfo,
    totalCount: response.search?.totalCount ?? 0,
  };
}
```

**1c. Update `src/features/search/index.ts`** — add the new exports (preserve existing):

```typescript
export { SearchTrigger } from './ui/SearchTrigger';
export { SearchDialog } from './ui/SearchDialog';
export { SearchResultsGrid } from './ui/SearchResultsGrid';
export { SearchSkeleton } from './ui/SearchSkeleton';
export { SearchEmpty } from './ui/SearchEmpty';
export { predictiveSearch } from './api/predictive-search';
export { searchProducts } from './api/search-products';
export type { SearchProductsResult } from './api/search-products';
export { SearchPageContent } from './ui/SearchPageContent';
```

(`SearchPageContent` will be created in Task 2 — adding the export here is intentional; TypeScript `--noEmit` will fail until Task 2 lands. Tasks 1 and 2 must commit together OR Task 1 omits the SearchPageContent export until Task 2.)

NOTE: To keep tasks independently shippable, **omit the `SearchPageContent` export in Task 1's index.ts edit**, and add it in Task 2's index.ts edit. Final state after both tasks: all exports present.
  </action>
  <verify>
    <automated>npx tsc --noEmit -p tsconfig.json 2>&amp;1 | grep -E "(features/search|error TS)" | head -20</automated>
    Expected: zero errors from the new files. `searchProducts` is type-correct against existing `Filter`, `Product`, `ProductFilter`, `PageInfo`, `SearchSortKeys` from storefront.types. Index re-exports compile cleanly.
  </verify>
  <done>
    - `SEARCH_QUERY` and `DEFAULT_SEARCH_PAGE_SIZE` exported from `src/features/search/lib/queries.ts`.
    - `searchProducts` exported from `src/features/search/api/search-products.ts` with signature `({ query, locale, searchParams?, first?, after? }) => Promise<SearchProductsResult>`.
    - Helper translates URL filter params to `ProductFilter[]` via two-call pattern (filter defs + actual fetch), maps `?sort` to `SearchSortKeys`, returns `{ products, productFilters, pageInfo, totalCount }`.
    - `predictiveSearch` and `PREDICTIVE_SEARCH_QUERY` untouched — popup still works.
    - `tsc --noEmit` passes for `src/features/search/**`.
  </done>
</task>

<task type="auto">
  <name>Task 2: Build SearchPageContent + SearchPageGridWrapper and wire into /search route</name>
  <files>
    src/features/search/ui/SearchPageContent.tsx,
    src/features/search/ui/SearchPageGridWrapper.tsx,
    src/features/search/index.ts,
    app/[locale]/(frontend)/search/page.tsx,
    messages/uk.json,
    messages/ru.json,
    messages/en.json
  </files>
  <action>
**2a. Create `src/features/search/ui/SearchPageContent.tsx`** — server component, mirrors `CollectionGrid.tsx` (without the collection-specific bits: no Sanity, no canonical-handle redirect, no gender redirect, no `CollectionFilterBar`, no `GridToggle` initially).

```typescript
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { searchProducts } from '../api/search-products';
import { SearchEmpty } from './SearchEmpty';
import { SearchPageGridWrapper } from './SearchPageGridWrapper';
import { FilterSheet } from '@features/collection/ui/FilterSheet';
import { SortSelect } from '@features/collection/ui/SortSelect';
import { ActiveFiltersCarousel } from '@features/collection/ui/ActiveFiltersCarousel';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@shared/ui/empty';
import { PackageSearch } from 'lucide-react';
import { Product, PageInfo } from '@shared/lib/shopify/types/storefront.types';

type SearchParams = { [key: string]: string | string[] | undefined };

export const SearchPageContent = async ({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) => {
  const [{ locale }, awaitedSearchParams, t, tCollection] = await Promise.all([
    params,
    searchParams,
    getTranslations('Search'),
    getTranslations('CollectionPage'),
  ]);

  const query = typeof awaitedSearchParams.q === 'string'
    ? awaitedSearchParams.q.trim()
    : '';

  // Page-size from ?limit (mirrors CollectionGrid pattern — LoadMore bumps this).
  const limit = Math.min(
    parseInt((awaitedSearchParams.limit as string) || '24', 10),
    250,
  );

  // Page title — server-rendered always (even before query check) for SEO/skeleton consistency.
  const pageTitle = (
    <h1 className="text-3xl md:text-4xl font-bold mb-2">
      {query ? `${t('resultsFor')} "${query}"` : t('title')}
    </h1>
  );

  if (!query) {
    return (
      <div className="mt-8 md:mt-8 h-fit min-h-screen">
        <div className="container">
          <div className="my-8">{pageTitle}</div>
          <SearchEmpty />
        </div>
      </div>
    );
  }

  let result;
  try {
    result = await searchProducts({
      query,
      locale,
      searchParams: awaitedSearchParams,
      first: limit,
    });
  } catch (error) {
    console.error('Error fetching search results:', error);
    return (
      <div className="container mt-8">
        <div className="my-8">{pageTitle}</div>
        <p>{t('errorFetchingResults')}</p>
      </div>
    );
  }

  const { products, productFilters, pageInfo, totalCount } = result;

  if (products.length === 0) {
    return (
      <div className="mt-8 md:mt-8 h-fit min-h-screen">
        <div className="container">
          <div className="my-8">{pageTitle}</div>
          <Empty>
            <EmptyHeader>
              <PackageSearch className="w-12 h-12 text-muted-foreground" />
              <EmptyTitle>{t('noResults')}</EmptyTitle>
              <EmptyDescription>{t('tryAgain')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </div>
    );
  }

  // Add isFav: false placeholder (real values fetched client-side in wrapper).
  const productsWithFav = products.map((p) => ({ ...p, isFav: false }));

  return (
    <div className="mt-8 md:mt-8 h-fit min-h-screen">
      <div className="container">
        <div className="my-8">{pageTitle}</div>

        <p className="text-sm text-muted-foreground mb-4">
          {t('totalResults', { count: totalCount })}
        </p>

        <div className="flex flex-col">
          <div className="w-full border-b border-muted pb-4 flex flex-col lg:flex-row justify-between lg:items-end gap-6">
            <div className="flex flex-col gap-3.5 w-full">
              {productFilters.length > 0 && (
                <Suspense fallback={null}>
                  <ActiveFiltersCarousel filters={productFilters} />
                </Suspense>
              )}
            </div>
            <div className="flex h-full items-center flex-row gap-2 justify-between md:justify-end">
              <div className="flex gap-2">
                <Suspense fallback={null}>
                  <SortSelect />
                </Suspense>
                <FilterSheet
                  filters={productFilters}
                  initialFilters={productFilters}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-8 h-full">
            <SearchPageGridWrapper
              initialProducts={productsWithFav as (Product & { isFav: boolean })[]}
              initialPageInfo={pageInfo as PageInfo}
              query={query}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
```

KEY DECISIONS in this file:
- `initialFilters={productFilters}` — same array passed twice. Collections fetch a separate "unfiltered" filter defs call to keep facet labels stable when filters narrow results. /search keeps it simple: filters reflect current result set. Acceptable because search facets are query-driven anyway. (Future improvement: do a separate `searchProducts({query, locale, first:1})` call without filters to get full facets — out of scope.)
- No `JsonLd`, no `Breadcrumb`, no `PathSync`, no `GA4ViewItemListEvent` — `/search` is `noindex`, has no SEO breadcrumb, has no canonical "list" identity. Skipping these is correct.
- No client-side `filterProducts` post-pass (collection does this for size/option client-side narrowing). Search relies purely on Storefront `productFilters` server-side filtering — sufficient.

**2b. Create `src/features/search/ui/SearchPageGridWrapper.tsx`** — slim client wrapper (no collection-specific size/option client filter, no GridToggle, no scroll-to-top until needed):

```typescript
'use client';
import * as React from 'react';
import { useState, useEffect, Suspense } from 'react';
import { ClientGrid } from '@features/collection/ui/ClientGrid';
import LoadMore from '@features/collection/ui/LoadMore';
import { PageInfo, Product } from '@shared/lib/shopify/types/storefront.types';
import { ArrowUp } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { getFavoriteProductIds } from '@features/collection/api/get-favorite-ids';
import { useSession } from '@features/auth/lib/client';

type Props = {
  initialProducts: (Product & { isFav: boolean })[];
  initialPageInfo: PageInfo;
  query: string;
};

export const SearchPageGridWrapper = ({
  initialProducts,
  initialPageInfo,
  query,
}: Props) => {
  const session = useSession();
  const [favSet, setFavSet] = useState<Set<string>>(new Set());

  const productIdsKey = initialProducts.map((p) => p.id).join(',');

  useEffect(() => {
    const user = session.data?.user as
      | (NonNullable<typeof session.data>['user'] & { isAnonymous?: boolean })
      | undefined;
    if (!user || user.isAnonymous || session.isPending) return;
    getFavoriteProductIds(initialProducts.map((p) => p.id)).then((ids) => {
      setFavSet(new Set(ids));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIdsKey, session.data, session.isPending]);

  const products = React.useMemo(
    () => initialProducts.map((p) => ({ ...p, isFav: favSet.has(p.id) })),
    [initialProducts, favSet],
  );

  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="flex h-full w-full justify-between">
      <div className="flex flex-col w-full items-end justify-between">
        <div className="flex flex-col w-full justify-between pt-0 min-h-screen h-fit">
          <ClientGrid
            products={products}
            hasNextPage={initialPageInfo?.hasNextPage}
          />
          <div className="w-full items-center">
            <Suspense fallback={null}>
              {/* LoadMore's `handle` prop is unused per its current implementation
                  (see LoadMore.tsx lines 11-20). We pass `query` to satisfy the type. */}
              <LoadMore initialPageInfo={initialPageInfo} handle={query} />
            </Suspense>
          </div>
        </div>
      </div>
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-24 right-8.5 z-20 w-10 h-10 bg-black text-white rounded-full shadow-lg flex items-center justify-center hover:bg-neutral-800 transition-colors"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};
```

**2c. Update `src/features/search/index.ts`** — add `SearchPageContent` export:

```typescript
export { SearchPageContent } from './ui/SearchPageContent';
```

(Append below existing exports.)

**2d. Replace `app/[locale]/(frontend)/search/page.tsx`** — thin shell:

```typescript
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { SearchPageContent, SearchSkeleton } from '@features/search';
import { Skeleton } from '@shared/ui/skeleton';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://miomio.com.ua';
  return {
    robots: { index: false, follow: true },
    alternates: { canonical: `${base}/${locale}/search` },
  };
}

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container p-4">
      <Suspense fallback={<SearchPageSkeleton />}>
        <SearchPageContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

const SearchPageSkeleton = () => (
  <>
    <Skeleton className="h-8 w-1/3 mb-4" />
    <SearchSkeleton />
  </>
);
```

Key changes vs current page:
- Drops `predictiveSearch` import and inline data-fetching component.
- Renders `SearchPageContent` directly under Suspense (server component handles data + UI).
- `robots: noindex` preserved (no SEO change).
- `alternates.canonical` preserved.

**2e. Update translations** — add `totalResults` to `Search` namespace in all three locale files.

`messages/uk.json` — Search namespace, add:
```json
"totalResults": "{count, plural, one {# результат} few {# результати} many {# результатів} other {# результату}}"
```
(Same value as existing `results` key — both can coexist; `results` is used by popup, `totalResults` by page. If preferred, alias to `results`.)

`messages/ru.json` — Search namespace, add:
```json
"totalResults": "{count, plural, one {# результат} few {# результата} many {# результатов} other {# результата}}"
```

`messages/en.json` — Search namespace, add (check if Search namespace exists; if not, create it):
```json
"totalResults": "{count, plural, one {# result} other {# results}}"
```

Validate JSON parses (`node -e "JSON.parse(require('fs').readFileSync('messages/uk.json','utf8'))"` for each).
  </action>
  <verify>
    <automated>npx tsc --noEmit -p tsconfig.json 2>&amp;1 | grep -E "error TS" | head -20</automated>
    Expected: zero TypeScript errors. All imports resolve, all props match. JSON parses cleanly.
  </verify>
  <done>
    - `SearchPageContent` server component renders filter bar (FilterSheet + SortSelect + ActiveFiltersCarousel) + grid + LoadMore for /search.
    - `SearchPageGridWrapper` client component handles favorites fetch + grid + LoadMore wiring (slimmer than ClientGridWrapper, no client-side post-filtering).
    - `app/[locale]/(frontend)/search/page.tsx` is ~30 lines, delegates to `SearchPageContent`.
    - `predictiveSearch` import removed from page (popup `SearchDialog` still imports it via `@features/search` barrel — unaffected).
    - `noindex` robots header preserved.
    - i18n keys added in uk/ru/en.
    - `tsc --noEmit` passes.
  </done>
</task>

</tasks>

<verification>
Manual smoke test (cannot be automated — requires running app + Storefront API):

1. **Cold path / no query:** Visit `http://localhost:3000/uk/search` → renders page title + `SearchEmpty` (suggested searches / empty state). No grid, no filters.

2. **Basic query:** Visit `http://localhost:3000/uk/search?q=кросівки` → server-rendered HTML contains product cards on first response (view source / Network tab "Doc" response). Grid shows up to 24 products. "Show {N} results" count above grid. FilterSheet trigger button visible. SortSelect visible.

3. **Pagination:** On the same page, click "Show more" → URL becomes `?q=кросівки&limit=48` → grid expands to 48 products without scroll jump. If `pageInfo.hasNextPage` is false, button disappears.

4. **Filters — size:** Open FilterSheet → toggle a size (e.g. 38) → URL becomes `?q=кросівки&rozmir=38` → grid re-renders showing only products with size 38. Active filter chip "38" appears in `ActiveFiltersCarousel` above grid. Click chip's X → URL clears `rozmir`, grid restores.

5. **Filters — price:** Open FilterSheet → set price range → URL becomes `?q=...&minPrice=500&maxPrice=2000` → grid filtered server-side. Total count badge updates.

6. **Filters — color/brand:** Pick a color or brand → URL gets `?color=chornyi` (or `?brand=...`) → grid re-renders.

7. **Sort:** Change SortSelect to "Price: low to high" → URL gets `?sort=price-asc` → grid re-orders ascending. Switch to "Price: high to low" → reverse. Switch to "Newest" → falls back to relevance silently (no crash; results may look like default — this is the documented sort-mapping limitation).

8. **Combined:** `?q=сумка&sort=price-asc&minPrice=1000&color=chornyi&limit=48` → all filters compose, grid renders.

9. **Locale:** Visit `/ru/search?q=ботинки` → results in RU (vendor names, filter labels in Russian if Storefront has translations).

10. **Popup unchanged:** Click header search icon → SearchDialog opens → type a query → popup still shows max 10 results, no filters in popup. Confirms popup uses `predictiveSearch`, not `searchProducts`.

11. **Mobile (DevTools 375px):** FilterSheet drawer opens full-width. SortSelect truncates text correctly (`w-[150px]`). LoadMore button full-width centered. ActiveFiltersCarousel scrolls horizontally.

12. **Tablet (768px):** 3-column grid. Filter bar wraps row → column. SortSelect + FilterSheet inline.

13. **Desktop (1280px):** 4-column grid. Filter bar single row.

14. **noindex:** View page source → `<meta name="robots" content="noindex,follow">` present. Confirm not in sitemap.

Automated:
```bash
npx tsc --noEmit -p tsconfig.json
```
Must pass with zero errors.
</verification>

<success_criteria>
- `/uk/search?q=...` and `/ru/search?q=...` show full search UI (filter, sort, pagination) with > 10 results when matches exist.
- All five filter types (size/rozmir, price, color, brand, any other vendor metafield filter) work via FilterSheet and reflect in URL.
- Sort dropdown changes server-fetched order for `price-asc` and `price-desc`; `created-desc` and `trending` both map to RELEVANCE without error.
- "Show more" loads next 24 products via `?limit` URL increment without losing other params.
- Active filter chips appear above grid when filters present; X closes individual filters.
- Header predictive popup is byte-identical in behavior to before this phase.
- `npx tsc --noEmit -p tsconfig.json` passes with zero errors.
- noindex robots tag preserved on /search.
- `predictiveSearch`, `SearchDialog`, `SearchTrigger` untouched.
</success_criteria>

<out_of_scope>
- **`cmdk` integration / command-palette UX** — Phase B, separate plan.
- **SearchDialog popup behavior changes** — popup keeps `predictiveSearch` (10-cap, no filters). Do not touch `SearchDialog.tsx`, `SearchTrigger.tsx`, `SearchSkeleton.tsx`, `SearchEmpty.tsx`, `predictive-search.ts`, `use-predictive-search.ts`.
- **Product detail page (`/p/[handle]`)** — unrelated.
- **Other collection routes (`/man/[slug]`, `/woman/[slug]`)** — unchanged. Reuse pattern goes search → collection only, not collection → search.
- **JSON-LD ItemList schema for /search** — page is `noindex`, no SEO benefit.
- **Breadcrumb component on /search** — `noindex` page, no breadcrumb schema needed.
- **GridToggle (1col/2col mobile toggle)** — collection-only feature, skip on /search to keep wrapper slim.
- **CollectionFilterBar inline-bar (always-visible filter chips above grid)** — skip; FilterSheet drawer is sufficient for /search v1.
- **Splitting filter defs from filter-applied results into two separate calls** with full unfiltered facet preservation — collection does this; /search uses single result's productFilters as both `filters` and `initialFilters`. Acceptable trade-off documented in assumptions.
- **Hand-rolled GraphQL types / regenerating `storefront.generated.ts`** — current types `SearchSortKeys`, `Filter`, `ProductFilter`, `PageInfo`, `Product` are already in `storefront.types.d.ts`. No codegen run needed.
- **Hiding "Newest" sort option on /search** — leaving it visible (degrades to relevance) is acceptable for v1.
</out_of_scope>

<risks>

**R-01: `productFilters` payload shape mismatch with FilterSheet.**
- Likelihood: LOW
- Mitigation: Both `collection.products.filters` and `search.productFilters` resolve to GraphQL `Filter[]` per `storefront.types.d.ts`. Same `id`, `label`, `type`, `values[]` structure with `input` JSON strings. Tested by `tsc --noEmit` — type system enforces compatibility.
- Detection: If FilterSheet renders empty drawer despite results having productFilters, log `productFilters` server-side and inspect `id` prefixes. Expect `filter.v.option.size`, `filter.p.m.custom.color`, `filter.p.vendor`, `filter.v.price` patterns.

**R-02: Cursor pagination "fetch first N" pattern wastes bandwidth.**
- Likelihood: HIGH (this IS the chosen pattern, accepted)
- Impact: At limit=240, every "Show more" click re-fetches 240 products. Storefront API has rate limits.
- Mitigation: Default page size 24, increment 24. Cap at 250 (Storefront `first` max). Most users won't paginate past 2-3 clicks. If we hit rate limits in production, switch to `endCursor`-based pagination — would require server action `loadMoreSearchResults(cursor)` and client state. Out of scope here.
- Detection: Vercel logs / Storefront API dashboard quota. PostHog event `search_load_more` count vs Storefront API call count.

**R-03: Locale-scoped sort behavior — `created-desc` silently degrades.**
- Likelihood: MEDIUM
- Impact: User selects "Newest" on /search expecting newest products; gets relevance order. Confusing.
- Mitigation: Documented in assumptions. Acceptable for --auto mode. Follow-up: add `hideNewest?: boolean` prop to `SortSelect` to hide on /search, OR map `created-desc` to `RELEVANCE` + `reverse=true` (semantically wrong but visually distinct). Neither in scope.
- Detection: User feedback / PostHog event tracking.

**R-04: Two-call pattern in `searchProducts` doubles Storefront load.**
- Likelihood: HIGH (deliberate)
- Impact: Every /search render with filters does 2 Storefront calls (defs + actual). For users without filters: 1 call.
- Mitigation: Skip the defs call when `searchParams` has no filter keys (only `q`, `sort`, `limit` present). Storefront client may dedupe identical calls server-side.
- Detection: Add `console.time('searchProducts')` during dev to measure.
- Optimization (future): collapse to single call — pull `productFilters` from the same response we use for products. Reason for two-call: filter input JSON for the URL slugs needs to be looked up BEFORE the productFilters request runs (chicken-and-egg). This is exactly how `getCollection` solves it. Single-call would require a different filter encoding (raw ProductFilter JSON in URL) — bigger refactor.

**R-05: `__typename` runtime narrowing for `SearchResultItem` union.**
- Likelihood: LOW
- Impact: If we forget to filter `__typename === 'Product'`, the `Product` cast lies and `ProductCardSPP` crashes on Article/Page nodes.
- Mitigation: `types: [PRODUCT]` GraphQL arg already filters server-side. Runtime `.filter((e) => e.node.__typename === 'Product')` is a belt-and-braces guard. Done in `searchProducts` helper.
- Detection: Grid renders blank cards or throws hydration errors in console.

**R-06: `LoadMore` tight-couples to `?limit` URL param — collision risk.**
- Likelihood: VERY LOW
- Impact: If a productFilter ever has the slug `limit`, the URL param parser would try to map it, but `searchProducts` skips `key === 'limit'` explicitly. Safe.
- Mitigation: Confirmed in `searchProducts` filter loop: `if (key === 'q' || key === 'sort' || key === 'limit') continue;`. Same protection as collections.

**R-07: Server-side `productFilters` may include filter IDs that `CollectionFilters` component doesn't recognize.**
- Likelihood: LOW
- Impact: `CollectionFilters.tsx` has a hardcoded label map (lines 25–33) for `filter.p.m.custom.{color,size,gender,category,brand,material,pidkladka,kabluk}` and `filter.p.vendor`. If search returns a filter with id outside this map (e.g. `filter.v.option.season`), it falls through to a default branch (likely "ignored").
- Mitigation: Reuse, don't fork. If a filter doesn't render, that's an existing collection-module gap. File follow-up.
- Detection: Visual diff between FilterSheet on /man/krosivky and /search?q=кросівки — if /search shows fewer filter sections, log unmapped IDs.

**R-08: i18n key `Search.totalResults` collides with `Search.results` (popup).**
- Likelihood: NONE
- Mitigation: Different keys. Both retained. Popup uses `results`, page uses `totalResults`. Same plural pattern. Could consolidate to one key in cleanup.

</risks>
