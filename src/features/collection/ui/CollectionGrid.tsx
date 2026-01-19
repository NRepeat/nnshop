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
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';

export const CollectionGrid = async ({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<SearchParams>;
}) => {
  const { locale, slug } = await params;
  const t = await getTranslations('Header');
  const cookie = await cookies();
  const gender = cookie.get('gender')?.value || 'woman';
  const awaitedSearchParams = await searchParams;
  const collectionData = await getCollection({
    handle: slug,
    first: 20,
    locale: locale,
    searchParams: awaitedSearchParams,
  });
  const initialCollection = await getCollection({
    handle: slug,
    first: 20,
    locale: locale,
  });
  if (!collectionData) {
    return notFound();
  }
  const collection = collectionData.collection;

  if (!collection) {
    return notFound();
  }
  const pageInfo = collectionData.collection?.products.pageInfo;
  const products = collection.products.edges.map((edge) => edge.node);
  const currentSort = awaitedSearchParams.sort as string | undefined;
  const initialFilters = initialCollection.collection?.products.filters;
  console.log(initialFilters);

  return (
    <div className="pl-2 md:pl-5 flex flex-col gap-4 md:gap-8 mt-8">
      <Breadcrumb className="">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${locale}`}>{t('nav.home')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>
              {gender === 'man'
                ? t('nav.collections.forMan.title')
                : t('nav.collections.forWoman.title')}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{collection?.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full border-b border-muted pb-4 flex flex-col lg:flex-row   justify-between lg:items-end gap-6">
        <div className="flex flex-col gap-3.5 w-full">
          <h2 className="text-2xl font-bold">{collection?.title}</h2>
          <ActiveFiltersCarousel filters={collection.products.filters} />
        </div>
        <div className="flex h-full items-end flex-row gap-2 justify-between md:justify-end ">
          <SortSelect defaultValue={currentSort} />
          <FilterSheet
            filters={collection.products.filters}
            initialFilters={initialFilters}
          />
        </div>
      </div>
      <div className="flex justify-between  gap-8   h-full">
        <ClientGridWrapper
          initialPageInfo={pageInfo as PageInfo}
          initialProducts={products as Product[]}
        />
      </div>
    </div>
  );
};
