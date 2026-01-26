'use server';
import { CART_TAGS } from '@shared/lib/cached-fetch';
import { storefrontClient } from '@shared/lib/shopify/client';
import {
  Cart,
  CartUserError,
  CreateCartResult,
} from '@shared/types/cart/types';
import { revalidateTag } from 'next/cache';

const CART_LINES_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
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
    }
  }
`;

export async function removeProductFromCart(
  cartId: string,
  lineId: string,
): Promise<CreateCartResult> {
  try {
    const response = await storefrontClient.request<
      {
        cartLinesRemove: { cart?: Cart; userErrors: CartUserError[] };
      },
      { cartId: string; lineIds: string[] }
    >({
      query: CART_LINES_REMOVE_MUTATION,
      variables: {
        cartId,
        lineIds: [lineId],
      },
    });

    const { cartLinesRemove } = response;

    if (cartLinesRemove.userErrors && cartLinesRemove.userErrors.length > 0) {
      return {
        success: false,
        errors: cartLinesRemove.userErrors.map((error) => error.message),
      };
    }

    revalidateTag(CART_TAGS.CART, { expire: 0 });

    return {
      success: true,
      cart: cartLinesRemove.cart,
    };
  } catch (error) {
    console.error('Error removing from cart:', error);
    return {
      success: false,
      errors: [
        error instanceof Error ? error.message : 'Failed to remove from cart',
      ],
    };
  }
}
