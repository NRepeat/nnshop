import { prisma } from '@shared/lib/prisma';
import { Session, User } from 'better-auth';
// import { cacheTag } from 'next/cache';

export const isProductFavorite = async (
  productId: string,
  session: { session: Session; user: User } | null,
): Promise<boolean> => {
  // 'use cache';

  // cacheTag('favorites');
  // if (session?.user?.id) {
  //   cacheTag(`favorite-${session.user.id}`);
  //   cacheTag(`product-${productId}`);
  // }

  if (!session || !session.user) {
    return false;
  }

  const existingFavorite = await prisma.favoriteProduct.findUnique({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId,
      },
    },
  });

  
  return !!existingFavorite;
};
