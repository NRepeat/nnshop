'use server';

import { storefrontClient } from '@shared/lib/shopify/client';
import { Cart, CartUserError } from '@shared/types/cart/types';

const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
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

const linkProduct = async ({
  cartId,
  productVariantId,
  quantity = 1,
  attributes,
}: {
  cartId: string;
  productVariantId: string;
  quantity: number;
  attributes?: Record<string, string>;
}) => {
  try {
    const cartLineInput = {
      merchandiseId: productVariantId,
      quantity,
      attributes: attributes
        ? Object.entries(attributes).map(([key, value]) => ({ key, value }))
        : undefined,
    };
    console.log(cartLineInput);
    const response = await storefrontClient.request<{
      cartLinesAdd: { cart?: Cart; userErrors: CartUserError[] };
    }>({
      query: CART_LINES_ADD_MUTATION,
      variables: {
        cartId,
        lines: [cartLineInput],
      },
    });
    console.log(JSON.stringify(response, null, 2));
    const { cartLinesAdd } = response;

    if (cartLinesAdd.userErrors && cartLinesAdd.userErrors.length > 0) {
      return {
        success: false,
        errors: cartLinesAdd.userErrors.map((error) => error.message),
      };
    }

    return {
      success: true,
      cart: cartLinesAdd.cart,
    };
  } catch (error) {
    console.error('Error adding to existing cart:', error);
    return {
      success: false,
      errors: [
        error instanceof Error ? error.message : 'Failed to add to cart',
      ],
    };
  }
};

export default linkProduct;
