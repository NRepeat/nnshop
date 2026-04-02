'use server';

import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@shared/lib/prisma';

export async function getFavoriteProductIds(productIds: string[]): Promise<string[]> {
  if (!productIds.length) return [];
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return [];
  const isAnonymous = (session.user as (typeof session.user & { isAnonymous?: boolean }))?.isAnonymous;
  if (isAnonymous) return [];
  const favorites = await prisma.favoriteProduct.findMany({
    where: { userId: session.user.id, productId: { in: productIds } },
    select: { productId: true },
    cacheStrategy: { ttl: 60, swr: 120 },
  } as any);
  return favorites.map((f) => f.productId);
}
