'use server';

import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@shared/lib/prisma';
import { storefrontClient } from '@shared/lib/shopify/client';
import { revalidatePath } from 'next/cache';

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

    const currentDiscounts = currentCart.cart?.discountCodes || [];
    const existingCodes = currentDiscounts.map((d) => d.code);

    // Only block if the code is already applied AND applicable
    const alreadyApplied = currentDiscounts.some(
      (d) => d.applicable && d.code.toUpperCase() === code.toUpperCase(),
    );
    if (alreadyApplied) {
      return { success: false, error: 'Code already applied' };
    }

    // Filter out any stale/non-applicable instances of this code before re-adding
    const cleanedCodes = existingCodes.filter(
      (c) => c.toUpperCase() !== code.toUpperCase(),
    );
    const newCodes = [...cleanedCodes, code];

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
    console.log(JSON.stringify(response, null, 2), 'cartDiscountCodesUpdate');
    if (response.cartDiscountCodesUpdate.userErrors.length > 0) {
      return {
        success: false,
        error: response.cartDiscountCodesUpdate.userErrors[0].message,
      };
    }

    const appliedCode =
      response.cartDiscountCodesUpdate.cart?.discountCodes.find(
        (d) => d.code.toUpperCase() === code.toUpperCase(),
      );

    // Save discount codes to local database
    const allDiscountCodes =
      response.cartDiscountCodesUpdate.cart?.discountCodes || [];
    await prisma.cart.update({
      where: { id: sessionCart.id },
      data: {
        discountCodes: allDiscountCodes.map((d) => ({
          code: d.code,
          applicable: d.applicable,
        })),
      },
    });

    revalidatePath('/', 'layout');

    return {
      success: true,
      applicable: appliedCode?.applicable ?? false,
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

    const existingCodes =
      currentCart.cart?.discountCodes.map((d) => d.code) || [];
    const newCodes = existingCodes.filter(
      (c) => c.toUpperCase() !== code.toUpperCase(),
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
    const allDiscountCodes =
      response.cartDiscountCodesUpdate.cart?.discountCodes || [];
    await prisma.cart.update({
      where: { id: sessionCart.id },
      data: {
        discountCodes: allDiscountCodes.map((d) => ({
          code: d.code,
          applicable: d.applicable,
        })),
      },
    });

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Error removing discount code:', error);
    return { success: false, error: 'Failed to remove discount code' };
  }
}
