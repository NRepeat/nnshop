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
import { ContactInformation } from '@prisma/client'; // Assuming ContactInformation Prisma model

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
  deliveryInfo: DeliveryInfo,
  contactInfo: ContactInformation, // Added ContactInformation
): Promise<{ success: boolean; cart?: Cart; errors?: string[] }> {
  console.log(
    'updateCartDeliveryPreferences: Received cartId:',
    cartId,
    'deliveryInfo:',
    JSON.stringify(deliveryInfo),
    'contactInfo:',
    JSON.stringify(contactInfo),
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

    // Determine the delivery address input based on delivery method
    let deliveryAddressInput: any;

    if (deliveryInfo.deliveryMethod === 'novaPoshta') {
      console.log(
        'updateCartDeliveryPreferences: Handling Nova Poshta delivery method.',
      );
      // For Nova Poshta, we construct an address from department info
      // Fallback to general delivery address if department address is not fully available
      const departmentAddress = deliveryInfo.novaPoshtaDepartment?.addressParts;
      const fullAddress =
        departmentAddress?.street && departmentAddress?.building
          ? `${departmentAddress.street}, ${departmentAddress.building}`
          : deliveryInfo.novaPoshtaDepartment?.shortName ||
            deliveryInfo.address; // Fallback to shortName or general address

      deliveryAddressInput = {
        address1: fullAddress || '',
        city: departmentAddress?.city || deliveryInfo.city || '',
        country: deliveryInfo.country || 'UA', // Assume UA if not provided
        firstName: contactInfo.name || '',
        lastName: contactInfo.lastName || '',
        phone: contactInfo.phone || '',
        zip: deliveryInfo.postalCode || '',
        address2:
          departmentAddress?.building || deliveryInfo.apartment || undefined,
      };

      console.log(
        'updateCartDeliveryPreferences: Constructed deliveryAddressInput for Nova Poshta:',
        JSON.stringify(deliveryAddressInput),
      );
    } else if (deliveryInfo.deliveryMethod === 'ukrPoshta') {
      console.log(
        'updateCartDeliveryPreferences: Handling UkrPoshta delivery method.',
      );
      // For UkrPoshta, use the provided address fields directly
      deliveryAddressInput = {
        address1: deliveryInfo.address || '',
        city: deliveryInfo.city || '',
        country: deliveryInfo.country || '',
        firstName: contactInfo.name || '',
        lastName: contactInfo.lastName || '',
        phone: contactInfo.phone || '',
        zip: deliveryInfo.postalCode || '',
        address2: deliveryInfo.apartment || undefined,
      };
      console.log(
        'updateCartDeliveryPreferences: Constructed deliveryAddressInput for UkrPoshta:',
        JSON.stringify(deliveryAddressInput),
      );
    } else {
      console.warn(
        'updateCartDeliveryPreferences: Unsupported delivery method:',
        deliveryInfo.deliveryMethod,
      );
      return {
        success: false,
        errors: ['Unsupported delivery method'],
      };
    }

    const response = await storefrontClient.request<{
      cartDeliveryAddressesAdd: {
        cart: Cart | null;
        userErrors: CartUserError[];
      };
    }>({
      query: CART_DELIVERY_ADDRESSES_ADD_MUTATION,
      variables: {
        cartId,
        deliveryAddresses: [{ address: deliveryAddressInput }],
      },
    });

    console.log(
      'updateCartDeliveryPreferences: Shopify cartDeliveryAddressesAdd response:',
      JSON.stringify(response),
    );

    if (response.cartDeliveryAddressesAdd.userErrors.length > 0) {
      console.error(
        'updateCartDeliveryPreferences: Shopify user errors adding delivery address:',
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
        'updateCartDeliveryPreferences: No cart returned from Shopify after adding delivery address.',
      );
      return {
        success: false,
        errors: ['Failed to add cart delivery address'],
      };
    }

    revalidateTag(CART_TAGS.CART);
    revalidateTag(CART_TAGS.CART_SESSION);

    console.log(
      'updateCartDeliveryPreferences: Cart delivery address added successfully!',
    );
    return {
      success: true,
      cart: response.cartDeliveryAddressesAdd.cart,
    };
  } catch (error) {
    console.error(
      'updateCartDeliveryPreferences: Caught error during cart delivery preferences update:',
      {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        cartId: cartId,
        deliveryInfo: JSON.stringify(deliveryInfo),
        contactInfo: JSON.stringify(contactInfo),
        errorObject: JSON.stringify(error),
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
