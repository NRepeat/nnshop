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
  console.log(
    'updateCartDeliveryPreferences: Received cartId:',
    cartId,
    'deliveryInfo:',
    JSON.stringify(deliveryInfo),
  );

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      console.warn(
        'updateCartDeliveryPreferences: Session not found, throwing error.',
      );
      throw new Error('Session not found');
    }
    const sessionCart = await prisma.cart.findUnique({
      where: {
        userId: session.user.id,
      },
    });
    if (!sessionCart) {
      console.warn(
        'updateCartDeliveryPreferences: Cart not found for userId:',
        session.user.id,
        ', throwing error.',
      );
      throw new Error('Cart not found');
    }

    if (deliveryInfo.deliveryMethod === 'novaPoshta') {
      console.log(
        'updateCartDeliveryPreferences: Handling Nova Poshta delivery method.',
      );

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
      console.log(
        'updateCartDeliveryPreferences: Existing buyer identity:',
        JSON.stringify(existingBuyerIdentity),
      );

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
      console.log(
        'updateCartDeliveryPreferences: Constructed buyerIdentity for Nova Poshta:',
        JSON.stringify(buyerIdentity),
      );

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

      console.log(
        'updateCartDeliveryPreferences: Shopify cartBuyerIdentityUpdate response:',
        JSON.stringify(response),
      );

      if (response.cartBuyerIdentityUpdate.userErrors.length > 0) {
        console.error(
          'updateCartDeliveryPreferences: Shopify user errors for Nova Poshta:',
          response.cartBuyerIdentityUpdate.userErrors,
        );
        return {
          success: false,
          errors: response.cartBuyerIdentityUpdate.userErrors.map(
            (error) => error.message,
          ),
        };
      }

      if (!response.cartBuyerIdentityUpdate.cart) {
        console.error(
          'updateCartDeliveryPreferences: No cart returned from Shopify for Nova Poshta update.',
        );
        return {
          success: false,
          errors: ['Failed to update cart delivery preferences'],
        };
      }

      revalidateTag(CART_TAGS.CART);
      revalidateTag(CART_TAGS.CART_SESSION);

      console.log(
        'updateCartDeliveryPreferences: Nova Poshta delivery preferences updated successfully!',
      );
      return {
        success: true,
        cart: response.cartBuyerIdentityUpdate.cart,
      };
    } else if (deliveryInfo.deliveryMethod === 'ukrPoshta') {
      console.log(
        'updateCartDeliveryPreferences: Handling UkrPoshta delivery method.',
      );

      // Need to fetch ContactInfo here to get firstName, lastName, phone
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
      console.log(
        'updateCartDeliveryPreferences: Fetched contactInfo for UkrPoshta:',
        JSON.stringify(contactInfo),
      );

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
      console.log(
        'updateCartDeliveryPreferences: Constructed cartDeliveryAddressInput for UkrPoshta:',
        JSON.stringify(cartDeliveryAddressInput),
      );

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

      console.log(
        'updateCartDeliveryPreferences: Shopify cartDeliveryAddressesAdd response:',
        JSON.stringify(response),
      );

      if (response.cartDeliveryAddressesAdd.userErrors.length > 0) {
        console.error(
          'updateCartDeliveryPreferences: Shopify user errors for UkrPoshta:',
          response.cartDeliveryAddressesAdd.userErrors,
        );
        return {
          success: false,
          errors: response.cartDeliveryAddressesAdd.userErrors.map(
            (error) => error.message,
          ),
        };
      }

      if (!response.cartDeliveryAddressesAdd.cart) {
        console.error(
          'updateCartDeliveryPreferences: No cart returned from Shopify for UkrPoshta address add.',
        );
        return {
          success: false,
          errors: ['Failed to add cart delivery address'],
        };
      }

      revalidateTag(CART_TAGS.CART);
      revalidateTag(CART_TAGS.CART_SESSION);

      console.log(
        'updateCartDeliveryPreferences: UkrPoshta delivery address added successfully!',
      );
      return {
        success: true,
        cart: response.cartDeliveryAddressesAdd.cart,
      };
    }

    console.warn(
      'updateCartDeliveryPreferences: Unsupported delivery method:',
      deliveryInfo.deliveryMethod,
    );
    return {
      success: false,
      errors: ['Unsupported delivery method'],
    };
  } catch (error) {
    console.error(
      'updateCartDeliveryPreferences: Caught error during cart delivery preferences update:',
      {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        cartId: cartId,
        deliveryInfo: JSON.stringify(deliveryInfo),
        errorObject: JSON.stringify(error), // Log the full error object if possible
      },
    );
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
