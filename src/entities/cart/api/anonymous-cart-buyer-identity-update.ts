'use server';

import { prisma } from '../../../shared/lib/prisma';
import { storefrontClient } from '../../../shared/lib/shopify/client';

import { Session, User } from 'better-auth';

export type UserWithAnonymous = User & { isAnonymous: boolean };

const GET_CART_QUERY = `
  query getCart($cartId: ID!) {
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

const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { id }
      userErrors { field message }
    }
  }
`;

const CART_BUYER_IDENTITY_UPDATE = `
  mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart { id }
      userErrors { field message }
    }
  }
`;

// --- Helper Functions ---

async function updateShopifyBuyerIdentity(cartId: string, email: string) {
  const response = await storefrontClient.request<any>({
    query: CART_BUYER_IDENTITY_UPDATE,
    variables: { cartId, buyerIdentity: { email } },
  });
  console.log(
    '🚀 ~ updateShopifyBuyerIdentity ~ response:',
    JSON.stringify(response, null, 2),
  );
  if (response.userErrors?.length > 0) {
    throw new Error(response.userErrors[0].message);
  }
  return response.cartBuyerIdentityUpdate.cart.id;
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
      // 1. Ищем обе корзины в нашей БД
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
        const { cart: anonShopifyCart } = await storefrontClient.request<any>({
          query: GET_CART_QUERY,

          variables: { cartId: anonCartRecord.cartToken.split('?')[0] },
        });
        console.log(
          '🚀 ~ anonymousCartBuyerIdentityUpdate ~ anonShopifyCart:',
          JSON.stringify(anonShopifyCart, null, 2),
        );

        if (anonShopifyCart?.lines?.nodes?.length > 0) {
          // Формируем массив товаров для добавления
          const linesToAdd = anonShopifyCart.lines.nodes.map((node: any) => ({
            merchandiseId: node.merchandise.id,
            quantity: node.quantity,
          }));
          console.log(
            '🚀 ~ anonymousCartBuyerIdentityUpdate ~ linesToAdd:',
            linesToAdd,
          );

          // 3. Добавляем товары в уже существующую корзину пользователя
          const addLinesResponse = await storefrontClient.request<any>({
            query: CART_LINES_ADD_MUTATION,
            variables: {
              cartId: userCartRecord.cartToken,
              lines: linesToAdd,
            },
          });
          console.log(
            '🚀 ~ anonymousCartBuyerIdentityUpdate ~ addLinesResponse:',
            JSON.stringify(addLinesResponse, null, 2),
          );

          if (addLinesResponse.userErrors?.length > 0) {
            throw new Error('Failed to merge cart lines');
          }
          finalCartToken = addLinesResponse.cartLinesAdd.cart.id;
        }

        finalCartToken = await updateShopifyBuyerIdentity(
          finalCartToken,
          newUser.user.email,
        );
        console.log(
          '🚀 ~ anonymousCartBuyerIdentityUpdate ~ finalCartToken:',
          finalCartToken,
          userCartRecord,
        );

        // 5. Удаляем анонимную корзину из БД, так как товары перенесены

        await tx.cart.update({
          where: { id: userCartRecord.id },
          data: { cartToken: finalCartToken },
        });
        await tx.cart.delete({ where: { id: anonCartRecord.id } });
      } else {
        // --- СЦЕНАРИЙ ПЕРЕПРИВЯЗКИ (Simple Update) ---

        // 1. Просто обновляем email в анонимной корзине в Shopify
        finalCartToken = await updateShopifyBuyerIdentity(
          anonCartRecord.cartToken.split('?')[0],
          newUser.user.email,
        );

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
