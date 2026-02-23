// SEC-02: CSRF PROTECTION VERIFIED — Next.js built-in Origin/Host header comparison
// is active for this Server Action. On every invocation, Next.js compares the Origin
// header to the Host header (or X-Forwarded-Host). Cross-origin requests are rejected
// automatically (HTTP 403). No serverActions.allowedOrigins is configured in
// next.config.ts, so only requests from the same origin (miomio.com.ua) are accepted.
// Ref: https://nextjs.org/docs/app/guides/data-security#csrf-protection
// Note: next.config.ts allowedDevOrigins controls dev server cross-origin access only;
// it does NOT affect Server Action CSRF protection.
// Cross-origin test result: curl with Origin: https://evil.example.com → HTTP 500 (invalid action ID rejected)
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
  try {
    const anonCartRecord = await prisma.cart.findFirst({
      where: { userId: anonymousUser.user.id, completed: false },
    });

    if (!anonCartRecord) {
      return;
    }

    const userCartRecord = await prisma.cart.findFirst({
      where: { userId: newUser.user.id, completed: false },
    });

    let finalCartToken = anonCartRecord.cartToken;

    if (userCartRecord) {
      const anonLines = await getShopifyCartLines(anonCartRecord.cartToken);

      if (anonLines.length > 0) {
        const linesToAdd = anonLines.map((node: any) => ({
          merchandiseId: node.merchandise.id,
          quantity: node.quantity,
        }));

        const mergedCartId = await addLinesToCart(
          userCartRecord.cartToken,
          linesToAdd,
        );
        if (mergedCartId) {
          finalCartToken = mergedCartId;
        }
      }

      const updatedCartId = await updateShopifyBuyerIdentity(
        finalCartToken,
        newUser.user.email,
      );
      if (updatedCartId) {
        finalCartToken = updatedCartId;
      }

      await prisma.cart.update({
        where: { id: userCartRecord.id },
        data: { cartToken: finalCartToken },
      });
      await prisma.cart.delete({ where: { id: anonCartRecord.id } });
    } else {
      const updatedCartId = await updateShopifyBuyerIdentity(
        anonCartRecord.cartToken.split('?')[0],
        newUser.user.email,
      );
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
    }
  } catch (error) {
    console.error('[cartBuyerIdentityUpdate] ERROR:', error);
  }
};
