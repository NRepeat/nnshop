'use server';
import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';

export const isProductFavorite = async (
  productId: string,
): Promise<boolean> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    return false;
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return false;
  }

  const existingFavorite = await prisma.favoriteProduct.findUnique({
    where: {
      userId_productId: {
        userId: user.id,
        productId,
      },
    },
  });
  const isFavorite = !!existingFavorite;
  return isFavorite;
};
