'use server';

import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@shared/lib/prisma';
import { storefrontClient } from '@shared/lib/shopify/client';
import { revalidateTag } from 'next/cache';
import { CART_TAGS } from '@shared/lib/cached-fetch';

const CART_NOTE_UPDATE_MUTATION = `#graphql
  mutation cartNoteUpdate($cartId: ID!, $note: String!) {
    cartNoteUpdate(cartId: $cartId, note: $note) {
      cart {
        id
        note
      }
      userErrors {
        field
        message
      }
    }
  }
`;

type CartNoteUpdateResponse = {
  cartNoteUpdate: {
    cart: {
      id: string;
      note: string;
    } | null;
    userErrors: Array<{
      field: string[];
      message: string;
    }>;
  };
};

export async function updateCartNote(note: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    const sessionCart = await prisma.cart.findFirst({
      where: {
        userId: session.user.id,
        completed: false,
      },
    });

    if (!sessionCart) {
      return { success: false, error: 'Cart not found' };
    }

    const response = await storefrontClient.request<
      CartNoteUpdateResponse,
      { cartId: string; note: string }
    >({
      query: CART_NOTE_UPDATE_MUTATION,
      variables: {
        cartId: sessionCart.cartToken,
        note,
      },
    });

    if (response.cartNoteUpdate.userErrors.length > 0) {
      return {
        success: false,
        error: response.cartNoteUpdate.userErrors[0].message,
      };
    }

    revalidateTag(CART_TAGS.CART, { expire: 0 });
    return { success: true };
  } catch (error) {
    console.error('Error updating cart note:', error);
    return { success: false, error: 'Failed to update cart note' };
  }
}
