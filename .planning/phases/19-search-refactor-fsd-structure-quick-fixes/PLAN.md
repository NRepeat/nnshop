---
phase: 19-search-refactor-fsd-structure-quick-fixes
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/features/search/lib/queries.ts
  - src/features/search/api/predictive-search.ts
  - src/features/search/model/use-predictive-search.ts
  - src/features/search/ui/SearchTrigger.tsx
  - src/features/search/ui/SearchDialog.tsx
  - src/features/search/ui/SearchResultsGrid.tsx
  - src/features/search/ui/SearchSkeleton.tsx
  - src/features/search/ui/SearchEmpty.tsx
  - src/features/search/index.ts
  - app/api/predictive-search/route.ts
  - app/[locale]/(frontend)/search/page.tsx
  - src/features/header/search/ui/search-client.tsx
  - src/features/header/search/ui/search-session.tsx
autonomous: true
requirements:
  - SEARCH-FSD-01
  - SEARCH-DISCOUNT-FIX
  - SEARCH-LAYOUT-CONSISTENCY
  - SEARCH-MOBILE-HEADER
  - SEARCH-GQL-UNIFY

must_haves:
  truths:
    - "Search popup displays znizka (custom) discount price identically to /search page (sale price + strikethrough original)"
    - "Search popup grid and /search page grid render visually identical product cards (both via ProductCardSPP)"
    - "On viewport <640px (Tailwind sm), the popup header does NOT overflow horizontally; the 'Search' text button is hidden, only the X close icon remains"
    - "Pressing Enter in popup input still navigates to /search?q={query} on mobile (since text submit button is hidden)"
    - "GraphQL PREDICTIVE_SEARCH_QUERY exists in exactly one file (src/features/search/lib/queries.ts) and is imported by both API route and page"
    - "Existing header consumer (Header widget) renders new SearchTrigger without behavior regression"
    - "TypeScript passes: npx tsc --noEmit -p tsconfig.json exits 0"
  artifacts:
    - path: "src/features/search/lib/queries.ts"
      provides: "Single PREDICTIVE_SEARCH_QUERY GraphQL doc + SEARCHABLE_FIELDS constant + DEFAULT_LIMIT constant"
      exports: ["PREDICTIVE_SEARCH_QUERY", "SEARCHABLE_FIELDS", "DEFAULT_PREDICTIVE_LIMIT"]
    - path: "src/features/search/api/predictive-search.ts"
      provides: "Server-side fetch helper calling storefrontClient.request, used by route + page"
      exports: ["predictiveSearch"]
    - path: "src/features/search/model/use-predictive-search.ts"
      provides: "Client hook with debounce + AbortController returning {query, setQuery, results, loading}"
      exports: ["usePredictiveSearch"]
    - path: "src/features/search/ui/SearchTrigger.tsx"
      provides: "Icon-only trigger button that opens SearchDialog"
      exports: ["SearchTrigger"]
    - path: "src/features/search/ui/SearchDialog.tsx"
      provides: "Portal-rendered popup container with motion + click-outside + Esc"
      exports: ["SearchDialog"]
    - path: "src/features/search/ui/SearchResultsGrid.tsx"
      provides: "Shared responsive grid rendering ProductCardSPP cards (used by popup AND page)"
      exports: ["SearchResultsGrid"]
    - path: "src/features/search/ui/SearchSkeleton.tsx"
      provides: "Loading skeleton grid shared by popup + page"
      exports: ["SearchSkeleton"]
    - path: "src/features/search/ui/SearchEmpty.tsx"
      provides: "Empty/no-results state shared by popup + page"
      exports: ["SearchEmpty"]
    - path: "src/features/search/index.ts"
      provides: "Barrel exports"
      exports: ["SearchTrigger", "SearchDialog", "SearchResultsGrid", "SearchSkeleton", "SearchEmpty", "predictiveSearch"]
  key_links:
    - from: "app/api/predictive-search/route.ts"
      to: "src/features/search/api/predictive-search.ts"
      via: "import { predictiveSearch } from '@features/search/api/predictive-search'"
      pattern: "from ['\"]@features/search"
    - from: "app/[locale]/(frontend)/search/page.tsx"
      to: "src/features/search/api/predictive-search.ts"
      via: "import { predictiveSearch } from '@features/search'"
      pattern: "from ['\"]@features/search"
    - from: "src/features/search/api/predictive-search.ts"
      to: "src/features/search/lib/queries.ts"
      via: "import { PREDICTIVE_SEARCH_QUERY, SEARCHABLE_FIELDS, DEFAULT_PREDICTIVE_LIMIT }"
      pattern: "PREDICTIVE_SEARCH_QUERY"
    - from: "src/widgets/header (or wherever SearchClient is imported)"
      to: "src/features/search/ui/SearchTrigger.tsx"
      via: "import { SearchTrigger } from '@features/search'"
      pattern: "SearchTrigger"
    - from: "src/features/search/ui/SearchResultsGrid.tsx"
      to: "@entities/product/ui/ProductCardSPP"
      via: "ProductCardSPP renders znizka discount via metafields plural"
      pattern: "ProductCardSPP"
---

## Goal

Restructure the search code into a single FSD feature module at `src/features/search/` so that one GraphQL query, one fetch helper, and one set of UI primitives (grid, skeleton, empty) are shared between the header popup (`SearchClient`) and the dedicated `/search` page. As a side effect of consolidation, the popup discount-price bug (popup uses `ProductCard` which reads `product.metafield` singular while API returns `metafields` plural array — discount silently drops) is fixed by switching the popup to `ProductCardSPP` (already handles both shapes). The popup mobile header is also made responsive so it no longer overflows on viewports below 640px. This is "Phase A" — pure structural + quick-fix work; no cmdk, no filters, no pagination, no UX overhaul.

## Assumptions (--auto mode, no user questions)

- **A-01:** Popup grid will switch to `ProductCardSPP` (matching `/search` page). Rationale: SPP variant already supports `metafields` plural, fixes discount; visual consistency between popup + page is an explicit goal of this phase.
- **A-02:** Mobile breakpoint for hiding the text "Search" button is `sm` (640px). Below `sm`: only X close icon visible; Enter submits. At/above `sm`: both X and "Search" text button visible.
- **A-03:** Predictive limit stays at `10` (constant `DEFAULT_PREDICTIVE_LIMIT = 10`). Out of scope to change Shopify limits.
- **A-04:** `search-session.tsx` will be deleted only if zero references found via grep across `app/`, `src/`. If any reference exists, it stays untouched and we add a TODO.
- **A-05:** Existing path aliases `@features/*`, `@entities/*`, `@shared/*` are already in `tsconfig.json` (confirmed in handoff). New module uses `@features/search`.
- **A-06:** New `SearchTrigger` keeps the exact prop signature of old `SearchClient` (`{ className?: string }`) so the header import is a one-line rename, not a refactor.
- **A-07:** Old `src/features/header/search/ui/search-client.tsx` is **deleted** after header consumer is updated. We do not keep a re-export shim — clean rename, single PR.
- **A-08:** `DEFAULT_PREDICTIVE_LIMIT`, `SEARCHABLE_FIELDS`, and `PREDICTIVE_SEARCH_QUERY` live in `lib/queries.ts`. The fetch helper accepts `limit`, `searchableFields`, `locale` overrides but defaults from these constants.
- **A-09:** `predictiveSearch()` helper signature: `predictiveSearch({ query, locale, limit?, searchableFields? }): Promise<PredictiveSearchQuery['predictiveSearch']>`. Throws on error (caller handles).
- **A-10:** `SearchResultsGrid` accepts `products: Product[]` and an optional `onProductClick?: () => void` (popup uses it to close dialog; page passes nothing). Locale-aware `Link` from `@shared/i18n/navigation` is used inside the grid.
- **A-11:** Hook `usePredictiveSearch` returns `{ query, setQuery, debouncedQuery, results, loading }`. Internally uses `useDebounce(query, 500)` (preserves current 500 ms behavior) and aborts in-flight fetches on input change/unmount.
- **A-12:** Skeleton column counts match popup's existing `grid-cols-2 md:grid-cols-4`. Page already uses `grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4` — `SearchResultsGrid` will adopt the page's denser breakpoint set as the unified default; popup will inherit it. (Layout consistency is an explicit goal.)
- **A-13:** No new tests added in this phase. Verification is type-check + manual smoke test (popup discount visible, mobile header doesn't overflow, page still works).

## File-level task breakdown

### Task 1 — Scaffold FSD module: queries + API helper + hook

<task type="auto" tdd="false">
  <name>Task 1: Create lib/queries.ts, api/predictive-search.ts, model/use-predictive-search.ts</name>
  <files>
    src/features/search/lib/queries.ts (CREATE),
    src/features/search/api/predictive-search.ts (CREATE),
    src/features/search/model/use-predictive-search.ts (CREATE)
  </files>
  <action>
    **`src/features/search/lib/queries.ts`** — copy the GraphQL doc from `app/api/predictive-search/route.ts` lines 14–100 verbatim (it is the more complete one — has the same fields as the page version). Export:
    ```ts
    export const PREDICTIVE_SEARCH_QUERY = `#graphql ...`;
    export const DEFAULT_PREDICTIVE_LIMIT = 10;
    export const SEARCHABLE_FIELDS = [
      'TITLE','VARIANTS_TITLE','VARIANTS_SKU','VENDOR','PRODUCT_TYPE'
    ] as const;
    ```

    **`src/features/search/api/predictive-search.ts`** — server helper. Mirror logic at `app/api/predictive-search/route.ts:109–128` but as a pure async function (no NextResponse). Signature:
    ```ts
    import { storefrontClient } from '@shared/lib/shopify/client';
    import {
      PredictiveSearchQuery,
      PredictiveSearchQueryVariables,
    } from '@shared/lib/shopify/types/storefront.generated';
    import {
      PredictiveSearchLimitScope,
      SearchableField,
    } from '@shared/lib/shopify/types/storefront.types';
    import { StorefrontLanguageCode } from '@shared/lib/clients/types';
    import {
      PREDICTIVE_SEARCH_QUERY,
      DEFAULT_PREDICTIVE_LIMIT,
      SEARCHABLE_FIELDS,
    } from '../lib/queries';

    export async function predictiveSearch(args: {
      query: string;
      locale?: string;
      limit?: number;
      searchableFields?: readonly SearchableField[];
    }) {
      const { query, locale, limit, searchableFields } = args;
      const response = await storefrontClient.request<
        PredictiveSearchQuery,
        PredictiveSearchQueryVariables
      >({
        query: PREDICTIVE_SEARCH_QUERY,
        language: (locale?.toUpperCase() as StorefrontLanguageCode) || 'UK',
        variables: {
          limit: limit ?? DEFAULT_PREDICTIVE_LIMIT,
          limitScope: 'EACH' as PredictiveSearchLimitScope,
          query,
          searchableFields:
            (searchableFields as SearchableField[]) ??
            (SEARCHABLE_FIELDS as unknown as SearchableField[]),
        },
      });
      return response.predictiveSearch;
    }
    ```

    **`src/features/search/model/use-predictive-search.ts`** — extract from `search-client.tsx:30–98`. Signature:
    ```ts
    'use client';
    import { useState, useEffect } from 'react';
    import { useDebounce } from 'use-debounce';
    import { useLocale } from 'next-intl';
    import { PredictiveSearchQuery } from '@shared/lib/shopify/types/storefront.generated';

    type PredictiveSearchResult = NonNullable<PredictiveSearchQuery['predictiveSearch']>;

    export function usePredictiveSearch() {
      const locale = useLocale();
      const [query, setQuery] = useState('');
      const [debouncedQuery] = useDebounce(query, 500);
      const [results, setResults] = useState<PredictiveSearchResult | null>(null);
      const [loading, setLoading] = useState(false);

      useEffect(() => {
        if (debouncedQuery.length < 1) { setResults(null); return; }
        const controller = new AbortController();
        setLoading(true);
        fetch('/api/predictive-search', {
          method: 'POST',
          body: JSON.stringify({ query: debouncedQuery, locale }),
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
        })
          .then((r) => r.json())
          .then((data) => { setResults(data); setLoading(false); })
          .catch((err) => { if (err.name !== 'AbortError') setLoading(false); });
        return () => controller.abort();
      }, [debouncedQuery, locale]);

      return { query, setQuery, debouncedQuery, results, loading };
    }
    ```
    Behavior MUST match existing popup exactly (500 ms debounce, abort-on-change, locale in body). Per A-11.
  </action>
  <verify>
    <automated>npx tsc --noEmit -p tsconfig.json</automated>
  </verify>
  <done>
    Three files exist, all exports present, tsc clean. No runtime wiring yet — these files are imported by Task 2/3.
  </done>
</task>

### Task 2 — Scaffold FSD UI primitives + barrel

<task type="auto" tdd="false">
  <name>Task 2: Create SearchResultsGrid, SearchSkeleton, SearchEmpty, SearchTrigger, SearchDialog, index.ts</name>
  <files>
    src/features/search/ui/SearchResultsGrid.tsx (CREATE),
    src/features/search/ui/SearchSkeleton.tsx (CREATE),
    src/features/search/ui/SearchEmpty.tsx (CREATE),
    src/features/search/ui/SearchTrigger.tsx (CREATE),
    src/features/search/ui/SearchDialog.tsx (CREATE),
    src/features/search/index.ts (CREATE)
  </files>
  <action>
    **`SearchResultsGrid.tsx`** — shared grid. Adopts the page's column counts (per A-12):
    ```tsx
    'use client';
    import { Link } from '@shared/i18n/navigation';
    import { ProductCardSPP } from '@entities/product/ui/ProductCardSPP';
    import { Product } from '@shared/lib/shopify/types/storefront.types';

    export function SearchResultsGrid({
      products, onProductClick,
    }: { products: Product[]; onProductClick?: () => void }) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-10">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.handle}`}
              scroll
              onClick={onProductClick}
              className="group flex flex-col gap-2"
            >
              <ProductCardSPP product={p} />
            </Link>
          ))}
        </div>
      );
    }
    ```
    NOTE: page currently passes `product` only (no Link wrapper). After this refactor the page wraps too — fine, ProductCardSPP works inside Link (verify in manual smoke). If `ProductCardSPP` already wraps its own Link internally, drop the outer Link and instead pass `onClick`/router.push from grid. **Implementor: read `@entities/product/ui/ProductCardSPP` first, lines around its root element. If it already navigates internally, do NOT double-wrap.**

    **`SearchSkeleton.tsx`** — extract from `search-client.tsx:163–177` and unify with `page.tsx:249–266`:
    ```tsx
    import { Skeleton } from '@shared/ui/skeleton';
    export function SearchSkeleton({ count = 8 }: { count?: number }) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="relative aspect-[3/4] w-full" />
              <div className="flex flex-col gap-2 mt-2">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-2/5" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    ```

    **`SearchEmpty.tsx`** — extract from `search-client.tsx:225–233` and `page.tsx:158–166`:
    ```tsx
    import { SearchIcon } from 'lucide-react';
    import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@shared/ui/empty';
    import { useTranslations } from 'next-intl';

    export function SearchEmpty() {
      const t = useTranslations('Search');
      return (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><SearchIcon /></EmptyMedia>
            <EmptyTitle>{t('noResults')}</EmptyTitle>
            <EmptyDescription>{t('tryAgain')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      );
    }
    ```
    **Server variant note:** the `/search` page is a server component and currently uses `getTranslations`. Either (a) keep `SearchEmpty` as a client component (`'use client'` directive) — works fine inside server pages, or (b) accept translated strings as props. **Pick (a)** for simplicity unless `useTranslations` fails in this context. If it does, switch to prop-passing.

    **`SearchTrigger.tsx`** — extract trigger from `search-client.tsx:102–110`. Owns dialog open state OR exposes it via context. Simpler: keep the open state local and render `<SearchDialog>` as a sibling controlled by the same state. So `SearchTrigger` actually owns the whole popup lifecycle (button + dialog):
    ```tsx
    'use client';
    import { useState } from 'react';
    import { Button } from '@shared/ui/button';
    import { Search } from 'lucide-react';
    import { useTranslations } from 'next-intl';
    import { SearchDialog } from './SearchDialog';

    export function SearchTrigger({ className }: { className?: string }) {
      const t = useTranslations('Search');
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button
            className={className}
            variant="ghost"
            size="icon"
            aria-label={t('title')}
            onClick={() => setIsOpen(true)}
          >
            <Search className="w-5 h-5" />
          </Button>
          <SearchDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
      );
    }
    ```

    **`SearchDialog.tsx`** — refactor from `search-client.tsx:112–241`. Consumes `usePredictiveSearch`, renders `SearchResultsGrid`, `SearchSkeleton`, `SearchEmpty`. Mobile header fix per A-02:
    - The submit "Search" button gets className `hidden sm:inline-flex`
    - The X close button stays visible at all breakpoints
    - The bar gap reduces on mobile: `gap-2 sm:gap-4`
    - Container padding tightens on mobile: keep `px-4`
    Header row code (replaces lines 134–159 of old file):
    ```tsx
    <div className="h-[80px] flex items-center gap-2 sm:gap-4 border-b px-4">
      <Search className="w-5 h-5 shrink-0" />
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
        placeholder={t('placeholder')}
        className="flex-1 min-w-0 bg-transparent border-none outline-none text-base sm:text-xl"
      />
      <Button
        variant="ghost"
        size="icon"
        aria-label="Close search"
        onClick={onClose}
        className="shrink-0"
      >
        <X className="w-6 h-6" />
      </Button>
      <Button onClick={handleSearch} className="hidden sm:inline-flex">
        {t('searchButton')}
      </Button>
    </div>
    ```
    Note `min-w-0` on the input — required so flex shrink works correctly with the icon + buttons. Note `shrink-0` on icon and X button.

    Replace popup grid section (old lines 180–219) with:
    ```tsx
    {!loading && results && results.products && results.products.length > 0 && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 px-4">
        <div className="flex justify-between items-center mb-6 text-sm text-gray-500">
          <span>{t.rich('results', { count: results.products.length })}</span>
          <Link
            href={`/search?q=${encodeURIComponent(debouncedQuery)}`}
            className="border-b border-transparent hover:border-current transition-colors"
            onClick={onClose}
          >
            {t('viewAll')}
          </Link>
        </div>
        <SearchResultsGrid
          products={results.products as Product[]}
          onProductClick={onClose}
        />
      </motion.div>
    )}
    ```
    Replace skeleton block (old 162–179) with `<div className="py-8"><SearchSkeleton /></div>`. Replace empty block (old 221–234) with `<SearchEmpty />`.

    Keep all framer-motion, createPortal, click-outside, body scroll-lock logic intact from the old file (lines 50–72, 112–131, 236–241).

    **`index.ts`** — barrel:
    ```ts
    export { SearchTrigger } from './ui/SearchTrigger';
    export { SearchDialog } from './ui/SearchDialog';
    export { SearchResultsGrid } from './ui/SearchResultsGrid';
    export { SearchSkeleton } from './ui/SearchSkeleton';
    export { SearchEmpty } from './ui/SearchEmpty';
    export { predictiveSearch } from './api/predictive-search';
    ```
  </action>
  <verify>
    <automated>npx tsc --noEmit -p tsconfig.json</automated>
  </verify>
  <done>
    All six UI files + barrel exist, tsc clean, no runtime use yet. Old `search-client.tsx` still untouched.
  </done>
</task>

### Task 3 — Wire consumers + delete legacy + smoke test

<task type="auto" tdd="false">
  <name>Task 3: Update API route, search page, header import; delete legacy files</name>
  <files>
    app/api/predictive-search/route.ts (MODIFY),
    app/[locale]/(frontend)/search/page.tsx (MODIFY),
    src/features/header/search/ui/search-client.tsx (DELETE after consumer migration),
    src/features/header/search/ui/search-session.tsx (DELETE if unreferenced)
  </files>
  <action>
    **Step 3a — Update `app/api/predictive-search/route.ts`:**
    Replace the entire file with thin wrapper:
    ```ts
    import { NextRequest, NextResponse } from 'next/server';
    import { predictiveSearch } from '@features/search/api/predictive-search';

    export async function POST(req: NextRequest) {
      const { query, locale } = await req.json();
      if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
      }
      try {
        const result = await predictiveSearch({ query, locale });
        return NextResponse.json(result);
      } catch (error) {
        console.error('Error fetching predictive search results:', error);
        return NextResponse.json(
          { error: 'Internal Server Error' },
          { status: 500 },
        );
      }
    }
    ```
    Removes the duplicated GraphQL query (~90 lines deleted).

    **Step 3b — Update `app/[locale]/(frontend)/search/page.tsx`:**
    Delete the inline `PREDICTIVE_SEARCH_QUERY` (lines 35–115) and the inline storefrontClient.request (lines 175–194). Replace `SearchResultsComponent` core with:
    ```ts
    import { predictiveSearch, SearchResultsGrid, SearchEmpty, SearchSkeleton } from '@features/search';
    // (drop now-unused: storefrontClient, PredictiveSearchQuery types, Empty/EmptyHeader/etc, SearchIcon, Skeleton, PredictiveSearchLimitScope, SearchableField — verify with tsc)
    // ...
    let results;
    try {
      results = await predictiveSearch({ query, locale });
    } catch (error) {
      console.error('Error fetching search results:', error);
      return <>{pageTitle}<p>{t('errorFetchingResults')}</p></>;
    }
    if (!results || !results.products || results.products.length === 0) {
      return (
        <div className="mt-8 md:mt-8 h-fit min-h-screen">
          <div className="container">
            <div className="my-8">{pageTitle}</div>
            <SearchEmpty />
          </div>
        </div>
      );
    }
    return (
      <div className="mt-8 md:mt-8 h-fit min-h-screen">
        <div className="container">
          <div className="my-8"><h1 className="text-3xl md:text-4xl font-bold mb-2">{pageTitle}</h1></div>
          <SearchResultsGrid products={results.products as ShopifyProduct[]} />
        </div>
      </div>
    );
    ```
    Replace `SearchPageSkeleton` body with `<><Skeleton className="h-8 w-1/3 mb-4" /><SearchSkeleton /></>` OR drop the local component and use `<SearchSkeleton />` directly. Keep `generateMetadata` as-is.

    **Step 3c — Update header consumer.** First locate it:
    ```bash
    grep -rn "search-client\|SearchClient\|@features/header/search" src/ app/ --include='*.ts' --include='*.tsx'
    ```
    For each match, change the import to `import { SearchTrigger } from '@features/search'` and rename JSX `<SearchClient ... />` → `<SearchTrigger ... />`. Same prop signature (`className`), no other changes.

    **Step 3d — Check session file usage:**
    ```bash
    grep -rn "search-session\|SearchSession" src/ app/ --include='*.ts' --include='*.tsx'
    ```
    If zero matches outside the file itself, `rm src/features/header/search/ui/search-session.tsx`. Otherwise leave it and add a `// TODO(phase-19-followup): unused or migrate` comment at the top.

    **Step 3e — Delete legacy popup:**
    ```bash
    rm src/features/header/search/ui/search-client.tsx
    ```
    If the parent directory `src/features/header/search/` is now empty (or only contains an empty `ui/`), `rm -rf src/features/header/search/`.

    **Step 3f — Final type-check + manual smoke list (do not skip):**
    1. `npx tsc --noEmit -p tsconfig.json` exits 0.
    2. `grep -rn "PREDICTIVE_SEARCH_QUERY" src/ app/` returns exactly ONE file: `src/features/search/lib/queries.ts`.
    3. `grep -rn "ProductCard[^S]" src/features/search/ app/api/predictive-search/ app/\[locale\]/\(frontend\)/search/` returns zero hits (only ProductCardSPP allowed in search code).
  </action>
  <verify>
    <automated>npx tsc --noEmit -p tsconfig.json && test "$(grep -rl 'PREDICTIVE_SEARCH_QUERY' src/ app/ | wc -l | tr -d ' ')" = "1" && ! grep -rn "from '@features/header/search" src/ app/</automated>
  </verify>
  <done>
    Type-check passes. Single source of GraphQL query. Header imports SearchTrigger from new path. Legacy popup file deleted. Session file deleted if unreferenced. Manual smoke (see Verification section) passes.
  </done>
</task>

## Verification

After Task 3 completes, run dev server (`pnpm dev`) and manually verify:

### Discount fix (popup parity with page)
1. Open homepage. Click search icon in header.
2. Type a known discounted product name (a product with `custom.znizka` metafield set, e.g. one currently visibly discounted on `/search?q=...`).
3. **Expect:** popup product card shows sale price + struck-through original, identical to how it renders on the `/search?q=...` page.
4. Cross-reference: open `/search?q=<same-query>` in new tab; both grids render visually identical cards.

### Layout consistency
- Popup grid columns (640+): 2 cols at `<sm`, 2 at `sm`, 3 at `md`, 4 at `lg`. Compare side-by-side with page — should match.

### Mobile header responsive
1. DevTools → toggle device mode → set width to 375px (iPhone SE) and 320px.
2. Open search popup.
3. **Expect at 320px:** header row contains `[search icon][input][X close]` only. No "Search" text button. No horizontal overflow. Input takes remaining space.
4. **Expect at 640px+:** header row contains `[search icon][input][X close][Search button]`.
5. At 320px, type "shoes", press Enter → must navigate to `/search?q=shoes` (Enter still works since text submit is hidden).

### GraphQL unification
- `grep -rn "PREDICTIVE_SEARCH_QUERY\|predictiveSearch(" src/ app/ --include='*.ts' --include='*.tsx'` — query string literal appears in only `src/features/search/lib/queries.ts`. Calls to `predictiveSearch(` helper appear in route + page only.

### TypeScript
- `npx tsc --noEmit -p tsconfig.json` exits 0.

### No regression
- Header search trigger button still renders, click opens popup, click outside closes, Esc/X closes, body scroll lock works.
- `/search` page still renders for both locales: `/uk/search?q=test` and `/ru/search?q=test`.

## Out of scope (explicit deferral to later phases)

- **Phase B (cmdk UX overhaul):** Do NOT install `cmdk` lib. Do NOT add keyboard navigation between results. Do NOT add command-palette-style sections (recent searches, suggested categories).
- **Phase C (full search page with filters + pagination):** Do NOT add filters (vendor, price, tags). Do NOT add pagination or infinite scroll. Do NOT change the predictive limit (stays 10). Do NOT add sorting.
- No Shopify GraphQL schema changes.
- No new translations or i18n keys (reuse existing `Search` namespace).
- No analytics events.
- No tests added (acknowledged debt; tracked for follow-up).

## Risks

- **R-01 (HIGH): Header consumer import path unknown.** The handoff doesn't tell us where `<SearchClient>` is rendered. Task 3c grep is mandatory. If grep returns zero matches, the popup is unused — investigate before deleting (perhaps it's lazy-imported via string). Mitigation: do not delete `search-client.tsx` until grep confirms its consumer is migrated.
- **R-02 (MED): `ProductCardSPP` may already wrap its own Link.** Double-wrapping `<Link>` causes nested `<a>` hydration warnings. Mitigation: read `@entities/product/ui/ProductCardSPP` source before finalizing `SearchResultsGrid`. If it wraps internally, drop the outer Link and use a click handler / `useRouter().push`.
- **R-03 (MED): `ProductCardSPP` may rely on additional GraphQL fields not in the popup query.** Both queries (popup route + page) are nearly identical, but if SPP reads `seo`, `priceRange.minVariantPrice`, etc., the unified query might miss something. Mitigation: diff `ProductCardSPP` field reads against `PREDICTIVE_SEARCH_QUERY` before Task 2; add any missing leaf fields to `lib/queries.ts`.
- **R-04 (LOW): `useTranslations('Search')` inside `SearchEmpty` server-side.** If invoked in a server component context without `'use client'`, it'd fail. Mitigation: A-13 already pins `'use client'` on `SearchEmpty`. Page imports it normally (RSC can render client components).
- **R-05 (LOW): `search-session.tsx` deletion may remove an in-use file.** Grep is the gate (Task 3d). If unsure, leave it.
- **R-06 (LOW): Discount metafield namespace differs.** Plan assumes `{key: "znizka", namespace: "custom"}` (matches both existing queries). If `ProductCardSPP` looks for a different namespace, discount still won't show. Mitigation: confirm field path in `ProductCardSPP` before merging; sister-repo invariant noted in CLAUDE.md says `znizka` is the right key.
- **R-07 (LOW): Locale-specific behavior in `predictiveSearch` helper.** The helper passes `locale?.toUpperCase() as StorefrontLanguageCode || 'UK'`. Server page (`page.tsx`) currently does NOT pass locale (line 180–193 has no `language` arg) — page is implicitly UK. After refactor, page calls `predictiveSearch({ query, locale })` with locale, so RU users on `/ru/search` will now get RU results. **This is technically a behavior change but a desirable one** (matches popup behavior). Verify in manual smoke at `/ru/search?q=...`.

## Output

After completion, create `.planning/phases/19-search-refactor-fsd-structure-quick-fixes/19-01-SUMMARY.md` documenting:
- Files created (new FSD module file tree)
- Files deleted (legacy paths)
- Header consumer location (resolved from R-01 grep)
- Whether `ProductCardSPP` was double-Link-wrapped or not (resolved from R-02)
- Any GraphQL fields added beyond the original (resolved from R-03)
- Whether `search-session.tsx` was deleted or kept
- Manual smoke test results (discount visible Y/N, mobile header OK Y/N, page renders Y/N)
