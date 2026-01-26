'use server';
import { prisma } from '@shared/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';
import { Session, User } from 'better-auth';

export const toggleFavoriteProduct = async (
  productId: string,
  session: { session: Session; user: User } | null,
  locale: string,
  handle?: string,
) => {
  if (!session?.user?.id) {
    return { success: false, error: 'AUTH_REQUIRED' };
  }

  const userId = session.user.id;

  try {
    const existingFavorite = await prisma.favoriteProduct.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    let isFavorited: boolean;

    if (existingFavorite) {
      await prisma.favoriteProduct.delete({
        where: { id: existingFavorite.id },
      });
      isFavorited = false;
    } else {
      await prisma.favoriteProduct.create({ data: { userId, productId } });
      isFavorited = true;
    }

    revalidateTag('favorites', { expire: 0 });
    revalidateTag(`favorite-${userId}`, { expire: 0 });
    revalidateTag(`product-${productId}`, { expire: 0 });
    revalidatePath(`/${locale}/favorites`, 'page');
    if (handle) {
      revalidatePath(`/${locale}/product/${handle}`, 'page');
    }

    return { success: true, isFavorited };
  } catch (error) {
    console.error('TOGGLE_FAVORITE_ERROR:', error);
    return { success: false, error: 'DB_ERROR' };
  }
};
