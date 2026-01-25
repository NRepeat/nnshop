'use server';

import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

export const toggleFavoriteProduct = async (productId: string,handle:string) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return { success: false, error: 'AUTH_REQUIRED' };
  }

  const userId = session.user.id;

  try {
    // Ищем запись по составному индексу
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

    // Очищаем кэш страниц, где может быть этот товар
    revalidatePath('/favorite');
    revalidatePath(`/product/${handle}`);

    return { success: true, isFavorited };
  } catch (error) {
    console.error('TOGGLE_FAVORITE_ERROR:', error);
    return { success: false, error: 'DB_ERROR' };
  }
};
