'use server';

import { getCollection } from '@entities/collection/api/getCollection';
import { PageInfo } from '@shared/lib/shopify/types/storefront.types';
import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@shared/lib/prisma';

export async function getCollectionProducts({
  info,
  slug,
  locale,
  searchParams,
  gender,
}: {
  info?: PageInfo;
  slug: string;
  locale: string;
  searchParams?: { [key: string]: string | string[] | undefined };
  gender?: string;
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
  const pageInfo = collectionData.collection?.collection?.products.pageInfo;
  const rawProducts = collection.collection?.products.edges.map(
    (edge) => edge.node,
  ) ?? [];

  // Batch check favorites
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

  const products = rawProducts.map((product) => ({
    ...product,
    isFav: favoriteProductIds.has(product.id),
  }));

  return {
    products,
    pageInfo,
  };
}
