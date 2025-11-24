'use server';
import { auth } from '@features/auth/lib/auth';
import createCart from './create';
import { headers } from 'next/headers';
import { prisma } from '@shared/lib/prisma';
import linkProduct from './link-product';
import { revalidateTag } from 'next/cache';
import { CART_TAGS } from '@shared/lib/cached-fetch';

export async function addToCartAction(productVariantId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      throw new Error('Session not found');
    }
    const sessionCart = await prisma.cart.findUnique({
      where: {
        userId: session.user.id,
        completed: false,
      },
    });
    let result;
    if (sessionCart) {
      result = await linkProduct({
        cartId: sessionCart.cartToken,
        quantity: 1,
        productVariantId,
      });
      if (result.success) {
        revalidateTag(CART_TAGS.CART);
        revalidateTag(CART_TAGS.CART_ITEMS);
        return { success: true, cart: result.cart };
      }
    } else {
      result = await createCart({
        merchandiseId: productVariantId,
        quantity: 1,
        buyerIdentity: {
          email: session.user.email,
        },
      });
    }

    if (result.success) {
      revalidateTag(CART_TAGS.CART);
      revalidateTag(CART_TAGS.CART_ITEMS);
      return { success: true, cart: result.cart };
    }

    return { success: false, error: 'Failed to add to cart' };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Error adding to cart' };
  }
}
