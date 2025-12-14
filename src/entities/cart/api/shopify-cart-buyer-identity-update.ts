'use server';
import { CART_TAGS } from '@shared/lib/cached-fetch';
import { storefrontClient } from '@shared/lib/shopify/client';
import { Cart, CartUserError } from '@shared/types/cart/types';
import { revalidateTag } from 'next/cache';

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

export async function updateCartBuyerIdentity(
  cartId: string,
  buyerIdentity: {
    email?: string;
    phone?: string;
    countryCode?: string;
    preferences?: {
      delivery?: {
        deliveryMethod?: string[];
        pickupHandle?: string[];
      };
    };
  },
): Promise<{ success: boolean; cart?: Cart; errors?: string[] }> {
  try {
    const response = await storefrontClient.request<
      {
        cartBuyerIdentityUpdate: {
          cart: Cart | null;
          userErrors: CartUserError[];
          warnings: { message: string }[];
        };
      },
      {
        cartId: string;
        buyerIdentity: {
          email?: string;
          phone?: string;
          countryCode?: string;
          preferences?: {
            delivery?: { deliveryMethod?: string[]; pickupHandle?: string[] };
          };
        };
      }
    >({
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
        errors: ['Failed to update cart buyer identity'],
      };
    }

    revalidateTag(CART_TAGS.CART);
    revalidateTag(CART_TAGS.CART_SESSION);

    return {
      success: true,
      cart: response.cartBuyerIdentityUpdate.cart,
    };
  } catch (error) {
    console.error('Error updating cart buyer identity:', error);
    return {
      success: false,
      errors: [
        error instanceof Error
          ? error.message
          : 'Failed to update cart buyer identity',
      ],
    };
  }
}
