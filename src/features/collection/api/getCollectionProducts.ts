'use cache';

import { getCollection } from '@entities/collection/api/getCollection';
import { PageInfo } from '@shared/lib/shopify/types/storefront.types';

export async function getCollectionProducts({
  info,
  slug,
  locale,
  searchParams,
}: {
  info?: PageInfo;
  slug: string;
  locale: string;
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const collectionData = await getCollection({
    handle: slug,
    first: 20,
    locale: locale,
    after: info?.endCursor || undefined,
    searchParams: searchParams,
  });
  if (!collectionData) {
    throw new Error('Collection not found');
  }
  const collection = collectionData.collection;

  if (!collection) {
    throw new Error('Collection not found');
  }
  const pageInfo = collectionData.collection?.products.pageInfo;
  const products = collection.products.edges.map((edge) => edge.node);
  return {
    products,
    pageInfo,
  };
}
