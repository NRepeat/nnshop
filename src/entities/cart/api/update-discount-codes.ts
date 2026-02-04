'use server';

import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@shared/lib/prisma';
import { storefrontClient } from '@shared/lib/shopify/client';
import { revalidateTag } from 'next/cache';
import { CART_TAGS } from '@shared/lib/cached-fetch';

const DISCOUNT_CODES_UPDATE_MUTATION = `#graphql
  mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart {
        id
        discountCodes {
          code
          applicable
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
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

type DiscountCodesUpdateResponse = {
  cartDiscountCodesUpdate: {
    cart: {
      id: string;
      discountCodes: Array<{
        code: string;
        applicable: boolean;
      }>;
      cost: {
        totalAmount: {
          amount: string;
          currencyCode: string;
        };
        subtotalAmount: {
          amount: string;
          currencyCode: string;
        };
      };
    } | null;
    userErrors: Array<{
      field: string[];
      message: string;
    }>;
  };
};

const GET_CART_DISCOUNT_CODES_QUERY = `#graphql
  query GetCartDiscountCodes($id: ID!) {
    cart(id: $id) {
      discountCodes {
        code
        applicable
      }
    }
  }
`;

type GetCartDiscountCodesResponse = {
  cart: {
    discountCodes: Array<{
      code: string;
      applicable: boolean;
    }>;
  } | null;
};

export async function applyDiscountCode(code: string): Promise<{
  success: boolean;
  error?: string;
  applicable?: boolean;
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

    const currentCart = await storefrontClient.request<
      GetCartDiscountCodesResponse,
      { id: string }
    >({
      query: GET_CART_DISCOUNT_CODES_QUERY,
      variables: { id: sessionCart.cartToken },
    });

    const existingCodes = currentCart.cart?.discountCodes.map((d) => d.code) || [];

    if (existingCodes.includes(code.toUpperCase()) || existingCodes.includes(code)) {
      return { success: false, error: 'Code already applied' };
    }

    const newCodes = [...existingCodes, code];

    const response = await storefrontClient.request<
      DiscountCodesUpdateResponse,
      { cartId: string; discountCodes: string[] }
    >({
      query: DISCOUNT_CODES_UPDATE_MUTATION,
      variables: {
        cartId: sessionCart.cartToken,
        discountCodes: newCodes,
      },
    });

    if (response.cartDiscountCodesUpdate.userErrors.length > 0) {
      return {
        success: false,
        error: response.cartDiscountCodesUpdate.userErrors[0].message,
      };
    }

    const appliedCode = response.cartDiscountCodesUpdate.cart?.discountCodes.find(
      (d) => d.code.toUpperCase() === code.toUpperCase()
    );

    // Save discount codes to local database
    const allDiscountCodes = response.cartDiscountCodesUpdate.cart?.discountCodes || [];
    await prisma.cart.update({
      where: { id: sessionCart.id },
      data: {
        discountCodes: allDiscountCodes.map((d) => ({
          code: d.code,
          applicable: d.applicable,
        })),
      },
    });

    revalidateTag(CART_TAGS.CART, { expire: 0 });

    return {
      success: true,
      applicable: appliedCode?.applicable ?? false
    };
  } catch (error) {
    console.error('Error applying discount code:', error);
    return { success: false, error: 'Failed to apply discount code' };
  }
}

export async function removeDiscountCode(code: string): Promise<{
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

    const currentCart = await storefrontClient.request<
      GetCartDiscountCodesResponse,
      { id: string }
    >({
      query: GET_CART_DISCOUNT_CODES_QUERY,
      variables: { id: sessionCart.cartToken },
    });

    const existingCodes = currentCart.cart?.discountCodes.map((d) => d.code) || [];
    const newCodes = existingCodes.filter(
      (c) => c.toUpperCase() !== code.toUpperCase()
    );

    const response = await storefrontClient.request<
      DiscountCodesUpdateResponse,
      { cartId: string; discountCodes: string[] }
    >({
      query: DISCOUNT_CODES_UPDATE_MUTATION,
      variables: {
        cartId: sessionCart.cartToken,
        discountCodes: newCodes,
      },
    });

    if (response.cartDiscountCodesUpdate.userErrors.length > 0) {
      return {
        success: false,
        error: response.cartDiscountCodesUpdate.userErrors[0].message,
      };
    }

    // Update discount codes in local database
    const allDiscountCodes = response.cartDiscountCodesUpdate.cart?.discountCodes || [];
    await prisma.cart.update({
      where: { id: sessionCart.id },
      data: {
        discountCodes: allDiscountCodes.map((d) => ({
          code: d.code,
          applicable: d.applicable,
        })),
      },
    });

    revalidateTag(CART_TAGS.CART, { expire: 0 });
    return { success: true };
  } catch (error) {
    console.error('Error removing discount code:', error);
    return { success: false, error: 'Failed to remove discount code' };
  }
}
