'use server';
import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { storefrontClient } from '@shared/lib/shopify/client';
import { tryCatch } from '@shared/lib/try-catch';
import {
  CartCreatePayload,
  CartInput,
  CreateCartInput,
  CreateCartResult,
} from '@shared/types/cart/types';
import { headers } from 'next/headers';
const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        note
        createdAt
        updatedAt
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
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  image {
                    url
                    altText
                    width
                    height
                  }
                  product {
                    id
                    title
                    handle
                  }
                  selectedOptions {
                    name
                    value
                  }
                }
              }
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
                amountPerQuantity {
                  amount
                  currencyCode
                }
              }
              attributes {
                key
                value
              }
            }
          }
        }
        attributes {
          key
          value
        }
        discountCodes {
          code
          applicable
        }
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

const createCart = async (
  input: CreateCartInput,
): Promise<CreateCartResult> => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      throw new Error('Session not found ');
    }
    const cartInput: CartInput = {
      lines: [
        {
          merchandiseId: input.merchandiseId,
          quantity: input.quantity || 1,
          attributes: input.attributes
            ? Object.entries(input.attributes).map(([key, value]) => ({
                key,
                value,
              }))
            : undefined,
        },
      ],
      note: input.note,
      buyerIdentity: input.buyerIdentity
        ? {
            email: input.buyerIdentity.email,
            phone: input.buyerIdentity.phone,
            countryCode: input.buyerIdentity.countryCode,
          }
        : undefined,
    };
    const response = await storefrontClient.request<{
      cartCreate: CartCreatePayload;
    }>({
      query: CART_CREATE_MUTATION,
      variables: {
        input: cartInput,
      },
    });
    const { cartCreate } = response;

    if (cartCreate.userErrors && cartCreate.userErrors.length > 0) {
      return {
        success: false,
        errors: cartCreate.userErrors.map((error) => error.message),
      };
    }

    const warnings =
      cartCreate.warnings?.map((warning) => warning.message) || [];
    if (!cartCreate.cart) {
      return {
        success: false,
        errors: cartCreate.userErrors.map((error) => error.message),
      };
    }
    await prisma.cart.create({
      data: {
        cartToken: cartCreate.cart?.id,
        userId: session.user.id,
      },
    });
    return {
      success: true,
      cart: cartCreate.cart,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    console.error('Error creating cart:', error);
    return {
      success: false,
      errors: [
        error instanceof Error ? error.message : 'Failed to create cart',
      ],
    };
  }
};

export default createCart;
