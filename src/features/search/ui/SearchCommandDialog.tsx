'use client';
import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@shared/i18n/navigation';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandLoading,
  CommandSeparator,
} from '@shared/ui/command';
import type { Product } from '@shared/lib/shopify/types/storefront.types';
import { usePredictiveSearch } from '../model/use-predictive-search';
import { useRecentSearches } from '../model/use-recent-searches';
import { SearchCommandRow } from './SearchCommandRow';

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
      className="max-w-2xl"
    >
      <div className="relative">
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder={t('placeholder')}
        />
        {showSpinner && (
          <Loader2 className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        )}
      </div>
      <CommandList>
        {showSpinner && <CommandLoading>{t('loading')}</CommandLoading>}

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
            {t('noResults')}. {t('tryAgain')}
          </CommandEmpty>
        )}
      </CommandList>
    </CommandDialog>
  );
}
