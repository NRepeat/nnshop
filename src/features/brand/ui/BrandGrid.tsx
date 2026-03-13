import { getCollection } from '@entities/collection/api/getCollection';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@shared/ui/empty';
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
import { headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { decodeHtmlEntities } from '@shared/lib/utils/decodeHtmlEntities';
import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';

export type SearchParams = { [key: string]: string | string[] | undefined };

export const BrandGrid = async ({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<SearchParams>;
}) => {
  const [awaitedParams, awaitedSearchParams, t, tBrands, tCollection] = await Promise.all([
    params,
    searchParams,
    getTranslations('Header'),
    getTranslations('BrandsPage'),
    getTranslations('CollectionPage'),
  ]);

  const { locale, slug } = awaitedParams;
  const decodedSlug = decodeURIComponent(slug);
  setRequestLocale(locale);

  const cookieStore = await headers();
  const cookieHeader = cookieStore.get('cookie') || '';
  const genderFromCookie = cookieHeader.includes('gender=man') ? 'man' : cookieHeader.includes('gender=woman') ? 'woman' : undefined;

  const gender = (awaitedSearchParams._gender as string | undefined) || genderFromCookie;
  const searchParamsWithoutGender = Object.fromEntries(
    Object.entries(awaitedSearchParams).filter(([k]) => k !== '_gender'),
  );
  const hasFilters = Object.keys(searchParamsWithoutGender).length > 0;

  const collectionPromises = [
    getCollection({
      handle: decodedSlug,
      first: 20,
      locale: locale,
      searchParams: searchParamsWithoutGender,
      gender,
    }),
  ];

  if (hasFilters) {
    collectionPromises.push(
      getCollection({ handle: decodedSlug, first: 20, locale: locale, gender }),
    );
  }

  const [currentData, initialData] = await Promise.all(collectionPromises);

  if (!currentData?.collection?.collection) {
    return notFound();
  }

  const { collection } = currentData;
  const rawProducts =
    collection.collection?.products.edges
      .map((edge) => edge.node)
      .filter(
        (edge) =>
          Number(edge.priceRange.minVariantPrice.amount) > 0 ||
          Number(edge.priceRange.maxVariantPrice.amount) > 0,
      ) || [];

  const session = await auth.api.getSession({ headers: await headers() });
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

  const initialFilters = hasFilters
    ? initialData?.collection?.collection?.products.filters
    : collection.collection?.products.filters;

  const pageInfo = collection.collection?.products.pageInfo;

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
            {gender ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/${locale}/${gender}`}>
                    {gender === 'man' ? t('nav.man') : t('nav.woman')}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            ) : (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/${locale}/brands`}>
                    {tBrands('title')}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage>
                {decodeHtmlEntities(collection.collection?.title ?? '')}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <EnableScrollHide />

        <div className="w-full border-b border-muted pb-4 flex flex-col lg:flex-row justify-between lg:items-end gap-6">
          <div className="flex flex-col gap-3.5 w-full">
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
          <div className="flex h-full  items-center flex-row gap-2 justify-between md:justify-end">
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
                    <EmptyDescription>{tCollection('explore')}</EmptyDescription>
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
              gender={gender}
            />
          )}
        </div>
      </div>
    </>
  );
};
