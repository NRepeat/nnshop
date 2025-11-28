'use server';
import { prisma } from '../../../shared/lib/prisma';
import { storefrontClient } from '../../../shared/lib/shopify/client';
import { CartBuyerIdentityUpdatePayload } from '../../../shared/lib/shopify/types/storefront.types';
import { Session, User } from 'better-auth';
export type UserWithAnonymous = User & { isAnonymous: boolean };
const CART_BUYER_IDENTITY_UPDATE = `
  #graphql
  mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

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
      const oldCart = await tx.cart.findFirst({
        where: {
          userId: anonymousUser.user.id,
          completed: false,
        },
      });
      if (!oldCart) return;
      const updatedCart = await tx.cart.update({
        where: {
          id: oldCart.id,
        },
        data: {
          userId: newUser.user.id,
        },
      });
      const input = {
        cartId: updatedCart.cartToken.split('?')[0],
        buyerIdentity: { email: newUser.user.email },
      };
      const response =
        await storefrontClient.request<CartBuyerIdentityUpdatePayload>({
          query: CART_BUYER_IDENTITY_UPDATE,
          variables: input,
        });

      if (response.userErrors && response.userErrors?.length > 0) {
        console.log('userErrors', response.userErrors);
        throw new Error('An error occurred while updating the buyer identity');
      }
      await tx.cart.update({
        where: {
          id: updatedCart.id,
        },
        data: {
          cartToken: response?.cart?.id,
        },
      });
    });
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while updating the buyer identity');
  }
};
