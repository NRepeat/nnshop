'use client';
import { useMemo } from 'react';
import { Loader2, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@shared/i18n/navigation';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@shared/ui/command';
import type { Product } from '@shared/lib/shopify/types/storefront.types';
import { usePredictiveSearch } from '../model/use-predictive-search';
import { useRecentSearches } from '../model/use-recent-searches';
import { SearchCommandRow } from './SearchCommandRow';
import { SearchCommandRowSkeleton } from './SearchCommandRowSkeleton';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SearchCommandDialog({ open, onOpenChange }: Props) {
  const t = useTranslations('Search');
  const router = useRouter();
  const { query, setQuery, debouncedQuery, results, loading } =
    usePredictiveSearch();
  const { recents, addRecent, clearRecents } = useRecentSearches();

  const products = useMemo(
    () => (results?.products ?? []) as Product[],
    [results],
  );

  const brands = useMemo(() => {
    if (!query.trim()) return [] as string[];
    const seen = new Set<string>();
    const list: string[] = [];
    for (const p of products) {
      const v = (p as Product).vendor;
      if (v && !seen.has(v)) {
        seen.add(v);
        list.push(v);
        if (list.length >= 5) break;
      }
    }
    return list;
  }, [products, query]);

  const showRecents = query.trim() === '' && recents.length > 0;
  const showSpinner =
    loading || (query.trim().length > 0 && query !== debouncedQuery);
  const showEmpty =
    !loading &&
    query === debouncedQuery &&
    debouncedQuery.length > 0 &&
    products.length === 0;

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

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      shouldFilter={false}
      title={t('title')}
      description={t('placeholder')}
      // top-anchored on every viewport so the dialog does not jump vertically
      // when its content height changes (loading → results → empty).
      // mobile: 4vh from top + full available width with side margins.
      // sm+: 8vh from top with max-w-2xl.
      className="max-w-[calc(100%-1rem)] sm:max-w-2xl top-[4vh] sm:top-[8vh] translate-y-0 p-0 gap-0"
    >
      <div className="relative">
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder={t('placeholder')}
          className="text-base sm:text-sm"
        />
        {showSpinner && (
          <Loader2 className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        )}
      </div>
      <CommandList className="max-h-[70vh] sm:max-h-[60vh]">
        {showSpinner && products.length === 0 && (
          <div className="px-1 py-1">
            <SearchCommandRowSkeleton count={5} />
          </div>
        )}

        {showRecents && (
          <CommandGroup heading={t('recentSearches')}>
            {recents.map((r) => (
              <CommandItem
                key={r}
                value={`recent-${r}`}
                onSelect={() => handleRecentSelect(r)}
              >
                {r}
              </CommandItem>
            ))}
            <CommandItem
              value="__clear_recents__"
              onSelect={clearRecents}
              className="text-xs text-neutral-500"
            >
              {t('clearRecent')}
            </CommandItem>
          </CommandGroup>
        )}

        {brands.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={t('brands')}>
              {brands.map((b) => (
                <CommandItem
                  key={b}
                  value={`brand-${b}`}
                  onSelect={() => handleBrandSelect(b)}
                >
                  {b}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {products.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup
              heading={`${t('products')} · ${t('results', { count: products.length })}`}
            >
              {products.map((p) => (
                <SearchCommandRow
                  key={p.id}
                  product={p}
                  onSelect={handleProductSelect}
                />
              ))}
              <CommandItem value="__view_all__" onSelect={handleViewAll}>
                {t('viewAllResults')}
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {showEmpty && (
          <CommandEmpty>
            <div className="flex flex-col items-center gap-2 py-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                <Search className="h-5 w-5 text-neutral-400" />
              </div>
              <p className="text-sm font-medium">{t('noResults')}</p>
              <p className="text-xs text-neutral-500">{t('tryAgain')}</p>
            </div>
          </CommandEmpty>
        )}

        {/* Initial idle state — query empty AND no recents: hint user. */}
        {query.trim() === '' && recents.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
              <Search className="h-5 w-5 text-neutral-400" />
            </div>
            <p className="text-sm font-medium">{t('placeholder')}</p>
            <p className="text-xs text-neutral-500 hidden sm:block">
              {t('cmdK')}
            </p>
          </div>
        )}
      </CommandList>
    </CommandDialog>
  );
}
