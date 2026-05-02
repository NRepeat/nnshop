---
phase: 21-search-popup-cmdk-ux-overhaul
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/shared/ui/command.tsx
  - src/features/search/model/use-recent-searches.ts
  - src/features/search/ui/SearchCommandDialog.tsx
  - src/features/search/ui/SearchCommandRow.tsx
  - src/features/search/ui/SearchTrigger.tsx
  - src/features/search/index.ts
  - src/features/search/ui/SearchDialog.tsx
  - messages/uk.json
  - messages/ru.json
  - messages/en.json
autonomous: true
requirements:
  - SEARCH-21-CMDK
  - SEARCH-21-RECENT
  - SEARCH-21-BRANDS
  - SEARCH-21-SHORTCUT
  - SEARCH-21-LOADING
must_haves:
  truths:
    - "Pressing Cmd+K (or Ctrl+K) anywhere on the site opens the search popup"
    - "Pressing ESC closes the popup"
    - "Typing a query shows a Products section with compact rows (thumb + title + price), navigable via arrow keys"
    - "Selecting a product row (Enter or click) navigates to the product and adds the query to recent searches"
    - "When the input is empty and recents exist, a Recent searches section is shown (max 5)"
    - "Clicking a recent search re-runs that query"
    - "While debounced fetch is in flight, an inline loading indicator is visible next to the input"
    - "When products have distinct vendors, a Brands section shows up to 5 brand suggestions linking to /search?q=<brand>"
    - "Result count is displayed at the top of the Products section (e.g. '12 results')"
    - "Old SearchDialog.tsx is gone and no file imports it"
  artifacts:
    - path: "src/shared/ui/command.tsx"
      provides: "shadcn cmdk wrapper (Command, CommandDialog, CommandInput, CommandList, CommandGroup, CommandItem, CommandEmpty, CommandLoading, CommandSeparator)"
      contains: "CommandDialog"
    - path: "src/features/search/model/use-recent-searches.ts"
      provides: "Recent searches hook backed by localStorage (key 'nnshop:search:recent', max 5)"
      exports: ["useRecentSearches"]
    - path: "src/features/search/ui/SearchCommandDialog.tsx"
      provides: "cmdk-based command palette replacing SearchDialog"
      exports: ["SearchCommandDialog"]
    - path: "src/features/search/ui/SearchCommandRow.tsx"
      provides: "Compact product row for cmdk CommandItem"
      exports: ["SearchCommandRow"]
    - path: "src/features/search/ui/SearchTrigger.tsx"
      provides: "Trigger button + global Cmd+K listener + mounts SearchCommandDialog"
    - path: "src/features/search/index.ts"
      provides: "Feature barrel without SearchDialog export"
  key_links:
    - from: "src/features/search/ui/SearchTrigger.tsx"
      to: "src/features/search/ui/SearchCommandDialog.tsx"
      via: "open state prop + global keydown listener"
      pattern: "metaKey.*k|ctrlKey.*k"
    - from: "src/features/search/ui/SearchCommandDialog.tsx"
      to: "src/features/search/model/use-predictive-search.ts"
      via: "usePredictiveSearch() hook"
      pattern: "usePredictiveSearch"
    - from: "src/features/search/ui/SearchCommandDialog.tsx"
      to: "src/features/search/model/use-recent-searches.ts"
      via: "useRecentSearches() hook called on item select"
      pattern: "addRecent"
    - from: "src/features/search/ui/SearchCommandDialog.tsx"
      to: "@shared/i18n/navigation"
      via: "useRouter().push(`/product/${handle}`) on row select; Link for brand items"
      pattern: "useRouter|from '@shared/i18n/navigation'"
---

<objective>
Replace the legacy `SearchDialog` (framer-motion + portal + native input + manual click-outside/ESC plumbing) with a docs-site-style command palette built on shadcn's `command.tsx` (cmdk). The new popup has sectioned results (Products / Brands / Recent), full keyboard navigation (arrows + Enter), localStorage-backed recent searches (max 5), inline loading indicator in the input, result count, ESC to close, and a global Cmd+K / Ctrl+K shortcut to open.

Purpose: align search UX with modern command-palette conventions (DocSearch / Linear / Vercel), reduce custom code in `SearchDialog.tsx`, and add discoverability features (recents, brand suggestions, keyboard shortcut) without touching the `/search` page (Phase 20 territory).

Output: shadcn `command.tsx` installed, `SearchCommandDialog` and `SearchCommandRow` created, `useRecentSearches` hook added, `SearchTrigger` upgraded with Cmd+K binding, old `SearchDialog.tsx` deleted, translations added to uk/ru/en.
</objective>

## Goal

Working cmdk command palette replacing `SearchDialog` for the storefront search popup, with sectioned Products / Brands / Recent results, keyboard navigation, recent-search persistence, and Cmd+K shortcut — without breaking the `/search` page or its dependencies.

## Assumptions

These defaults were selected automatically (--auto mode). All are documented for the executor:

- **A-01 (Brands strategy):** Derive brands client-side from `Set(results.products.map(p => p.vendor)).slice(0, 5)`. Each `CommandItem` for a brand routes to `/search?q=<brand>` (NOT `/brand/<slug>`) to keep behavior identical regardless of whether a vendor has a dedicated collection page. Brands section only renders when query is non-empty AND at least one product result has a vendor. No additional GraphQL changes (do NOT add `collections` or `queries` to predictive search query — out of scope).
- **A-02 (Recents storage):** localStorage key `nnshop:search:recent`, value JSON array of strings, max 5 entries, FIFO eviction (newest at index 0, dedupe case-insensitive). SSR-safe via `typeof window !== 'undefined'` guard inside hook init.
- **A-03 (Recents trigger):** `addRecent(debouncedQuery)` is called only when the user actually navigates somewhere from the popup — i.e. on `CommandItem.onSelect` for a product, brand, or "view all". NOT called on mere typing. Empty/whitespace queries ignored.
- **A-04 (Cmd+K binding):** Listener attached in `SearchTrigger` via `useEffect` on `document.keydown`. Intercepts `(e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'` regardless of focused element, calls `e.preventDefault()` then opens dialog. No customization for other shortcuts (`/`, `s`, etc.).
- **A-05 (Compact row layout vs grid):** Inside the popup we use compact list rows (40px thumbnail + title + price, single line) inside `CommandItem`, NOT `ProductCardSPP`. Reason: cmdk arrow-nav treats each `CommandItem` as one option; full cards inside are too tall to scan and require nested focusable elements that confuse cmdk's roving tabindex. Grid layout remains in use on `/search` page via `SearchResultsGrid` (untouched).
- **A-06 (Result count):** Shown in the `CommandGroup` heading area as `{count} results` (translated via `Search.results` ICU plural already present in messages). Reflects `results.products.length` of the current debounced query (predictive search caps results — that is the displayed number, not a global total; that's acceptable for a popup).
- **A-07 (Loading indicator):** A small lucide `Loader2` spinner is rendered inside `CommandInput`'s container (right side) whenever `loading || (query !== debouncedQuery && query.length > 0)`. This avoids visual noise of `<CommandLoading>` plus keeps the input UX clean. `<CommandLoading>` is also rendered (cmdk's a11y slot) so screen readers announce loading.
- **A-08 (Empty state):** When `debouncedQuery.length > 0 && results?.products?.length === 0 && !loading && query === debouncedQuery`, render `<CommandEmpty>` with translated `Search.noResults` + `Search.tryAgain`.
- **A-09 (Recent visibility):** Recent section renders when `query.trim() === '' && recents.length > 0`. A "Clear" affordance (`Search.clearRecent` translation) is rendered as the last `CommandItem` in the Recent group.
- **A-10 (View All):** When products are shown, append a final non-product `CommandItem` "View all results" routing to `/search?q=<debouncedQuery>` — replaces the old corner Link. Adds `debouncedQuery` to recents.
- **A-11 (Translations namespace):** New keys live under existing `Search` namespace. RU / EN translated by Claude (RU mirrors UA tone; EN is plain English). Keys added: `recentSearches`, `clearRecent`, `noRecentSearches`, `brands`, `viewAllResults`, `products`, `cmdK`. (`placeholder`, `viewAll`, `searchButton`, `noResults`, `tryAgain`, `loading`, `results` already exist.)
- **A-12 (Focus on open):** `CommandDialog` (built on shadcn Dialog) auto-focuses `CommandInput`. No additional `autoFocus` plumbing needed.
- **A-13 (z-index/layering):** `CommandDialog` uses Radix Dialog under the hood — overlay z-index inherited from existing `dialog.tsx`. Existing header `z-50` is below Radix overlay so no conflict. No custom z stacking required.
- **A-14 (Animation):** Use cmdk default animations (Radix Dialog data-state transitions). No framer-motion in the new popup. This intentionally drops the `top-[120px]` slide-from-header look in favor of standard centered modal — accepted UX trade-off for consistency with shadcn dialogs already used elsewhere.

## File-level task breakdown

<tasks>

<task type="auto">
  <name>Task 0: Install shadcn command primitive</name>
  <files>src/shared/ui/command.tsx</files>
  <action>
Run `npx shadcn@latest add command --yes` from project root. This writes `src/shared/ui/command.tsx` (alias resolves via `components.json` aliases.ui = `@/shared/ui`). It also pulls `cmdk@^1` into `package.json`.

If shadcn prompts to overwrite `dialog.tsx`, decline (answer "no" to any overwrite prompt — `--yes` accepts new files only; if the CLI insists, run with `--overwrite` flag set to false explicitly, or run interactively in a follow-up). Verify after install:
- `src/shared/ui/command.tsx` exists and exports: `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandShortcut`, `CommandSeparator`, `CommandLoading` (cmdk re-export — if missing from shadcn template, add `export { Command as CommandLoading } from 'cmdk'` style re-export pointing to `Command.Loading`).
- `package.json` now lists `cmdk` under dependencies.
- `dialog.tsx` is unchanged (`git diff src/shared/ui/dialog.tsx` empty).

Per A-13, no extra styling. Per A-14, no framer-motion edits.
  </action>
  <verify>
    <automated>test -f /Users/mnmac/Development/nnshop/src/shared/ui/command.tsx && grep -q "CommandDialog" /Users/mnmac/Development/nnshop/src/shared/ui/command.tsx && grep -q '"cmdk"' /Users/mnmac/Development/nnshop/package.json</automated>
  </verify>
  <done>`command.tsx` present with all expected exports; `cmdk` in `package.json`; `dialog.tsx` untouched.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 1: Create useRecentSearches hook</name>
  <files>src/features/search/model/use-recent-searches.ts</files>
  <behavior>
    - Returns `{ recents: string[], addRecent(q: string): void, clearRecents(): void, removeRecent(q: string): void }`.
    - On mount, reads `localStorage.getItem('nnshop:search:recent')` inside `useEffect` (NOT during initial useState — SSR-safe).
    - `addRecent(q)`: trims input; if empty, no-op. Removes any existing entry matching case-insensitively, prepends new value, slices to max 5. Persists to localStorage. Updates state.
    - `clearRecents()`: removes the localStorage key, sets state to `[]`.
    - `removeRecent(q)`: filters out exact-match entry, persists.
    - All localStorage access wrapped in `typeof window !== 'undefined'` and `try/catch` (private mode / quota errors swallowed).
  </behavior>
  <action>
Create `'use client'` hook at `src/features/search/model/use-recent-searches.ts` per A-02 / A-03:

```ts
'use client';
import { useCallback, useEffect, useState } from 'react';

const KEY = 'nnshop:search:recent';
const MAX = 5;

function read(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string').slice(0, MAX) : [];
  } catch { return []; }
}

function write(values: string[]) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(KEY, JSON.stringify(values)); } catch { /* swallow */ }
}

export function useRecentSearches() {
  const [recents, setRecents] = useState<string[]>([]);
  useEffect(() => { setRecents(read()); }, []);

  const addRecent = useCallback((raw: string) => {
    const q = raw.trim();
    if (!q) return;
    setRecents((curr) => {
      const next = [q, ...curr.filter((v) => v.toLowerCase() !== q.toLowerCase())].slice(0, MAX);
      write(next);
      return next;
    });
  }, []);

  const removeRecent = useCallback((q: string) => {
    setRecents((curr) => {
      const next = curr.filter((v) => v !== q);
      write(next);
      return next;
    });
  }, []);

  const clearRecents = useCallback(() => {
    if (typeof window !== 'undefined') {
      try { window.localStorage.removeItem(KEY); } catch { /* swallow */ }
    }
    setRecents([]);
  }, []);

  return { recents, addRecent, removeRecent, clearRecents };
}
```

Do NOT hydrate from localStorage during initial `useState` — that would mismatch SSR. The first paint shows `[]`, then the effect populates. This is fine because the popup is client-only and initially closed.
  </action>
  <verify>
    <automated>test -f /Users/mnmac/Development/nnshop/src/features/search/model/use-recent-searches.ts && grep -q "nnshop:search:recent" /Users/mnmac/Development/nnshop/src/features/search/model/use-recent-searches.ts && grep -q "useRecentSearches" /Users/mnmac/Development/nnshop/src/features/search/model/use-recent-searches.ts && cd /Users/mnmac/Development/nnshop && npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "use-recent-searches" | head -5; test $? -ne 0</automated>
  </verify>
  <done>Hook file exists; tsc has no errors mentioning `use-recent-searches.ts`; localStorage key is exactly `nnshop:search:recent`; max 5 enforced.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Create SearchCommandRow compact product row</name>
  <files>src/features/search/ui/SearchCommandRow.tsx</files>
  <behavior>
    - Renders compact product row inside a `CommandItem`: 40px square thumbnail (next/image), product title (truncate), price (with sale strikethrough if `znizka`/`compareAtPrice`).
    - No `ProductCardSPP` (per A-05).
    - `CommandItem`'s `onSelect` invokes a passed `onSelect(product)` callback (parent handles routing + addRecent).
    - The `value` prop on `CommandItem` set to `${product.title}-${product.id}` so cmdk's built-in fuzzy ranking uses title (not handle).
  </behavior>
  <action>
Create `'use client'` component. Read existing `Product` type from `@shared/lib/shopify/types/storefront.types` (same import used by `SearchDialog.tsx`). Read existing price helpers — check `src/features/product-card-spp` or `src/shared/lib/shopify` for a `formatPrice` util; if none, fall back to inline `new Intl.NumberFormat(locale, { style: 'currency', currency: amount.currencyCode }).format(Number(amount.amount))`.

Image: use `next/image` from `next/image`, src = `product.featuredImage?.url || product.images?.edges?.[0]?.node?.url`, width/height 40, alt = `product.featuredImage?.altText || product.title`.

Signature:
```ts
type Props = {
  product: Product;
  onSelect: (product: Product) => void;
};
```

Render:
```tsx
<CommandItem value={`${product.title}-${product.id}`} onSelect={() => onSelect(product)} className="flex items-center gap-3 cursor-pointer">
  <div className="relative w-10 h-10 shrink-0 bg-neutral-100 overflow-hidden rounded">
    {imgUrl && <Image src={imgUrl} alt={alt} fill sizes="40px" className="object-cover" />}
  </div>
  <span className="flex-1 truncate text-sm">{product.title}</span>
  <span className="text-sm tabular-nums shrink-0">{priceLabel}</span>
</CommandItem>
```

If `compareAtPriceRange.minVariantPrice.amount > priceRange.minVariantPrice.amount`, render strikethrough compare price before the active price (`<span className="line-through text-neutral-400 mr-1">{compareLabel}</span>`).

Do NOT add internal Link — cmdk's `onSelect` is the canonical activation hook (handles Enter + click + arrow+Enter). Routing happens in parent.
  </action>
  <verify>
    <automated>test -f /Users/mnmac/Development/nnshop/src/features/search/ui/SearchCommandRow.tsx && grep -q "CommandItem" /Users/mnmac/Development/nnshop/src/features/search/ui/SearchCommandRow.tsx && cd /Users/mnmac/Development/nnshop && npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "SearchCommandRow" | head -5; test $? -ne 0</automated>
  </verify>
  <done>Component renders compact row using `CommandItem`, no `ProductCardSPP`, tsc clean for this file.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Create SearchCommandDialog (replaces SearchDialog)</name>
  <files>src/features/search/ui/SearchCommandDialog.tsx</files>
  <behavior>
    - Props: `{ open: boolean; onOpenChange: (open: boolean) => void }`.
    - Wraps `<CommandDialog open={open} onOpenChange={onOpenChange}>`.
    - Uses `usePredictiveSearch()` for results.
    - Uses `useRecentSearches()` for recents.
    - Sections rendered in this order:
      1. **Recent searches** — only if `query.trim() === '' && recents.length > 0`. Heading = `t('recentSearches')`. Each recent is a `CommandItem` with `onSelect` that calls `setQuery(value)`. Last item is `t('clearRecent')` calling `clearRecents()`.
      2. **Loading state** — `<CommandLoading>` (a11y) when `loading || query !== debouncedQuery`. Visual spinner already in `CommandInput`.
      3. **Empty state** — `<CommandEmpty>{t('noResults')} — {t('tryAgain')}</CommandEmpty>` (cmdk shows this automatically when no items match the input value, but we also explicitly render it when `debouncedQuery.length > 0 && results?.products?.length === 0 && !loading && query === debouncedQuery`).
      4. **Brands** — derived from `Array.from(new Set(results.products.map(p => p.vendor).filter(Boolean))).slice(0, 5)`. Heading `t('brands')`. Each brand: `CommandItem` with `onSelect={() => { addRecent(brand); router.push('/search?q=' + encodeURIComponent(brand)); onOpenChange(false); }}`. Renders only when query non-empty AND at least one vendor.
      5. **Products** — heading `${t('products')} · ${t('results', { count })}` (uses existing ICU plural). Each row via `SearchCommandRow` with `onSelect={(p) => { addRecent(debouncedQuery); router.push(`/product/${p.handle}`); onOpenChange(false); }}`.
      6. **View all results** — final `CommandItem` after Products, `onSelect={() => { addRecent(debouncedQuery); router.push('/search?q=' + encodeURIComponent(debouncedQuery)); onOpenChange(false); }}`. Renders only when products list is non-empty.
    - `CommandInput`: `value={query}`, `onValueChange={setQuery}`, `placeholder={t('placeholder')}`. Inline `Loader2` spinner positioned absolute right of input; visible per A-07. Use cmdk's input wrapper — if shadcn template wraps `<CommandInput>` in a div, append the spinner as sibling inside that wrapper (may require a small fork of `CommandInput` styling — alternatively, render spinner via a portal or with absolute positioning relative to the dialog). Simplest path: render the spinner as a sibling positioned via flex/absolute inside the same row as `CommandInput`. If the shadcn template already renders an icon (search icon) on the left, place the spinner on the right by passing custom children or wrapping. If structural changes are too invasive, render `<Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />` inside the `CommandDialog` overlay container conditionally.
  </behavior>
  <action>
Create `'use client'` component. Imports:

```ts
import { Loader2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@shared/i18n/navigation';
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem, CommandLoading, CommandSeparator,
} from '@shared/ui/command';
import { usePredictiveSearch } from '../model/use-predictive-search';
import { useRecentSearches } from '../model/use-recent-searches';
import { SearchCommandRow } from './SearchCommandRow';
import type { Product } from '@shared/lib/shopify/types/storefront.types';
```

Implement per A-01, A-03, A-06, A-07, A-08, A-09, A-10. Key interactions:

```tsx
const handleProductSelect = (p: Product) => {
  addRecent(debouncedQuery);
  router.push(`/product/${p.handle}`);
  onOpenChange(false);
};

const handleBrandSelect = (brand: string) => {
  addRecent(brand);
  router.push(`/search?q=${encodeURIComponent(brand)}`);
  onOpenChange(false);
};

const handleViewAll = () => {
  addRecent(debouncedQuery);
  router.push(`/search?q=${encodeURIComponent(debouncedQuery)}`);
  onOpenChange(false);
};

const handleRecentSelect = (q: string) => {
  setQuery(q);
};
```

Important cmdk gotcha: cmdk filters `CommandItem`s by their `value` against the input. For Recent + Brands sections we want them visible regardless of input — but Recent only shows when input is empty (so the cmdk filter is empty, all items pass). For Brands when input is non-empty, set each `CommandItem`'s `value` to include the input substring OR use `<Command shouldFilter={false}>` on the root. Use `shouldFilter={false}` (set on the underlying `Command` inside `CommandDialog` — pass via prop) since we already do server-side predictive matching. This means cmdk no longer fuzzy-filters, but rendering order is fully under our control. Pass: `<CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false}>` (verify shadcn `CommandDialog` forwards the `shouldFilter` prop to `Command`; if not, fork the wrapper or use raw `Command` inside a custom `Dialog`). If shadcn's `CommandDialog` does not forward, replace with:

```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="overflow-hidden p-0 max-w-2xl">
    <Command shouldFilter={false} className="[&_[cmdk-group-heading]]:px-2 ...">
      ...
    </Command>
  </DialogContent>
</Dialog>
```

Inline loading spinner: render inside the same row as `CommandInput`. The shadcn template typically structures `CommandInput` as `<div ...><SearchIcon /><CommandPrimitive.Input ... /></div>`. Wrap the entire `CommandInput` in a relatively positioned div and absolute-position `<Loader2 className="animate-spin h-4 w-4 text-neutral-400" />` at right when `loading || query !== debouncedQuery`. Loader VISIBLE while typing or fetching; hidden once results land.

Result count: `{t('results', { count: results.products.length })}` rendered inside the Products `CommandGroup`'s `heading` prop or as a `<div className="px-2 py-1.5 text-xs text-muted-foreground">` immediately under the heading.

Ensure debouncedQuery dependency: when `setQuery(recent)` runs, `usePredictiveSearch` will pick up the new query, debounce, fetch, and results populate — same flow as typing.

Final structure outline (collapsed):

```tsx
'use client';
export function SearchCommandDialog({ open, onOpenChange }: Props) {
  const t = useTranslations('Search');
  const router = useRouter();
  const { query, setQuery, debouncedQuery, results, loading } = usePredictiveSearch();
  const { recents, addRecent, clearRecents } = useRecentSearches();

  const products = results?.products ?? [];
  const brands = useMemo(() => {
    if (!query.trim()) return [];
    return Array.from(new Set(products.map(p => p.vendor).filter(Boolean))).slice(0, 5);
  }, [products, query]);

  const showRecents = query.trim() === '' && recents.length > 0;
  const showSpinner = loading || (query.trim().length > 0 && query !== debouncedQuery);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false}>
      <div className="relative">
        <CommandInput value={query} onValueChange={setQuery} placeholder={t('placeholder')} />
        {showSpinner && <Loader2 className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />}
      </div>
      <CommandList>
        {showSpinner && <CommandLoading>{t('loading')}</CommandLoading>}

        {showRecents && (
          <CommandGroup heading={t('recentSearches')}>
            {recents.map(r => (
              <CommandItem key={r} value={r} onSelect={() => handleRecentSelect(r)}>
                {r}
              </CommandItem>
            ))}
            <CommandItem value="__clear_recents__" onSelect={clearRecents} className="text-xs text-neutral-500">
              {t('clearRecent')}
            </CommandItem>
          </CommandGroup>
        )}

        {brands.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={t('brands')}>
              {brands.map(b => (
                <CommandItem key={b} value={b} onSelect={() => handleBrandSelect(b)}>
                  {b}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {products.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={`${t('products')} · ${t('results', { count: products.length })}`}>
              {products.map(p => (
                <SearchCommandRow key={p.id} product={p as Product} onSelect={handleProductSelect} />
              ))}
              <CommandItem value="__view_all__" onSelect={handleViewAll}>
                {t('viewAllResults')}
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {!loading && query === debouncedQuery && debouncedQuery.length > 0 && products.length === 0 && (
          <CommandEmpty>{t('noResults')}. {t('tryAgain')}</CommandEmpty>
        )}
      </CommandList>
    </CommandDialog>
  );
}
```

If `CommandDialog` does not accept `shouldFilter`, use the Dialog+Command fallback shown above.
  </action>
  <verify>
    <automated>test -f /Users/mnmac/Development/nnshop/src/features/search/ui/SearchCommandDialog.tsx && grep -q "useRecentSearches" /Users/mnmac/Development/nnshop/src/features/search/ui/SearchCommandDialog.tsx && grep -q "shouldFilter" /Users/mnmac/Development/nnshop/src/features/search/ui/SearchCommandDialog.tsx && cd /Users/mnmac/Development/nnshop && npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "SearchCommandDialog" | head -5; test $? -ne 0</automated>
  </verify>
  <done>Component file exists with all 6 sections, shouldFilter disabled, recents wired, addRecent called on product/brand/view-all selection, tsc clean.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 4: Upgrade SearchTrigger with Cmd+K binding + new dialog</name>
  <files>src/features/search/ui/SearchTrigger.tsx</files>
  <action>
Replace contents of `SearchTrigger.tsx`:

```tsx
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@shared/ui/button';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SearchCommandDialog } from './SearchCommandDialog';

export function SearchTrigger({ className }: { className?: string }) {
  const t = useTranslations('Search');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <Button
        className={className}
        variant="ghost"
        size="icon"
        aria-label={t('title')}
        onClick={() => setOpen(true)}
      >
        <Search className="w-5 h-5" />
      </Button>
      <SearchCommandDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
```

Per A-04: toggle on Cmd+K (so a second press closes), prevent default to swallow browser default (Chrome's address-bar focus is Ctrl+L; Cmd+K in Chrome is search engine — conflict accepted, see Risks). No customization for `/` or other keys.
  </action>
  <verify>
    <automated>grep -q "SearchCommandDialog" /Users/mnmac/Development/nnshop/src/features/search/ui/SearchTrigger.tsx && grep -q "metaKey" /Users/mnmac/Development/nnshop/src/features/search/ui/SearchTrigger.tsx && ! grep -q "SearchDialog" /Users/mnmac/Development/nnshop/src/features/search/ui/SearchTrigger.tsx || (grep -q "SearchDialog" /Users/mnmac/Development/nnshop/src/features/search/ui/SearchTrigger.tsx && exit 1)</automated>
  </verify>
  <done>SearchTrigger imports SearchCommandDialog only, has metaKey listener, no reference to old SearchDialog.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 5: Update feature barrel and delete old SearchDialog</name>
  <files>src/features/search/index.ts, src/features/search/ui/SearchDialog.tsx</files>
  <action>
Update `src/features/search/index.ts`:
- Remove line `export { SearchDialog } from './ui/SearchDialog';`
- Add line `export { SearchCommandDialog } from './ui/SearchCommandDialog';`
- Keep all other exports as-is (`SearchTrigger`, `SearchResultsGrid`, `SearchSkeleton`, `SearchEmpty`, `predictiveSearch`, `searchProducts`, `SearchProductsResult`, `SearchPageContent`).

Then verify nothing else imports `SearchDialog`:
```bash
grep -rn "from.*['\"].*SearchDialog['\"]\\|from.*['\"]@features/search['\"]" /Users/mnmac/Development/nnshop/src 2>/dev/null
```
Expect zero hits referencing `SearchDialog` (only `SearchTrigger` / `SearchCommandDialog` imports allowed). Header consumers `src/features/header/ui/HeaderContent.tsx` and `HeaderOptions.tsx` import `SearchTrigger` only — confirm. If any consumer imports `SearchDialog` directly, replace with `SearchCommandDialog`.

Once confirmed, delete the old file:
```bash
rm /Users/mnmac/Development/nnshop/src/features/search/ui/SearchDialog.tsx
```
  </action>
  <verify>
    <automated>! test -f /Users/mnmac/Development/nnshop/src/features/search/ui/SearchDialog.tsx && ! grep -rn "SearchDialog" /Users/mnmac/Development/nnshop/src 2>/dev/null | grep -v "SearchCommandDialog" | grep -v "//.*SearchDialog"</automated>
  </verify>
  <done>SearchDialog.tsx is deleted; barrel exports SearchCommandDialog; no live references to SearchDialog remain in src/.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 6: Add new translation keys to uk/ru/en</name>
  <files>messages/uk.json, messages/ru.json, messages/en.json</files>
  <action>
Add new keys to the existing `Search` namespace in each file. Existing keys (`placeholder`, `searchButton`, `results`, `totalResults`, `viewAll`, `noResults`, `tryAgain`, `title`, `loading`, `resultsFor`, `errorFetchingResults`) stay untouched.

**uk.json — Search namespace additions:**
```json
"recentSearches": "Останні пошуки",
"clearRecent": "Очистити історію",
"noRecentSearches": "Немає останніх пошуків",
"brands": "Бренди",
"products": "Товари",
"viewAllResults": "Переглянути всі результати",
"cmdK": "Натисніть Cmd+K для пошуку"
```

**ru.json — Search namespace additions:**
```json
"recentSearches": "Недавние поиски",
"clearRecent": "Очистить историю",
"noRecentSearches": "Нет недавних поисков",
"brands": "Бренды",
"products": "Товары",
"viewAllResults": "Посмотреть все результаты",
"cmdK": "Нажмите Cmd+K для поиска"
```

**en.json — Search namespace additions:**
```json
"recentSearches": "Recent searches",
"clearRecent": "Clear history",
"noRecentSearches": "No recent searches",
"brands": "Brands",
"products": "Products",
"viewAllResults": "View all results",
"cmdK": "Press Cmd+K to search"
```

Use the Edit tool — locate the existing `"errorFetchingResults"` line in each file and append the new keys after it (still inside `Search` block). Validate each JSON file with `node -e "JSON.parse(require('fs').readFileSync('messages/uk.json'))"` (and ru / en).
  </action>
  <verify>
    <automated>node -e "['uk','ru','en'].forEach(l => { const m = JSON.parse(require('fs').readFileSync('/Users/mnmac/Development/nnshop/messages/'+l+'.json')); ['recentSearches','clearRecent','brands','products','viewAllResults'].forEach(k => { if (!m.Search[k]) { console.error(l+' missing '+k); process.exit(1); }}); }); console.log('ok');"</automated>
  </verify>
  <done>All three locale files parse as valid JSON and contain `Search.recentSearches`, `Search.clearRecent`, `Search.brands`, `Search.products`, `Search.viewAllResults`.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 7: Full typecheck + build smoke</name>
  <files>(no file changes — validation only)</files>
  <action>
Run TypeScript check across whole project to catch any cross-module type breakage from the SearchDialog removal or new component imports:

```bash
npx tsc --noEmit -p tsconfig.json
```

Expect zero errors. If errors appear that mention `SearchDialog` (orphan import) — fix the importing file. If errors appear in `SearchCommandDialog.tsx` related to `Product` typing on `results.products`, cast via `(results.products ?? []) as Product[]` (predictive-search query returns a structurally compatible subset; exact typing is tracked via `storefront.generated`).

Do NOT run `next build` (slow) — TS noEmit is sufficient for plan verification. Manual `npm run dev` smoke is covered in <verification> below.
  </action>
  <verify>
    <automated>cd /Users/mnmac/Development/nnshop && npx tsc --noEmit -p tsconfig.json</automated>
  </verify>
  <done>tsc exits 0.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
    cmdk-based SearchCommandDialog replacing SearchDialog: sectioned Products / Brands / Recent results, arrow-key nav, recent searches in localStorage, inline loading spinner in input, Cmd+K shortcut.
  </what-built>
  <how-to-verify>
1. Run `npm run dev` and open `http://localhost:3000` (uk locale).
2. Press **Cmd+K** (or **Ctrl+K** on Linux/Windows). Popup must open with focused input.
3. Type a query (e.g. `nike`). Verify:
   - Inline spinner appears in input while debouncing.
   - Products section shows compact rows (40px thumb + title + price) with "X результатів" count in heading.
   - If products have distinct vendors, Brands section appears above Products with up to 5 brand names.
   - Final row "Переглянути всі результати" is present.
4. Use arrow keys (Down/Up) — selection moves through items including across groups. Enter on a product navigates to `/product/<handle>`. Popup closes.
5. Reopen with Cmd+K. Verify "Останні пошуки" section now contains the just-searched query. Click "Очистити історію" — recents clear.
6. Type a query that returns no results (e.g. `zzzzzzz`). Verify empty state renders translated `noResults` + `tryAgain`.
7. Press **Esc**. Popup closes.
8. Press **Cmd+K** again — popup re-opens. Press Cmd+K again — popup closes (toggle).
9. Switch locale to `/ru` and `/en`. Verify all section headings translate.
10. Verify `/search?q=test` page (Phase 20) still renders correctly — grid, filters, pagination unchanged.
11. Open DevTools → Application → Local Storage. Confirm `nnshop:search:recent` key contains JSON array of strings, max 5.
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues (e.g. "spinner doesn't show", "Cmd+K conflicts with browser shortcut on Firefox", "brand section never renders").</resume-signal>
</task>

</tasks>

## Verification

Manual happy-path covered in Task 8 checkpoint. Automated coverage:

- **Static**: `npx tsc --noEmit` passes (Task 7).
- **JSON**: All 3 locale files parse and contain new keys (Task 6 verify).
- **File presence**: `command.tsx`, `useRecentSearches`, `SearchCommandDialog`, `SearchCommandRow` all exist; `SearchDialog.tsx` removed (Tasks 0–5).
- **Reference cleanliness**: no `SearchDialog` import remains anywhere except possibly in commented historical notes (Task 5 verify).

## Out of scope

- `/search` results page (Phase 20 — do not touch `SearchPageContent`, `SearchResultsGrid` rendering on that page, filters, pagination).
- Replacing `predictiveSearch` GraphQL with full `search` query.
- Adding fuzzy local re-ranking on top of Storefront results.
- Adding `collections`, `pages`, `articles`, or `queries` arms to predictive search.
- Highlighting matched substrings inside row titles.
- Persisting recents across devices (localStorage only — no server sync).
- Mobile bottom-sheet variant of the popup (uses standard centered modal across breakpoints; revisit if UX flags it).
- Customizing `dialog.tsx` (kept as-is per Task 0).

## Risks

- **R-01 (cmdk + Radix Dialog overlay):** `CommandDialog` uses Radix Dialog underneath. Existing app already uses `dialog.tsx` from same shadcn template, so portal/z-index conflicts are unlikely — but if any other Radix overlay is open simultaneously (drawer, dropdown), focus trap may compete. Mitigation: trust Radix's stacked overlay handling, validate in Task 8 checkpoint.
- **R-02 (Browser Cmd+K conflict):** Chrome on macOS uses Cmd+K to focus the omnibox search engine selector; Firefox uses Cmd+K to focus the search bar. Calling `e.preventDefault()` swallows it on the page — acceptable since user is in the app context. If a user complains, add a "press / to search" alternative in a follow-up.
- **R-03 (LocalStorage SSR):** All `localStorage` access is gated by `typeof window !== 'undefined'` and runs inside `useEffect` — no SSR mismatch. Initial state is `[]`, hydration to stored values happens after mount (acceptable since dialog starts closed).
- **R-04 (`ProductCardSPP` inside `CommandItem`):** Avoided entirely by using compact rows (per A-05). `CommandItem` is a single role="option" with no nested interactive children.
- **R-05 (cmdk shouldFilter prop forwarding):** If shadcn's `CommandDialog` does not forward `shouldFilter` to the inner `Command`, recents/brands without matching the typed text would be filtered out. Fallback documented in Task 3: replace `CommandDialog` with raw `Dialog` + `Command shouldFilter={false}`. Verify by inspecting `command.tsx` after Task 0 — if `CommandDialog` forwards `...props` to `<Command>`, you're fine; otherwise use the fallback.
- **R-06 (cmdk version pin):** `npx shadcn@latest add command` installs cmdk@^1; if cmdk releases a breaking 2.x mid-task, lockfile may resolve unexpectedly. Mitigation: use exact version installed by shadcn (no manual upgrade in this phase).
- **R-07 (vendor field absent on predictive-search products):** Storefront API may return products without `vendor` populated in `predictiveSearch` (depends on selected fields in `queries.ts`). If Brands section never renders despite results, inspect `src/features/search/api/predictive-search.ts` query selection set — `vendor` field may need to be added to the GraphQL selection. Surface this in Task 8 checkpoint feedback if observed; out of scope to add it speculatively.
- **R-08 (Filtering on empty input):** With `shouldFilter={false}`, cmdk does NOT filter items by input — we render exactly what we want. This means the "type to filter recents" behavior is intentionally absent (recents only show when input is empty). Acceptable per A-09.

<success_criteria>
- All 8 tasks complete; Task 8 (human checkpoint) approved.
- `git status` shows: `command.tsx`, `use-recent-searches.ts`, `SearchCommandDialog.tsx`, `SearchCommandRow.tsx` added; `SearchTrigger.tsx`, `index.ts`, `messages/uk.json`, `messages/ru.json`, `messages/en.json` modified; `SearchDialog.tsx` deleted.
- `npx tsc --noEmit -p tsconfig.json` exits 0.
- Manual: Cmd+K opens popup, ESC closes, recents persist across reload, sections render correctly in all 3 locales, `/search` page still works.
</success_criteria>

<output>
After completion, create `.planning/phases/21-search-popup-cmdk-ux-overhaul/21-01-SUMMARY.md` documenting:
- shadcn command primitive installed (cmdk version pinned)
- Recent searches localStorage contract (key, max, dedup rules) for future cross-device sync work
- Whether `shouldFilter={false}` was passed via `CommandDialog` or required Dialog+Command fallback (R-05 outcome)
- Whether `vendor` field was already present on predictive-search products (R-07 outcome)
- Any UX deltas vs old SearchDialog (e.g. removed slide-from-header animation per A-14)
</output>
