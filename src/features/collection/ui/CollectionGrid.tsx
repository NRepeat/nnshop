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
import { SortSelect } from './SortSelect'; // Import SortSelect
export const CollectionGrid = async ({
  slug,
  locale,
  gender,
  searchParams,
}: {
  slug: string;
  locale: string;
  gender?: string;
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const collectionData = await getCollection({
    handle: slug,
    first: 20,
    locale: locale,
    searchParams: searchParams,
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
  const currentSort = searchParams.sort as string | undefined; // Get current sort from searchParams

  return (
    <div className="flex flex-col gap-8 mt-8">
      <Breadcrumb className="">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${locale}`}>Головна</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>
              {gender === 'man' ? 'Мужчини' : 'Жінки'}
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
        <div className="flex h-full items-end flex-row gap-2 justify-end ">
          <SortSelect defaultValue={currentSort} />
          <FilterSheet filters={collection.products.filters} />
        </div>
      </div>
      <div className="flex justify-center  gap-8   h-full">
        <ClientGridWrapper
          initialPageInfo={pageInfo as PageInfo}
          initialProducts={products as Product[]}
        />
      </div>
    </div>
  );
};
