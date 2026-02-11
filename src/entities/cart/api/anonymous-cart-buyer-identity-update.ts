'use server';

import { prisma } from '../../../shared/lib/prisma';
import { storefrontClient } from '../../../shared/lib/shopify/client';

import { Session, User } from 'better-auth';
import {
  LinkCartBuyerIdentityUpdateMutation,
  LinkCartBuyerIdentityUpdateMutationVariables,
  LinkCartLinesAddMutation,
  LinkCartLinesAddMutationVariables,
  LinkGetCartQuery,
  LinkGetCartQueryVariables,
} from '@shared/lib/shopify/types/storefront.generated';

export type UserWithAnonymous = User & { isAnonymous: boolean };

const GET_CART_QUERY = `#graphql
  query LinkGetCart($cartId: ID!) {
    cart(id: $cartId) {
      lines(first: 100) {
        nodes {
          merchandise {
            ... on ProductVariant { id }
          }
          quantity
        }
      }
    }

  }
`;

const CART_LINES_ADD_MUTATION = `#graphql
  mutation LinkCartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { id }
      userErrors { field message }
    }
  }
`;

const CART_BUYER_IDENTITY_UPDATE = `#graphql
  mutation LinkCartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart { id }
      userErrors { field message }
    }
  }
`;

// --- Helper Functions ---

async function updateShopifyBuyerIdentity(
  cartId: string,
  email: string,
): Promise<string | null> {
  try {
    const response = await storefrontClient.request<
      LinkCartBuyerIdentityUpdateMutation,
      LinkCartBuyerIdentityUpdateMutationVariables
    >({
      query: CART_BUYER_IDENTITY_UPDATE,
      variables: { cartId, buyerIdentity: { email } },
    });
    if (
      response.cartBuyerIdentityUpdate?.userErrors?.length &&
      response.cartBuyerIdentityUpdate.userErrors.length > 0
    ) {
      console.error(
        'Shopify buyerIdentityUpdate error:',
        response.cartBuyerIdentityUpdate.userErrors[0].message,
      );
      return null;
    }
    return response.cartBuyerIdentityUpdate?.cart?.id || null;
  } catch (error) {
    console.error('updateShopifyBuyerIdentity failed:', error);
    return null;
  }
}

async function getShopifyCartLines(cartId: string) {
  try {
    const { cart } = await storefrontClient.request<
      LinkGetCartQuery,
      LinkGetCartQueryVariables
    >({
      query: GET_CART_QUERY,
      variables: { cartId: cartId.split('?')[0] },
    });
    return cart?.lines?.nodes || [];
  } catch (error) {
    console.error('getShopifyCartLines failed:', error);
    return [];
  }
}

async function addLinesToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[],
): Promise<string | null> {
  try {
    const response = await storefrontClient.request<
      LinkCartLinesAddMutation,
      LinkCartLinesAddMutationVariables
    >({
      query: CART_LINES_ADD_MUTATION,
      variables: { cartId, lines },
    });
    if (
      response.cartLinesAdd?.userErrors?.length &&
      response.cartLinesAdd.userErrors.length > 0
    ) {
      console.error(
        'Shopify cartLinesAdd error:',
        response.cartLinesAdd.userErrors[0].message,
      );
      return null;
    }
    return response.cartLinesAdd?.cart?.id || null;
  } catch (error) {
    console.error('addLinesToCart failed:', error);
    return null;
  }
}

// --- Main Function ---

export const anonymousCartBuyerIdentityUpdate = async ({
  newUser,
  anonymousUser,
}: {
  anonymousUser: {
    user: UserWithAnonymous & Record<string, any>;
    session: Session & Record<string, any>;
  };
  newUser: {
    user: User & Record<string, any>;
    session: Session & Record<string, any>;
  };
}) => {
  console.log('[cartBuyerIdentityUpdate] START', {
    anonymousUserId: anonymousUser.user.id,
    newUserId: newUser.user.id,
    newUserEmail: newUser.user.email,
  });
  try {
    const anonCartRecord = await prisma.cart.findFirst({
      where: { userId: anonymousUser.user.id, completed: false },
    });
    console.log('[cartBuyerIdentityUpdate] Anon cart:', anonCartRecord ? { id: anonCartRecord.id, cartToken: anonCartRecord.cartToken.substring(0, 30) + '...' } : null);

    if (!anonCartRecord) {
      console.log('[cartBuyerIdentityUpdate] No anonymous cart found, skipping');
      return;
    }

    const userCartRecord = await prisma.cart.findFirst({
      where: { userId: newUser.user.id, completed: false },
    });
    console.log('[cartBuyerIdentityUpdate] User cart:', userCartRecord ? { id: userCartRecord.id } : null);

    let finalCartToken = anonCartRecord.cartToken;

    if (userCartRecord) {
      console.log('[cartBuyerIdentityUpdate] Merge scenario: user already has a cart');
      const anonLines = await getShopifyCartLines(anonCartRecord.cartToken);
      console.log('[cartBuyerIdentityUpdate] Anon cart lines:', anonLines.length);

      if (anonLines.length > 0) {
        const linesToAdd = anonLines.map((node: any) => ({
          merchandiseId: node.merchandise.id,
          quantity: node.quantity,
        }));

        const mergedCartId = await addLinesToCart(
          userCartRecord.cartToken,
          linesToAdd,
        );
        console.log('[cartBuyerIdentityUpdate] Merged cart ID:', mergedCartId);
        if (mergedCartId) {
          finalCartToken = mergedCartId;
        }
      }

      const updatedCartId = await updateShopifyBuyerIdentity(
        finalCartToken,
        newUser.user.email,
      );
      console.log('[cartBuyerIdentityUpdate] Updated buyer identity:', updatedCartId);
      if (updatedCartId) {
        finalCartToken = updatedCartId;
      }

      await prisma.cart.update({
        where: { id: userCartRecord.id },
        data: { cartToken: finalCartToken },
      });
      await prisma.cart.delete({ where: { id: anonCartRecord.id } });
      console.log('[cartBuyerIdentityUpdate] Merge complete, anon cart deleted');
    } else {
      console.log('[cartBuyerIdentityUpdate] No existing user cart, reassigning anonymous cart');
      const updatedCartId = await updateShopifyBuyerIdentity(
        anonCartRecord.cartToken.split('?')[0],
        newUser.user.email,
      );
      console.log('[cartBuyerIdentityUpdate] Updated buyer identity:', updatedCartId);
      if (updatedCartId) {
        finalCartToken = updatedCartId;
      }

      await prisma.cart.update({
        where: { id: anonCartRecord.id },
        data: {
          userId: newUser.user.id,
          cartToken: finalCartToken,
        },
      });
      console.log('[cartBuyerIdentityUpdate] Anonymous cart reassigned to new user');
    }
    console.log('[cartBuyerIdentityUpdate] DONE');
  } catch (error) {
    console.error('[cartBuyerIdentityUpdate] ERROR:', error);
  }
};
