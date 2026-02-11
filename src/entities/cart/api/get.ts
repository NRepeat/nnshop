import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import { prisma } from '@shared/lib/prisma';
import { storefrontClient } from '@shared/lib/shopify/client';
import {
  GetCartQuery,
  GetCartQueryVariables,
} from '@shared/lib/shopify/types/storefront.generated';
const CART_QUERY = `#graphql
  query GetCart($id: ID!) {
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
                  metafields(   identifiers: [
                  {key: "znizka", namespace: "custom"}]){
                    key
                    value
                  }
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

export const getCart = async ({
  userId,
  cartId,
  locale,
}: {
  userId: string;
  cartId?: string;
  locale: string;
}) => {
  try {
    const sessionCart = await prisma.cart.findFirst({
      where: {
        userId: userId,
        completed: false,
      },
    });
    if (!sessionCart) {
      return {
        success: false,
        errors: ['Cart not found'],
      };
    }
    const response = await storefrontClient.request<
      GetCartQuery,
      GetCartQueryVariables
    >({
      query: CART_QUERY,
      variables: { id: cartId || sessionCart.cartToken },
      language: locale.toUpperCase() as StorefrontLanguageCode,
      cache: 'no-store',
    });
    if (!response.cart) {
      return null;
    }
    return response;
  } catch (error) {
    console.log('🚀 ~ getCart ~ error:', error);
    // Return null instead of throwing to prevent page crashes
    // This handles cases where Shopify cart was converted to order
    // or network timeouts during navigation
    return null;
  }
};
