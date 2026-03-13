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
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://miomio.com.ua';

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

  // 1. If the handle in the URL is actually for the other locale (Shopify confirmed)
  if (canonicalHandle && resolvedHandle === alternateHandle && resolvedHandle !== canonicalHandle) {
    const targetLocale = locale === 'ru' ? 'uk' : 'ru';
    redirect(`/${targetLocale}/${gender}/${resolvedHandle}`);
  }

  // 2. SEO REDIRECT: If the requested handle is not canonical for current locale (e.g. old handle)
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

  const rawProducts =
    collection.collection?.products.edges
      .map((edge) => edge.node)
      .filter(
        (edge) =>
          ((edge.priceRange?.minVariantPrice?.amount && Number(edge.priceRange.minVariantPrice.amount) > 0) ||
            (edge.priceRange?.maxVariantPrice?.amount && Number(edge.priceRange.maxVariantPrice.amount) > 0)) &&
          (edge.totalInventory === null || edge.totalInventory === undefined || edge.totalInventory > 0),
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
            {collection.collection?.description && (
              <h2 className="text-sm text-muted-foreground font-normal">
                {collection.collection.description}
              </h2>
            )}
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
            />
          )}
        </div>
      </div>
    </>
  );
};
