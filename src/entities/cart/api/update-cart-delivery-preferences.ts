'use server';
import { DEFAULT_COUNTRY_CODE } from '@shared/config/shop';
import { auth } from '@features/auth/lib/auth';
import { CART_TAGS } from '@shared/lib/cached-fetch';
import { prisma } from '@shared/lib/prisma';
import { storefrontClient } from '@shared/lib/shopify/client';
import { Cart, CartUserError } from '@shared/types/cart/types';
import { revalidateTag } from 'next/cache';
import { headers } from 'next/headers';
import { DeliveryInfo } from '@features/checkout/delivery/model/deliverySchema';
import { ContactInformation } from '~/generated/prisma/client';
import { getPickupPoint } from '@features/checkout/delivery/lib/pickup-points';

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
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      throw new Error('Session not found');
    }
    const sessionCart = await prisma.cart.findFirst({
      where: {
        userId: session.user.id,
        completed: false,
      },
    });
    if (!sessionCart) {
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
        countryCode: DEFAULT_COUNTRY_CODE,
        firstName: contactInfo.name,
        lastName: contactInfo.lastName,
        phone: contactInfo.phone,
        zip: '00000',
        address2: fullAddress || undefined,
      };

    } else if (deliveryInfo.deliveryMethod === 'ukrPoshta') {
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
    } else if (deliveryInfo.deliveryMethod === 'selfPickup') {
      const point = deliveryInfo.selfPickupPoint
        ? getPickupPoint(deliveryInfo.selfPickupPoint)
        : null;
      deliveryAddressInput = {
        address1: point ? `Самовивіз: ${point.name}, ${point.address}` : 'Самовивіз',
        city: point?.city || 'Запоріжжя',
        countryCode: DEFAULT_COUNTRY_CODE,
        firstName: contactInfo.name || '',
        lastName: contactInfo.lastName || '',
        phone: contactInfo.phone || '',
        zip: '69000',
      };
    } else {
      return {
        success: false,
        errors: ['Unsupported delivery method'],
      };
    }

    const response = await storefrontClient.request<
      {
        cartDeliveryAddressesAdd: {
          cart: Cart | null;
          userErrors: CartUserError[];
        };
      },
      {
        id: string;
        addresses: {
          selected: boolean;
          address: {
            deliveryAddress: {
              address1: string | null;
              city: string | null;
              countryCode: string | null;
              zip: string | null;
              firstName?: string | null;
              lastName?: string | null;
              phone?: string | null;
            };
          };
        }[];
      }
    >({
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
                firstName: deliveryAddressInput?.firstName || null,
                lastName: deliveryAddressInput?.lastName || null,
                phone: deliveryAddressInput?.phone || null,
              },
            },
          },
        ],
      },
    });

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

    revalidateTag(CART_TAGS.CART, { expire: 0 });
    revalidateTag(CART_TAGS.CART_SESSION, { expire: 0 });

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
