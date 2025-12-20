import { getCollection } from '@entities/collection/api/getCollection';
import { cacheLife } from 'next/dist/server/use-cache/cache-life';
import { notFound } from 'next/navigation';
import { ClientGridWrapper } from './ClientGridWrapper';
import { PageInfo, Product } from '@shared/lib/shopify/types/storefront.types';

export const CollectionGrid = async ({
  slug,
  locale,
}: {
  slug: string;
  locale: string;
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
    <ClientGridWrapper
      initialPageInfo={pageInfo as PageInfo}
      initialProducts={products as Product[]}
    />
  );
};
