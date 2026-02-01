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
      userErrors{
        message
      }
    }
  }
`;

// --- Helper Functions ---

async function updateShopifyBuyerIdentity(cartId: string, email: string) {
  const response = await storefrontClient.request<
    LinkCartBuyerIdentityUpdateMutation,
    LinkCartBuyerIdentityUpdateMutationVariables
  >({
    query: CART_BUYER_IDENTITY_UPDATE,
    variables: { cartId, buyerIdentity: { email } },
  });
  if (
    response.cartBuyerIdentityUpdate &&
    response.cartBuyerIdentityUpdate?.userErrors?.length > 0
  ) {
    throw new Error(response.cartBuyerIdentityUpdate.userErrors[0].message);
  }
  return response.cartBuyerIdentityUpdate?.cart?.id;
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
    await prisma.$transaction(async (tx) => {
      const anonCartRecord = await tx.cart.findFirst({
        where: { userId: anonymousUser.user.id, completed: false },
      });

      if (!anonCartRecord) return;

      const userCartRecord = await tx.cart.findFirst({
        where: { userId: newUser.user.id, completed: false },
      });

      let finalCartToken = anonCartRecord.cartToken;

      if (userCartRecord) {
        // --- СЦЕНАРИЙ СЛИЯНИЯ (Merge) ---

        // 2. Получаем товары из анонимной корзины в Shopify
        const { cart: anonShopifyCart } = await storefrontClient.request<
          LinkGetCartQuery,
          LinkGetCartQueryVariables
        >({
          query: GET_CART_QUERY,

          variables: { cartId: anonCartRecord.cartToken.split('?')[0] },
        });

        if (
          anonShopifyCart?.lines?.nodes &&
          anonShopifyCart?.lines?.nodes?.length > 0
        ) {
          const linesToAdd = anonShopifyCart.lines.nodes.map((node: any) => ({
            merchandiseId: node.merchandise.id,
            quantity: node.quantity,
          }));

          // 3. Добавляем товары в уже существующую корзину пользователя
          const addLinesResponse = await storefrontClient.request<
            LinkCartLinesAddMutation,
            LinkCartLinesAddMutationVariables
          >({
            query: CART_LINES_ADD_MUTATION,
            variables: {
              cartId: userCartRecord.cartToken,
              lines: linesToAdd,
            },
          });

          if (
            addLinesResponse.cartLinesAdd &&
            addLinesResponse.cartLinesAdd?.userErrors?.length > 0
          ) {
            throw new Error('Failed to merge cart lines');
          }
          if (addLinesResponse.cartLinesAdd?.cart?.id) {
            finalCartToken = addLinesResponse.cartLinesAdd?.cart?.id;
          }
        }

        const updateShopifyBuyerIdentityCartToken =
          await updateShopifyBuyerIdentity(finalCartToken, newUser.user.email);
        if (updateShopifyBuyerIdentityCartToken) {
          finalCartToken = updateShopifyBuyerIdentityCartToken;
        }

        await tx.cart.update({
          where: { id: userCartRecord.id },
          data: { cartToken: finalCartToken },
        });
        await tx.cart.delete({ where: { id: anonCartRecord.id } });
      } else {
        const updateShopifyBuyerIdentityCartToken =
          await updateShopifyBuyerIdentity(
            anonCartRecord.cartToken.split('?')[0],
            newUser.user.email,
          );
        if (updateShopifyBuyerIdentityCartToken) {
          finalCartToken = updateShopifyBuyerIdentityCartToken;
        }

        // 2. Меняем владельца корзины в нашей БД
        await tx.cart.update({
          where: { id: anonCartRecord.id },
          data: {
            userId: newUser.user.id,
            cartToken: finalCartToken,
          },
        });
      }
    });
  } catch (error) {
    console.error('Cart Merge Error:', error);
    throw new Error('An error occurred while merging your shopping cart');
  }
};
