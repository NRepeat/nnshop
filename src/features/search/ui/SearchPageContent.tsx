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
  const [{ locale }, awaitedSearchParams, t] = await Promise.all([
    params,
    searchParams,
    getTranslations('Search'),
  ]);

  const query =
    typeof awaitedSearchParams.q === 'string'
      ? awaitedSearchParams.q.trim()
      : '';

  const limit = Math.min(
    parseInt((awaitedSearchParams.limit as string) || '24', 10),
    250,
  );

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
              initialProducts={
                productsWithFav as (Product & { isFav: boolean })[]
              }
              initialPageInfo={pageInfo as PageInfo}
              query={query}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
