'use server';
import { cookies, headers } from 'next/headers';
import { DeliveryInfo, deliverySchema } from '../schema/deliverySchema';
import { auth } from '@features/auth/lib/auth';
import prisma from '@shared/lib/prisma';
import { updateCartDeliveryPreferences } from '@entities/cart/api/update-cart-delivery-preferences';

export async function saveDeliveryInfo(
  data: DeliveryInfo,
): Promise<{ success: boolean; message: string }> {
  try {
    const validationResult = deliverySchema.safeParse(data);

    if (!validationResult.success) {
      return {
        success: false,
        message: 'Please fix the validation errors.',
      };
    }

    const deliveryInfo = validationResult.data;

    const cookieStore = await cookies();
    const deliveryInfoJson = JSON.stringify(deliveryInfo);

    cookieStore.set('deliveryInfo', deliveryInfoJson, {
      secure: true,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

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
      if (sessionCart) {
        // Map delivery method to Shopify preference format
        const deliveryMethodMapping: Record<string, string> = {
          novaPoshta: 'PICKUP_POINT',
          ukrPoshta: 'SHIPPING',
        };

        const shopifyDeliveryMethod =
          deliveryMethodMapping[deliveryInfo.deliveryMethod] || 'SHIPPING';

        // Prepare pickup handle and coordinates for Nova Poshta
        let pickupHandle: string[] | undefined;
        let coordinatesObject:
          | { latitude: number; longitude: number; countryCode: string }
          | undefined;

        if (
          deliveryInfo.deliveryMethod === 'novaPoshta' &&
          deliveryInfo.novaPoshtaDepartment?.id
        ) {
          // Ensure pickupHandle is string array
          pickupHandle = [String(deliveryInfo.novaPoshtaDepartment.id)];

          // Add coordinates if available
          if (deliveryInfo.novaPoshtaDepartment.coordinates) {
            coordinatesObject = {
              ...deliveryInfo.novaPoshtaDepartment.coordinates,
              countryCode: 'UA', // Default to Ukraine for Nova Poshta
            };
          }
        }

        const cartUpdateResult = await updateCartDeliveryPreferences(
          sessionCart.cartToken,
          {
            deliveryMethod: [shopifyDeliveryMethod],
            pickupHandle: pickupHandle,
            coordinates: coordinatesObject,
          },
        );

        if (!cartUpdateResult.success) {
          console.warn(
            'Failed to update cart delivery preferences:',
            cartUpdateResult.errors,
          );
        } else {
          console.log(' Delivery preferences updated successfully!');
        }
      }
    } catch (cartError) {
      console.warn('Error updating cart delivery preferences:', cartError);
    }

    return {
      success: true,
      message: 'Delivery information saved successfully!',
    };
  } catch (error) {
    console.error('Error saving delivery info:', error);
    return {
      success: false,
      message:
        'An error occurred while saving your delivery information. Please try again.',
    };
  }
}
