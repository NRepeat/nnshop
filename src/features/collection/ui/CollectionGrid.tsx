import { getCollection } from '@entities/collection/api/getCollection';
import { cacheLife } from 'next/dist/server/use-cache/cache-life';
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
export const CollectionGrid = async ({
  slug,
  locale,
  gender,
}: {
  slug: string;
  locale: string;
  gender?: string;
}) => {
  'use cache';
  cacheLife({ revalidate: 60, stale: 60 });
  const collectionData = await getCollection({
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
  return (
    <div className="flex flex-col gap-8 pt-4">
      <Breadcrumb className="px-3.5">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${locale}`}>Головна</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${locale}/collections/${slug}`}>
              {gender === 'man' ? 'Мужчини' : 'Жінки'}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{collection?.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex justify-center  gap-8 px-3.5 pt-4">
        <ClientGridWrapper
          filters={collection.products.filters}
          initialPageInfo={pageInfo as PageInfo}
          initialProducts={products as Product[]}
        />
      </div>
    </div>
  );
};
