'use server';
import { auth } from '@features/auth/lib/auth';
import { CART_TAGS } from '@shared/lib/cached-fetch';
import { prisma } from '@shared/lib/prisma';
import { storefrontClient } from '@shared/lib/shopify/client';
import { Cart, CartUserError } from '@shared/types/cart/types';
import { revalidateTag } from 'next/cache';
import { headers } from 'next/headers';
import { DeliveryInfo } from '@features/checkout/delivery/model/deliverySchema';
import { ContactInformation } from '~/generated/prisma/client';
import { getCart } from './get';

const CART_DELIVERY_ADDRESSES_ADD_MUTATION = `
  #graphql
  mutation CartDeliveryAddressesAdd($id: ID!, $addresses: [CartSelectableAddressInput!]!) {
    cartDeliveryAddressesAdd(cartId: $id, addresses: $addresses) {
      userErrors {
        message
        code
        field
      }
      warnings {
        message
        code
        target
      }
      cart {
        id
        delivery {
          addresses {
            id
            selected
            oneTimeUse
            address {
              ... on CartDeliveryAddress {
                firstName
                lastName
                company
                address1
                address2
                city
                provinceCode
                zip
                countryCode
              }
            }
          }
        }
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
        completed: false,
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

    let deliveryAddressInput: any;

    if (deliveryInfo.deliveryMethod === 'novaPoshta') {
      const departmentAddress = deliveryInfo.novaPoshtaDepartment?.addressParts;
      const fullAddress =
        departmentAddress?.street && departmentAddress?.building
          ? `${departmentAddress.street}, ${departmentAddress.building}`
          : deliveryInfo.novaPoshtaDepartment?.shortName ||
            deliveryInfo.address;

      deliveryAddressInput = {
        address1: deliveryInfo.novaPoshtaDepartment?.shortName || '',
        city: deliveryInfo.novaPoshtaDepartment?.addressParts?.city,
        countryCode: 'UA',
        firstName: contactInfo.name,
        lastName: contactInfo.lastName,
        phone: contactInfo.phone,
        zip: '00000',
        address2: fullAddress || undefined,
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
        countryCode: deliveryInfo.country || '',
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
        id: sessionCart.cartToken,
        addresses: [
          {
            selected: true,
            address: {
              deliveryAddress: {
                address1: deliveryAddressInput?.address1,
                city: deliveryAddressInput?.city,
                countryCode: deliveryAddressInput?.countryCode,
                zip: deliveryAddressInput?.zip,
              },
            },
          },
        ],
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
