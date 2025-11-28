'use server';

import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

export const toggleFavoriteProduct = async (productId: string) => {
  console.log('toggleFavoriteProduct', productId);
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    console.error('SESSION NOT FOUND');
    return {
      success: false,
      errors: ['Session not found'],
    };
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return {
      success: false,
      errors: ['User not found'],
    };
  }

  const existingFavorite = await prisma.favoriteProduct.findUnique({
    where: {
      userId_productId: {
        userId: user.id,
        productId,
      },
    },
  });

  if (existingFavorite) {
    await prisma.favoriteProduct.delete({
      where: {
        id: existingFavorite.id,
      },
    });
    revalidatePath('/favorite');
    return {
      success: true,
      isFavorited: false,
    };
  } else {
    await prisma.favoriteProduct.create({
      data: {
        userId: user.id,
        productId,
      },
    });
    revalidatePath('/favorite');
    return {
      success: true,
      isFavorited: true,
    };
  }
};
