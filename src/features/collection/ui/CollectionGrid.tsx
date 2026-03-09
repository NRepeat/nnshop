import { getCollection } from '@entities/collection/api/getCollection';
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
import { CollectionFilterBar } from './CollectionFilterBar';
import { FilterSheet } from './FilterSheet';
import { SortSelect } from './SortSelect';
import { ActiveFiltersCarousel } from './ActiveFiltersCarousel';
import { EnableScrollHide } from '@shared/ui/EnableScrollHide';
import { SearchParams } from '~/app/[locale]/(frontend)/(home)/[gender]/(collection)/[slug]/page';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { PathSync } from '@entities/path-sync/ui/path-sync';
import { auth } from '@features/auth/lib/auth';
import { JsonLd } from '@shared/ui/JsonLd';
import { generateBreadcrumbJsonLd } from '@shared/lib/seo/jsonld/breadcrumb';
import { prisma } from '@shared/lib/prisma';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://miomio.com.ua';

const GENDERED_HANDLES = new Set([
  'ryukzaky-cholovichi',
  'sumky-cholovichi',
  'tufli-cholovichi',
  'golovni-ubory-zhinochi',
  'shtany-ta-bryuky-zhinochi',
  'svitshoty-ta-kofty-cholovichi',
  'dzhynsy-cholovichi',
  'pidzhaky-zhinochi',
  'verhnij-odyag-zhinocha',
  'svetry-ta-dzhempery-cholovichi',
  'shorty-cholovichi',
  'verhnij-odyag-cholovicha',
  'krosivky-ta-kedy-cholovichi',
  'zhinoche-vzuttya',
  'choloviche-vzuttya',
  'zhinochyj-odyag',
  'cholovichyj-odyag',
]);

const GENDER_SUFFIXES: Record<string, string[]> = {
  man: ['cholovichi', 'cholovicha', 'cholovichyj', 'choloviche'],
  woman: ['zhinochi', 'zhinocha', 'zhinochyj', 'zhinoche'],
};

function resolveCollectionHandle(slug: string, gender: string): string {
  const suffixes = GENDER_SUFFIXES[gender] || [];
  for (const suffix of suffixes) {
    const withSuffix = `${slug}-${suffix}`;
    if (GENDERED_HANDLES.has(withSuffix)) return withSuffix;
    const withPrefix = `${suffix}-${slug}`;
    if (GENDERED_HANDLES.has(withPrefix)) return withPrefix;
  }
  return slug;
}

export const CollectionGrid = async ({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string; gender: string }>;
  searchParams: Promise<SearchParams>;
}) => {
  const [awaitedParams, awaitedSearchParams, t] = await Promise.all([
    params,
    searchParams,
    getTranslations('Header'),
  ]);
  const { locale, slug, gender } = awaitedParams;
  const hasFilters = Object.keys(awaitedSearchParams).length > 0;
  const resolvedHandle = resolveCollectionHandle(slug, gender);

  const [sanityCollection, currentData, session] = await Promise.all([
    sanityFetch({
      query: COLLECTION_IS_BRAND_QUERY,
      params: { handle: resolvedHandle },
      tags: [`collection:${resolvedHandle}`],
    }),
    getCollection({
      handle: resolvedHandle,
      first: 21,
      locale: locale,
      searchParams: awaitedSearchParams,
    }),
    auth.api.getSession({ headers: await headers() }),
  ]);

  if (sanityCollection?.isBrand) {
    redirect(`/${locale}/brand/${resolvedHandle}`);
  }

  if (!currentData?.collection) {
    return notFound();
  }

  const { collection, alternateHandle } = currentData;
  const displayTitle =
    sanityCollection?.customTitle?.[locale as 'uk' | 'ru'] ||
    collection.collection?.title;

  const rawProducts =
    collection.collection?.products.edges
      .map((edge) => edge.node)
      .filter(
        (edge) =>
          Number(edge.priceRange.minVariantPrice.amount) > 0 ||
          Number(edge.priceRange.maxVariantPrice.amount) > 0,
      ) || [];

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

  const productsWithFav = rawProducts.map((product) => ({
    ...product,
    isFav: favoriteProductIds.has(product.id),
  }));

  // Only fetch initialData if we actually have filters to avoid extra request
  let initialFilters = collection.collection?.products.filters;
  if (hasFilters) {
    const initialData = await getCollection({
      handle: resolvedHandle,
      first: 1, // Minimize payload since we only need filters
      locale: locale,
    });
    initialFilters = initialData?.collection?.collection?.products.filters;
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
              <BreadcrumbLink href={`/`}>{t('nav.home')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${gender}`}>
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
            <h1 className="text-2xl font-bold">{displayTitle}</h1>
            {/* {collection.collection?.description && (
              <p className="text-gray-600 text-sm max-w-full">
                {collection.collection.description}
              </p>
            )} */}
            {collection.collection?.products.filters && (
              <Suspense fallback={null}>
                <ActiveFiltersCarousel
                  filters={collection.collection.products.filters}
                />
              </Suspense>
            )}
          </div>
          <div className="flex h-full items-end flex-row gap-2 justify-between md:justify-end">
            <Suspense fallback={null}>
              <SortSelect defaultValue={awaitedSearchParams.sort as string} />
            </Suspense>
            <FilterSheet
              filters={collection.collection?.products.filters}
              initialFilters={initialFilters}
            />
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
          <ClientGridWrapper
            initialPageInfo={pageInfo as PageInfo}
            // @ts-ignore
            initialProducts={productsWithFav as Product[]}
            handle={resolvedHandle}
          />
        </div>
      </div>
    </>
  );
};
