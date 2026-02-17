import { getCollection } from '@entities/collection/api/getCollection';
import { notFound } from 'next/navigation';
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
import { FilterSheet } from '@features/collection/ui/FilterSheet';
import { ActiveFiltersCarousel } from '@features/collection/ui/ActiveFiltersCarousel';
import { SortSelect } from '@features/collection/ui/SortSelect';
import { headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { isProductFavorite } from '@features/product/api/isProductFavorite';
import { auth } from '@features/auth/lib/auth';

export type SearchParams = { [key: string]: string | string[] | undefined };

export const BrandGrid = async ({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<SearchParams>;
}) => {
  const [awaitedParams, awaitedSearchParams, t, tBrands] = await Promise.all([
    params,
    searchParams,
    getTranslations('Header'),
    getTranslations('BrandsPage'),
  ]);

  const { locale, slug } = awaitedParams;
  const decodedSlug = decodeURIComponent(slug);
  setRequestLocale(locale);

  const hasFilters = Object.keys(awaitedSearchParams).length > 0;

  const collectionPromises = [
    getCollection({
      handle: decodedSlug,
      first: 18,
      locale: locale,
      searchParams: awaitedSearchParams,
    }),
  ];

  if (hasFilters) {
    collectionPromises.push(
      getCollection({ handle: decodedSlug, first: 18, locale: locale }),
    );
  }

  const [currentData, initialData] = await Promise.all(collectionPromises);

  if (!currentData?.collection) {
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
  const productsWithFav = await Promise.all(
    rawProducts.map(async (product) => {
      const isFav = await isProductFavorite(product.id, session);
      return {
        ...product,
        isFav,
      };
    }),
  );

  const initialFilters = hasFilters
    ? initialData?.collection?.collection?.products.filters
    : collection.collection?.products.filters;

  const pageInfo = collection.collection?.products.pageInfo;

  return (
    <>
      <div className=" flex flex-col gap-4 md:gap-8 mt-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${locale}`}>
                {t('nav.home')}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${locale}/brands`}>
                {tBrands('title')}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{collection.collection?.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="w-full border-b border-muted pb-4 flex flex-col lg:flex-row justify-between lg:items-end gap-6">
          <div className="flex flex-col gap-3.5 w-full">
            <h2 className="text-2xl font-bold">
              {collection.collection?.title}
            </h2>
            {collection.collection?.description && (
              <p className="text-gray-600 text-sm max-w-3xl">
                {collection.collection?.description}
              </p>
            )}
            {collection.collection?.products.filters && (
              <ActiveFiltersCarousel
                filters={collection.collection?.products.filters}
              />
            )}
          </div>
          <div className="flex h-full items-end flex-row gap-2 justify-between md:justify-end">
            <SortSelect defaultValue={awaitedSearchParams.sort as string} />
            <FilterSheet
              filters={collection.collection?.products.filters}
              initialFilters={initialFilters}
            />
          </div>
        </div>

        <div className="flex justify-between gap-8 h-full">
          <ClientGridWrapper
            initialPageInfo={pageInfo as PageInfo}
            // @ts-ignore
            initialProducts={productsWithFav as Product[]}
          />
        </div>
      </div>
    </>
  );
};
