'use server';
import { auth } from '@features/auth/lib/auth';
import { CART_TAGS } from '@shared/lib/cached-fetch';
import { prisma } from '@shared/lib/prisma';
import { storefrontClient } from '@shared/lib/shopify/client';
import { Cart, CartUserError } from '@shared/types/cart/types';
import { revalidateTag } from 'next/cache';
import { headers } from 'next/headers';
import { getCart } from './get';
import { DeliveryInfo } from '@features/checkout/delivery/model/deliverySchema';

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

const CART_DELIVERY_ADDRESSES_ADD_MUTATION = `
  mutation cartDeliveryAddressesAdd($cartId: ID!, $deliveryAddresses: [CartDeliveryAddressInput!]!) {
    cartDeliveryAddressesAdd(cartId: $cartId, deliveryAddresses: $deliveryAddresses) {
      cart {
        id
        deliveryGroups(first: 1) {
          edges {
            node {
              id
              deliveryAddress {
                address1
                city
                country
                firstName
                lastName
                phone
                zip
                address2
              }
            }
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

export async function updateCartDeliveryPreferences(
  cartId: string,
  deliveryInfo: DeliveryInfo, // Changed to DeliveryInfo
): Promise<{ success: boolean; cart?: Cart; errors?: string[] }> {
  try {
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

    if (deliveryInfo.deliveryMethod === 'novaPoshta') {
      // Use existing buyer identity update for Nova Poshta pickup points
      const currentCartResult = await getCart(sessionCart?.cartToken);
      let existingBuyerIdentity = {};

      if (currentCartResult && currentCartResult.cart?.buyerIdentity) {
        existingBuyerIdentity = {
          email: currentCartResult.cart.buyerIdentity.email,
          phone: currentCartResult.cart.buyerIdentity.phone,
          countryCode: currentCartResult.cart.buyerIdentity.countryCode,
        };
      }

      let pickupHandle: string[] | undefined;
      let coordinatesObject:
        | { latitude: number; longitude: number; countryCode: string }
        | undefined;

      if (deliveryInfo.novaPoshtaDepartment?.id) {
        pickupHandle = [String(deliveryInfo.novaPoshtaDepartment.id)];

        if (deliveryInfo.novaPoshtaDepartment.coordinates) {
          coordinatesObject = {
            ...deliveryInfo.novaPoshtaDepartment.coordinates,
            countryCode: 'UA', // Default to Ukraine for Nova Poshta
          };
        }
      }

      const buyerIdentity = {
        ...existingBuyerIdentity,
        preferences: {
          delivery: {
            deliveryMethod: ['PICKUP_POINT'], // Assuming PICKUP_POINT for Nova Poshta
            pickupHandle: pickupHandle,
            coordinates: coordinatesObject,
          },
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

      revalidateTag(CART_TAGS.CART);
      revalidateTag(CART_TAGS.CART_SESSION);

      return {
        success: true,
        cart: response.cartBuyerIdentityUpdate.cart,
      };
    } else if (deliveryInfo.deliveryMethod === 'ukrPoshta') {
      // Use cartDeliveryAddressesAdd for UkrPoshta physical addresses
      const deliveryAddress = {
        address1: deliveryInfo.address || '',
        city: deliveryInfo.city || '',
        country: deliveryInfo.country || '',
        firstName: '', // This information is not in DeliveryInfo, need to get from ContactInfo
        lastName: '', // This information is not in DeliveryInfo, need to get from ContactInfo
        phone: '', // This information is not in DeliveryInfo, need to get from ContactInfo
        zip: deliveryInfo.postalCode || '',
        address2: deliveryInfo.apartment || undefined,
      };

      // Need to fetch ContactInfo here to get firstName, lastName, phone
      // This function needs to take ContactInfo as well, or fetch it internally.
      // For now, let's assume we get it from completeCheckoutData.

      const currentCartResult = await getCart(sessionCart?.cartToken);
      let contactInfo = {
        firstName: '',
        lastName: '',
        phone: '',
      };
      if (
        currentCartResult &&
        currentCartResult.cart?.buyerIdentity?.customer
      ) {
        contactInfo.firstName =
          currentCartResult.cart.buyerIdentity.customer.firstName || '';
        contactInfo.lastName =
          currentCartResult.cart.buyerIdentity.customer.lastName || '';
        contactInfo.phone = currentCartResult.cart.buyerIdentity.phone || '';
      }

      const cartDeliveryAddressInput = {
        address: {
          address1: deliveryInfo.address,
          address2: deliveryInfo.apartment,
          city: deliveryInfo.city,
          country: deliveryInfo.country,
          firstName: contactInfo.firstName,
          lastName: contactInfo.lastName,
          phone: contactInfo.phone,
          zip: deliveryInfo.postalCode,
        },
      };

      const response = await storefrontClient.request<{
        cartDeliveryAddressesAdd: {
          cart: Cart | null;
          userErrors: CartUserError[];
        };
      }>({
        query: CART_DELIVERY_ADDRESSES_ADD_MUTATION,
        variables: {
          cartId,
          deliveryAddresses: [cartDeliveryAddressInput],
        },
      });

      if (response.cartDeliveryAddressesAdd.userErrors.length > 0) {
        return {
          success: false,
          errors: response.cartDeliveryAddressesAdd.userErrors.map(
            (error) => error.message,
          ),
        };
      }

      if (!response.cartDeliveryAddressesAdd.cart) {
        return {
          success: false,
          errors: ['Failed to add cart delivery address'],
        };
      }

      revalidateTag(CART_TAGS.CART);
      revalidateTag(CART_TAGS.CART_SESSION);

      return {
        success: true,
        cart: response.cartDeliveryAddressesAdd.cart,
      };
    }

    return {
      success: false,
      errors: ['Unsupported delivery method'],
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
