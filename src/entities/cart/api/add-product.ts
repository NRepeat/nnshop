'use server';
import { auth } from '@features/auth/lib/auth';
import createCart from './create';
import { headers } from 'next/headers';
import { prisma } from '@shared/lib/prisma';
import linkProduct from './link-product';
import { revalidateTag } from 'next/cache';
import { CART_TAGS } from '@shared/lib/cached-fetch';
import { storefrontClient } from '@shared/lib/shopify/client';

const CART_LINES_FOR_VARIANT = `#graphql
  query CartLinesForVariant($id: ID!) {
    cart(id: $id) {
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant { id }
            }
          }
        }
      }
    }
  }
`;

const CART_LINES_UPDATE = `#graphql
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id totalQuantity }
      userErrors { field message }
    }
  }
`;

export async function addToCartAction(productVariantId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return {
        success: false,
        error: 'No session found. Please refresh the page and try again.',
      };
    }

    const sessionCart = await prisma.cart.findFirst({
      where: { userId: session.user.id, completed: false },
    });

    let result;
    if (sessionCart) {
      // Check if variant already exists in cart — increment instead of duplicate
      const cartData = await storefrontClient.request<any, any>({
        query: CART_LINES_FOR_VARIANT,
        variables: { id: sessionCart.cartToken },
        cache: 'no-store',
      });
      const existingLine = cartData?.cart?.lines?.edges?.find(
        (e: any) => e.node.merchandise?.id === productVariantId,
      );

      if (existingLine) {
        const updated = await storefrontClient.request<any, any>({
          query: CART_LINES_UPDATE,
          variables: {
            cartId: sessionCart.cartToken,
            lines: [
              {
                id: existingLine.node.id,
                quantity: existingLine.node.quantity + 1,
              },
            ],
          },
        });
        if (updated?.cartLinesUpdate?.userErrors?.length) {
          return {
            success: false,
            error: updated.cartLinesUpdate.userErrors[0].message,
          };
        }
        revalidateTag(CART_TAGS.CART, { expire: 0 });
        revalidateTag(CART_TAGS.CART_ITEMS, { expire: 0 });
        return { success: true, cart: updated.cartLinesUpdate.cart };
      }

      result = await linkProduct({
        cartId: sessionCart.cartToken,
        quantity: 1,
        productVariantId,
      });
      if (result.success) {
        revalidateTag(CART_TAGS.CART, { expire: 0 });
        revalidateTag(CART_TAGS.CART_ITEMS, { expire: 0 });
        return { success: true, cart: result.cart };
      }
    } else {
      result = await createCart({
        merchandiseId: productVariantId,
        quantity: 1,
        buyerIdentity: { email: session.user.email },
      });
    }

    if (result.success) {
      revalidateTag(CART_TAGS.CART, { expire: 0 });
      revalidateTag(CART_TAGS.CART_ITEMS, { expire: 0 });
      return { success: true, cart: result.cart };
    }

    return { success: false, error: 'Failed to add to cart' };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Error adding to cart' };
  }
}
