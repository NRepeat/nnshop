import { getCollection } from '@entities/collection/api/getCollection';
import { notFound } from 'next/navigation';
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
import { FilterSheet } from './FilterSheet';
import { ActiveFiltersCarousel } from './ActiveFiltersCarousel';
import { SortSelect } from './SortSelect';
import { SearchParams } from '~/app/[locale]/(frontend)/collection/[slug]/page';
import { cookies, headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PathSync } from '@entities/path-sync/ui/path-sync';
import { isProductFavorite } from '@features/product/api/isProductFavorite';
import { auth } from '@features/auth/lib/auth';
export const CollectionGrid = async ({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<SearchParams>;
}) => {
  const [awaitedParams, awaitedSearchParams, cookieStore, t] =
    await Promise.all([
      params,
      searchParams,
      cookies(),
      getTranslations('Header'),
    ]);
  const { locale, slug } = awaitedParams;
  setRequestLocale(locale);
  const gender = cookieStore.get('gender')?.value || 'woman';
  const hasFilters = Object.keys(awaitedSearchParams).length > 0;

  const collectionPromises = [
    getCollection({
      handle: slug,
      first: 20,
      locale: locale,
      searchParams: awaitedSearchParams,
    }),
  ];

  if (hasFilters) {
    collectionPromises.push(
      getCollection({ handle: slug, first: 20, locale: locale }),
    );
  }

  const [currentData, initialData] = await Promise.all(collectionPromises);

  if (!currentData?.collection) {
    return notFound();
  }

  const { collection, alternateHandle } = currentData;
  const rawProducts =
    collection.collection?.products.edges
      .map((edge) => edge.node)
      .filter(
        (edge) =>
          Number(edge.priceRange.minVariantPrice.amount) > 0 ||
          Number(edge.priceRange.maxVariantPrice.amount) > 0,
      ) || [];
  console.log('🚀 ~ CollectionGrid ~ rawProducts:', rawProducts);

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

  const targetLocale = locale === 'ru' ? 'uk' : 'ru';
  const paths = {
    [locale]: `/collection/${slug}`,
    [targetLocale]: `/collection/${alternateHandle}`,
  };

  // const products = collection.collection?.products.edges.map(
  //   (edge) => edge.node,
  // );
  const pageInfo = collection.collection?.products.pageInfo;

  return (
    <>
      <PathSync paths={paths} />
      <div className="pl-2 md:pl-5 flex flex-col gap-4 md:gap-8 mt-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${locale}`}>
                {t('nav.home')}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>
                {gender === 'man' ? t('nav.man') : t('nav.woman')}
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
