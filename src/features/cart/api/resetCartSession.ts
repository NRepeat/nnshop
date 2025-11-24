'use server';
import createCart from '@entities/cart/api/create';
import { auth } from '@features/auth/lib/auth';
import { cachedFetch, CART_TAGS } from '@shared/lib/cached-fetch';
import { prisma } from '@shared/lib/prisma';
import { storefrontClient } from '@shared/lib/shopify/client';
import { headers } from 'next/headers';

const UPDATE_CART_QUERY = '';

const resetCartSession = async () => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      console.warn(' Session not found, throwing error.');
      throw new Error('Session not found');
    }
    await prisma.$transaction(async (tx) => {
      const sessionCart = await tx.cart.findUnique({
        where: {
          userId: session.user.id,
        },
      });
      if (!sessionCart) {
        console.warn(
          'Cart not found for userId:',
          session.user.id,
          ', throwing error.',
        );
        throw new Error('Cart not found');
      }
      await tx.cart.update({
        where: {
          id: sessionCart.id,
        },
        data: { completed: true },
      });
    });
  } catch (e) {
    console.error(e);
    throw new Error('Failed to reset cart session');
  }
};

export default resetCartSession;
