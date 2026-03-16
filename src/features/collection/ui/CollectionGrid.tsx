import { getCollection, getCollectionFilters, getCollectionSlugs } from '@entities/collection/api/getCollection';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import { sanityFetch } from '@shared/sanity/lib/client';
import { COLLECTION_IS_BRAND_QUERY } from '@shared/sanity/lib/query';
import { ClientGridWrapper } from './ClientGridWrapper';
import { PageInfo, Product } from '@shared/lib/shopify/types/storefront.types';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@shared/ui/breadcrumb';
import { resolveCollectionHandle, detectGenderFromHandle } from '@entities/collection/lib/resolve-handle';
import { stripInvisible } from '@shared/lib/seo/generateMetadata';
import { CollectionFilterBar } from './CollectionFilterBar';
import { FilterSheet } from './FilterSheet';
import { SortSelect } from './SortSelect';
import { ActiveFiltersCarousel } from './ActiveFiltersCarousel';
import { GridToggle } from './GridToggle';
import { EnableScrollHide } from '@shared/ui/EnableScrollHide';
import { SearchParams } from '~/app/[locale]/(frontend)/(home)/[gender]/(collection)/[slug]/page';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { PathSync } from '@entities/path-sync/ui/path-sync';
import { auth } from '@features/auth/lib/auth';
import { JsonLd } from '@shared/ui/JsonLd';
import { generateBreadcrumbJsonLd } from '@shared/lib/seo/jsonld/breadcrumb';
import { prisma } from '@shared/lib/prisma';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@shared/ui/empty';
import { PackageSearch } from 'lucide-react';
import { toFilterSlug } from '@shared/lib/filterSlug';
import { DISCOUNT_METAFIELD_KEY } from '@shared/config/shop';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://miomio.com.ua';

function getEffectivePrice(product: { priceRange?: { maxVariantPrice?: { amount: any } }; metafield?: { key?: string; value?: string } | null }): number {
  const base = parseFloat(product.priceRange?.maxVariantPrice?.amount ?? '0');
  const discount =
    product.metafield?.key === DISCOUNT_METAFIELD_KEY && product.metafield?.value
      ? parseFloat(product.metafield.value)
      : 0;
  return base * (1 - discount / 100);
}

export const CollectionGrid = async ({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string; gender: string }>;
  searchParams: Promise<SearchParams>;
}) => {
  const [awaitedParams, awaitedSearchParams, t, tCollection] = await Promise.all([
    params,
    searchParams,
    getTranslations('Header'),
    getTranslations('CollectionPage'),
  ]);
  const { locale, slug, gender } = awaitedParams;
  const hasFilters = Object.keys(awaitedSearchParams).length > 0;

  const allSlugs = await getCollectionSlugs();
  const resolvedHandle = resolveCollectionHandle(slug, gender, new Set(allSlugs));

  const [sanityCollection, currentData, session] = await Promise.all([
    sanityFetch({
      query: COLLECTION_IS_BRAND_QUERY,
      params: { handle: resolvedHandle },
      tags: [`collection:${resolvedHandle}`],
    }),
    getCollection({
      handle: resolvedHandle,
      first: 20,
      locale: locale,
      searchParams: awaitedSearchParams,
      gender,
    }),
    auth.api.getSession({ headers: await headers() }),
  ]);

  if (sanityCollection?.isBrand) {
    redirect(`/${locale}/brand/${resolvedHandle}`);
  }

  if (!currentData?.collection?.collection) {
    return notFound();
  }

  const { collection, alternateHandle } = currentData;
  const canonicalHandle = collection.collection?.handle;

  // SEO REDIRECT: If the requested handle is not canonical for current locale (e.g. old handle or other-locale handle)
  if (canonicalHandle && resolvedHandle !== canonicalHandle) {
    redirect(`/${locale}/${gender}/${canonicalHandle}`);
  }

  // 3. GENDER REDIRECT: If the collection belongs to a different gender than the URL
  if (canonicalHandle) {
    const collectionGender = detectGenderFromHandle(canonicalHandle);
    if (collectionGender && collectionGender !== gender) {
      redirect(`/${locale}/${collectionGender}/${canonicalHandle}`);
    }
  }

  const displayTitle = stripInvisible(
    sanityCollection?.customTitle?.[locale as 'uk' | 'ru'] ||
    collection.collection?.title ||
    '',
  );

  // Extract selected variant-level filters.
  // variantOption filters → match by option name + value.
  // productMetafield (rozmir etc.) → Shopify stores Metaobject GIDs in the input,
  //   but the filter label IS the display value (e.g. "46") which matches variant selectedOptions.
  // Group by URL param key: OR within same key, AND across keys
  // e.g. rozmir=[46,48] AND color=[black] → variant must be (46 OR 48) AND black
  const optionGroups = new Map<string, { name?: string; values: Set<string> }>();
  if (hasFilters) {
    const filterDefs = collection.collection?.products.filters ?? [];
    for (const [key, value] of Object.entries(awaitedSearchParams)) {
      if (key === 'minPrice' || key === 'maxPrice' || key === 'sort') continue;
      const definition = filterDefs.find((f) => f.id.endsWith(`.${key}`));
      if (!definition) continue;
      const values = Array.isArray(value) ? value : (value as string).split(';');
      values.forEach((v) => {
        const filterValue = definition.values.find((def) => toFilterSlug(def.label) === v);
        if (filterValue) {
          try {
            const parsed = JSON.parse(filterValue.input);
            if (parsed.variantOption) {
              if (!optionGroups.has(key)) optionGroups.set(key, { name: parsed.variantOption.name, values: new Set() });
              optionGroups.get(key)!.values.add(parsed.variantOption.value);
            } else if (parsed.productMetafield) {
              // Only rozmir (size) metafield values also exist as variant options,
              // so only those need client-side filtering. All other product metafields
              // (material, підкладка, підошва, etc.) are handled by Shopify server-side.
              if (parsed.productMetafield.key === 'rozmir') {
                if (!optionGroups.has(key)) optionGroups.set(key, { values: new Set() });
                optionGroups.get(key)!.values.add(filterValue.label);
              }
            }
          } catch {}
        }
      });
    }
  }

  const rawProducts =
    collection.collection?.products.edges
      .map((edge) => edge.node)
      .filter((product) => {
        const hasPrice =
          (product.priceRange?.minVariantPrice?.amount && Number(product.priceRange.minVariantPrice.amount) > 0) ||
          (product.priceRange?.maxVariantPrice?.amount && Number(product.priceRange.maxVariantPrice.amount) > 0);
        if (!hasPrice) return false;

        if (optionGroups.size === 0) {
          return product.totalInventory === null || product.totalInventory === undefined || product.totalInventory > 0;
        }

        // At least one variant must satisfy ALL option groups (AND between groups)
        // within each group, any one value is enough (OR within group)
        return product.variants.edges.some((variantEdge) => {
          const variant = variantEdge.node;
          if (!variant.availableForSale) return false;
          if (variant.quantityAvailable !== null && variant.quantityAvailable !== undefined && variant.quantityAvailable <= 0) {
            return false;
          }
          return [...optionGroups.values()].every(({ name, values }) =>
            variant.selectedOptions.some((o) =>
              (name ? o.name === name : true) && values.has(o.value),
            ),
          );
        });
      }) || [];

  // Batch check favorites
  let favoriteProductIds = new Set<string>();
  if (session?.user?.id) {
    const favorites = await prisma.favoriteProduct.findMany({
      where: {
        userId: session.user.id,
        productId: { in: rawProducts.map((p) => p.id) },
      },
      select: { productId: true },
    });
    favoriteProductIds = new Set(favorites.map((f) => f.productId));
  }

  const sortParam = awaitedSearchParams.sort as string | undefined;
  if (sortParam === 'price-asc' || sortParam === 'price-desc') {
    rawProducts.sort((a, b) => {
      const diff = getEffectivePrice(a) - getEffectivePrice(b);
      return sortParam === 'price-asc' ? diff : -diff;
    });
  }

  const productsWithFav = rawProducts.map((product) => ({
    ...product,
    isFav: favoriteProductIds.has(product.id),
  }));

  // Only fetch initialData if we actually have filters to avoid extra request
  let initialFilters = collection.collection?.products.filters;
  if (hasFilters) {
    initialFilters = await getCollectionFilters({
      handle: resolvedHandle,
      locale: locale,
    });
  }

  const targetLocale = locale === 'ru' ? 'uk' : 'ru';
  const paths = {
    [locale]: `/${gender}/${slug}`,
    [targetLocale]: `/${gender}/${alternateHandle}`,
  };
  const pageInfo = collection.collection?.products.pageInfo;

  return (
    <>
      <PathSync paths={paths} />
      <JsonLd
        data={generateBreadcrumbJsonLd([
          { name: t('nav.home'), url: `${BASE_URL}/${locale}` },
          {
            name: gender === 'man' ? t('nav.man') : t('nav.woman'),
            url: `${BASE_URL}/${locale}/${gender}`,
          },
          {
            name: displayTitle ?? slug,
            url: `${BASE_URL}/${locale}/${gender}/${slug}`,
          },
        ])}
      />
      <div className=" flex flex-col  mt-8">
        <Breadcrumb className="mb-4 md:mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${locale}`}>{t('nav.home')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${locale}/${gender}`}>
                {gender === 'man' ? t('nav.man') : t('nav.woman')}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{displayTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <EnableScrollHide />

        <div className="w-full border-b border-muted pb-4 flex flex-col lg:flex-row justify-between lg:items-end gap-6">
          <div className="flex flex-col gap-3.5 w-full">
            {displayTitle && <h1 className="text-2xl font-bold">{displayTitle}</h1>}
            {collection.collection?.products.filters && (
              <Suspense fallback={null}>
                <ActiveFiltersCarousel
                  filters={collection.collection.products.filters}
                />
              </Suspense>
            )}
          </div>
          <div className="flex h-full items-center flex-row gap-2 justify-between  md:justify-end">
            <GridToggle />
            <div className='flex gap-2'>
              <Suspense fallback={null}>
                <SortSelect />
              </Suspense>
              <FilterSheet
                filters={collection.collection?.products.filters}
                initialFilters={initialFilters}
              />
            </div>
          </div>
        </div>

        {collection.collection?.products.filters && (
          <Suspense fallback={null}>
            <CollectionFilterBar
              filters={collection.collection.products.filters}
              initialFilters={initialFilters}
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
                    <EmptyDescription>{tCollection('explore')}</EmptyDescription>
                  )}
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <ClientGridWrapper
              key={`${resolvedHandle}-${JSON.stringify(awaitedSearchParams)}`}
              initialPageInfo={pageInfo as PageInfo}
              // @ts-ignore
              initialProducts={productsWithFav as Product[]}
              handle={resolvedHandle}
              sort={sortParam}
            />
          )}
        </div>
      </div>
    </>
  );
};
