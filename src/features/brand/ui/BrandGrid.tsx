import { getCollection } from '@entities/collection/api/getCollection';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@shared/ui/empty';
import { PackageSearch } from 'lucide-react';
import { ClientGridWrapper } from '@features/collection/ui/ClientGridWrapper';
import { PageInfo, Product } from '@shared/lib/shopify/types/storefront.types';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@shared/ui/breadcrumb';
import { CollectionFilterBar } from '@features/collection/ui/CollectionFilterBar';
import { FilterSheet } from '@features/collection/ui/FilterSheet';
import { SortSelect } from '@features/collection/ui/SortSelect';
import { ActiveFiltersCarousel } from '@features/collection/ui/ActiveFiltersCarousel';
import { EnableScrollHide } from '@shared/ui/EnableScrollHide';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { decodeHtmlEntities } from '@shared/lib/utils/decodeHtmlEntities';
import { toFilterSlug } from '@shared/lib/filterSlug';
import { filterProducts } from '@features/collection/lib/filterProducts';

export type SearchParams = { [key: string]: string | string[] | undefined };

export const BrandGrid = async ({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<SearchParams>;
}) => {
  const [awaitedParams, awaitedSearchParams, t, tBrands, tCollection] =
    await Promise.all([
      params,
      searchParams,
      getTranslations('Header'),
      getTranslations('BrandsPage'),
      getTranslations('CollectionPage'),
    ]);

  const { locale, slug } = awaitedParams;
  const decodedSlug = decodeURIComponent(slug);
  setRequestLocale(locale);

  const hasFilters = Object.keys(awaitedSearchParams).length > 0;

  const collectionPromises = [
    getCollection({
      handle: decodedSlug,
      first: 20,
      locale: locale,
      searchParams: awaitedSearchParams,
    }),
  ];

  if (hasFilters) {
    collectionPromises.push(
      getCollection({
        handle: decodedSlug,
        first: 20,
        locale: locale,
      }),
    );
  }

  const [currentData, initialData] = await Promise.all(collectionPromises);

  if (!currentData?.collection?.collection) {
    return notFound();
  }

  const { collection } = currentData;

  // Build selectedSizeSlugs from URL params (direct, independent of filterDefs)
  const selectedSizeSlugs = new Set<string>();
  if (hasFilters && awaitedSearchParams.rozmir) {
    const vals = Array.isArray(awaitedSearchParams.rozmir)
      ? awaitedSearchParams.rozmir
      : (awaitedSearchParams.rozmir as string).split(';');
    vals.forEach((v) => selectedSizeSlugs.add(v));
  }

  // Build optionGroups for variantOption filters (color, etc.) via filterDefs
  const optionGroups = new Map<string, { name: string; values: Set<string> }>();
  if (hasFilters) {
    const filterDefs = collection.collection?.products.filters ?? [];
    for (const [key, value] of Object.entries(awaitedSearchParams)) {
      if (
        key === 'minPrice' ||
        key === 'maxPrice' ||
        key === 'sort' ||
        key === 'rozmir'
      )
        continue;
      const definition = filterDefs.find((f) => f.id.endsWith(`.${key}`));
      if (!definition) continue;
      const values = Array.isArray(value)
        ? value
        : (value as string).split(';');
      values.forEach((v) => {
        const filterValue = definition.values.find(
          (def) => toFilterSlug(def.label) === v,
        );
        if (filterValue) {
          try {
            const parsed = JSON.parse(filterValue.input);
            if (parsed.variantOption) {
              if (!optionGroups.has(key))
                optionGroups.set(key, {
                  name: parsed.variantOption.name,
                  values: new Set(),
                });
              optionGroups.get(key)!.values.add(parsed.variantOption.value);
            }
          } catch {}
        }
      });
    }
  }

  const allEdgeProducts =
    collection.collection?.products.edges.map((e) => e.node) ?? [];
  const rawProducts = filterProducts(
    allEdgeProducts,
    selectedSizeSlugs,
    optionGroups,
  );

  const productsWithFav = rawProducts.map((product) => ({
    ...product,
    isFav: false,
  }));

  const initialFilters = hasFilters
    ? initialData?.collection?.collection?.products.filters
    : collection.collection?.products.filters;

  const pageInfo = collection.collection?.products.pageInfo;

  const serializableOptionGroups: Record<
    string,
    { name: string; values: string[] }
  > = {};
  optionGroups.forEach((group, key) => {
    serializableOptionGroups[key] = {
      name: group.name,
      values: Array.from(group.values),
    };
  });

  return (
    <>
      <div className=" flex flex-col mt-8">
        <Breadcrumb className=" mb-4 md:mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${locale}`}>
                {t('nav.home')}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/${locale}/brands`}>
                    {tBrands('title')}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            }
            <BreadcrumbItem>
              <BreadcrumbPage>
                {decodeHtmlEntities(collection.collection?.title ?? '')}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <EnableScrollHide />

        <div className="w-full border-b border-muted pb-4 flex flex-col lg:flex-row justify-between lg:items-end gap-6">
          <div className="flex flex-col gap-3.5 w-full min-w-0">
            <h1 className="text-2xl font-bold">
              {decodeHtmlEntities(collection.collection?.title ?? '')}
            </h1>
            {collection.collection?.description && (
              <p className="text-gray-600 text-sm max-w-full">
                {collection.collection?.description}
              </p>
            )}
            {collection.collection?.products.filters && (
              <Suspense fallback={null}>
                <ActiveFiltersCarousel
                  filters={collection.collection.products.filters}
                />
              </Suspense>
            )}
          </div>
          <div className="flex h-full items-center flex-row gap-2 justify-between md:justify-end flex-shrink-0">
            <Suspense fallback={null}>
              <SortSelect />
            </Suspense>
            <FilterSheet
              filters={collection.collection?.products.filters}
              initialFilters={initialFilters}
              hideVendor
            />
          </div>
        </div>

        {collection.collection?.products.filters && (
          <Suspense fallback={null}>
            <CollectionFilterBar
              filters={collection.collection.products.filters}
              initialFilters={initialFilters}
              hideVendor
            />
          </Suspense>
        )}

        <div className="flex justify-between gap-8 h-full">
          {productsWithFav.length === 0 ? (
            <div className="w-full py-16">
              <Empty>
                <EmptyHeader>
                  <PackageSearch className="w-12 h-12 text-muted-foreground" />
                  <EmptyTitle>{tCollection('noProducts')}</EmptyTitle>
                  {hasFilters && (
                    <EmptyDescription>
                      {tCollection('explore')}
                    </EmptyDescription>
                  )}
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <ClientGridWrapper
              initialPageInfo={pageInfo as PageInfo}
              // @ts-ignore
              initialProducts={productsWithFav as Product[]}
              handle={decodedSlug}
              selectedSizeSlugs={Array.from(selectedSizeSlugs)}
              optionGroups={serializableOptionGroups}
            />
          )}
        </div>
      </div>
    </>
  );
};
