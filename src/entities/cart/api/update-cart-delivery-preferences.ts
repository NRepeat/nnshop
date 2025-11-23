'use server';
import { auth } from '@features/auth/lib/auth';
import { CART_TAGS } from '@shared/lib/cached-fetch';
import { prisma } from '@shared/lib/prisma';
import { storefrontClient } from '@shared/lib/shopify/client';
import { Cart, CartUserError } from '@shared/types/cart/types';
import { revalidateTag } from 'next/cache';
import { headers } from 'next/headers';
import { getCart } from './get';

const CART_BUYER_IDENTITY_UPDATE_MUTATION = `
  mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        id
        buyerIdentity {
          email
          phone
          countryCode
          customer {
            id
            email
            firstName
            lastName
            displayName
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
      warnings {
        message
      }
    }
  }
`;

export async function updateCartDeliveryPreferences(
  cartId: string,
  deliveryPreferences: {
    deliveryMethod?: string[];
    pickupHandle?: string[];
    coordinates?: {
      latitude: number;
      longitude: number;
      countryCode: string;
    };
  },
): Promise<{ success: boolean; cart?: Cart; errors?: string[] }> {
  try {
    // First, get the current cart to preserve existing buyer identity
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      throw new Error('Session not found');
    }
    const sessionCart = await prisma.cart.findUnique({
      where: {
        userId: session.user.id,
      },
    });
    if (!sessionCart) {
      throw new Error('Cart not found');
    }
    const currentCartResult = await getCart(sessionCart?.cartToken);
    let existingBuyerIdentity = {};

    if (currentCartResult && currentCartResult.cart?.buyerIdentity) {
      existingBuyerIdentity = {
        email: currentCartResult.cart.buyerIdentity.email,
        phone: currentCartResult.cart.buyerIdentity.phone,
        countryCode: currentCartResult.cart.buyerIdentity.countryCode,
      };
    }

    // Merge existing buyer identity with new delivery preferences
    const buyerIdentity = {
      ...existingBuyerIdentity,
      preferences: {
        delivery: deliveryPreferences,
      },
    };

    const response = await storefrontClient.request<{
      cartBuyerIdentityUpdate: {
        cart: Cart | null;
        userErrors: CartUserError[];
        warnings: { message: string }[];
      };
    }>({
      query: CART_BUYER_IDENTITY_UPDATE_MUTATION,
      variables: {
        cartId,
        buyerIdentity,
      },
    });

    if (response.cartBuyerIdentityUpdate.userErrors.length > 0) {
      return {
        success: false,
        errors: response.cartBuyerIdentityUpdate.userErrors.map(
          (error) => error.message,
        ),
      };
    }

    if (!response.cartBuyerIdentityUpdate.cart) {
      return {
        success: false,
        errors: ['Failed to update cart delivery preferences'],
      };
    }

    // Invalidate cache to ensure fresh data
    revalidateTag(CART_TAGS.CART);
    revalidateTag(CART_TAGS.CART_SESSION);

    console.log(' FULL CART AFTER DELIVERY PREFERENCES UPDATE:', {
      cartId,
      cart: response.cartBuyerIdentityUpdate.cart,
      buyerIdentity: response.cartBuyerIdentityUpdate.cart?.buyerIdentity,
      cartData: JSON.stringify(response.cartBuyerIdentityUpdate.cart, null, 2),
    });

    return {
      success: true,
      cart: response.cartBuyerIdentityUpdate.cart,
    };
  } catch (error) {
    console.error('Error updating cart delivery preferences:', error);
    return {
      success: false,
      errors: [
        error instanceof Error
          ? error.message
          : 'Failed to update cart delivery preferences',
      ],
    };
  }
}
