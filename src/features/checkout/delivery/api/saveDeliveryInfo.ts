'use server';

import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';
import { DeliveryInfo } from '../model/deliverySchema';
import { updateCartDeliveryPreferences } from '@entities/cart/api/update-cart-delivery-preferences';

export async function saveDeliveryInfo(
  data: DeliveryInfo,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return { success: false, message: 'Session not found' };
    }

    const transaction = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        include: {
          contactInformation: true, // Include contact information
        },
      });
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.contactInformation) {
        throw new Error('Contact information not found for the user.');
      }

      // Upsert DeliveryInformation
      const updatedDeliveryInfo = await tx.deliveryInformation.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          deliveryMethod: data.deliveryMethod,
          country: data.country,
          address: data.address,
          apartment: data.apartment,
          city: data.city,
          postalCode: data.postalCode,
        },
        update: {
          deliveryMethod: data.deliveryMethod,
          country: data.country,
          address: data.address,
          apartment: data.apartment,
          city: data.city,
          postalCode: data.postalCode,
        },
      });

      if (data.deliveryMethod === 'novaPoshta' && data.novaPoshtaDepartment) {
        // Upsert NovaPoshtaDepartment
        await tx.novaPoshtaDepartment.upsert({
          where: { deliveryInformationId: updatedDeliveryInfo.id },
          create: {
            id: data.novaPoshtaDepartment.id,
            shortName: data.novaPoshtaDepartment.shortName,
            city: data.novaPoshtaDepartment.addressParts?.city,
            street: data.novaPoshtaDepartment.addressParts?.street,
            building: data.novaPoshtaDepartment.addressParts?.building,
            latitude: data.novaPoshtaDepartment.coordinates?.latitude,
            longitude: data.novaPoshtaDepartment.coordinates?.longitude,
            deliveryInformationId: updatedDeliveryInfo.id,
          },
          update: {
            id: data.novaPoshtaDepartment.id,
            shortName: data.novaPoshtaDepartment.shortName,
            city: data.novaPoshtaDepartment.addressParts?.city,
            street: data.novaPoshtaDepartment.addressParts?.street,
            building: data.novaPoshtaDepartment.addressParts?.building,
            latitude: data.novaPoshtaDepartment.coordinates?.latitude,
            longitude: data.novaPoshtaDepartment.coordinates?.longitude,
          },
        });
      } else if (data.deliveryMethod === 'ukrPoshta') {
        // Disconnect/delete NovaPoshtaDepartment if it exists and method is UkrPoshta
        await tx.novaPoshtaDepartment.deleteMany({
          where: { deliveryInformationId: updatedDeliveryInfo.id },
        });
      }

      // Existing Shopify update logic (if needed, this would be integrated here)
      const sessionCart = await tx.cart.findUnique({
        where: {
          userId: user.id,
        },
      });
      if (sessionCart) {
        const cartUpdateResult = await updateCartDeliveryPreferences(
          sessionCart.cartToken,
          data, // Pass DeliveryInfo
          user.contactInformation, // Pass ContactInformation
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
    });

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
