'use server';
import { auth } from '@features/auth/lib/auth';
import { cachedFetch, CART_TAGS } from '@shared/lib/cached-fetch';
import { prisma } from '@shared/lib/prisma';
import { storefrontClient } from '@shared/lib/shopify/client';
import { Cart } from '@shared/lib/shopify/types/storefront.types';
import { headers } from 'next/headers';
const CART_QUERY = `
  #graphql
  query cart($id: ID!) {
    cart(id: $id) {
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
      delivery {
        addresses {
            id
            selected
            address {
            ... on CartDeliveryAddress {
            address1
            address2
            city
            countryCode
            firstName
            lastName
            phone
            zip
            }

            }
        }
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
  }
`;
export async function getCart(
  cartId?: string,
): Promise<{ success: boolean; cart?: Cart; errors?: string[] } | null> {
  if (cartId) {
    try {
      return await cachedFetch(
        `cart-${cartId}`,
        async () => {
          const response = await storefrontClient.request<{
            cart: Cart | null;
          }>({
            query: CART_QUERY,
            variables: { id: cartId },
          });
          if (!response.cart) {
            return {
              success: false,
              errors: ['Cart not found'],
            };
          }
          return {
            success: true,
            cart: response.cart,
          };
        },
        [CART_TAGS.CART, CART_TAGS.CART_ITEMS],
        30,
      );
    } catch (error) {
      console.error('Error fetching cart:', error);
      return {
        success: false,
        errors: [
          error instanceof Error ? error.message : 'Failed to fetch cart',
        ],
      };
    }
  } else {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return {
        success: false,
        errors: ['Cart not found'],
      };
      throw new Error('Session not found');
    }
    const sessionCart = await prisma.cart.findUnique({
      where: {
        userId: session.user.id,
        completed: false,
      },
    });
    if (!sessionCart) {
      return {
        success: false,
        errors: ['Cart not found'],
      };
    }
    return await cachedFetch(
      `cart-${sessionCart?.cartToken}`,
      async () => {
        const response = await storefrontClient.request<{ cart: Cart | null }>({
          query: CART_QUERY,
          variables: { id: sessionCart?.cartToken },
        });
        if (!response.cart) {
          return {
            success: false,
            errors: ['Cart not found'],
          };
        }
        return {
          success: true,
          cart: response.cart,
        };
      },
      [CART_TAGS.CART, CART_TAGS.CART_ITEMS],
      30,
    );
  }
}
