'use server';
import { prisma } from '@shared/lib/prisma';
import { Session, User } from 'better-auth';

export const isProductFavorite = async (
  productId: string,
  session: { session: Session; user: User } | null,
): Promise<boolean> => {
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
