'use server';

import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';
import { captureServerError } from '@shared/lib/posthog/posthog-server';
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

    // Fetch user and cart OUTSIDE the transaction to avoid holding DB connections
    // open during external API calls (Shopify).
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        contactInformation: true,
      },
    });
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    if (!user.contactInformation) {
      return {
        success: false,
        message:
          'Contact information is required before saving delivery info. Please complete step 1 first.',
      };
    }

    const sessionCart = await prisma.cart.findFirst({
      where: {
        userId: user.id,
        completed: false,
      },
    });

    // Persist delivery info to DB in a transaction (DB-only operations).
    await prisma.$transaction(async (tx) => {
      // For self-pickup, store the pickup point ID in the address field
      const addressValue =
        data.deliveryMethod === 'selfPickup'
          ? (data.selfPickupPoint ?? null)
          : (data.address ?? null);

      const updatedDeliveryInfo = await tx.deliveryInformation.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          deliveryMethod: data.deliveryMethod,
          country: data.country,
          address: addressValue,
          apartment: data.apartment,
          city: data.city,
          postalCode: data.postalCode,
        },
        update: {
          deliveryMethod: data.deliveryMethod,
          country: data.country,
          address: addressValue,
          apartment: data.apartment,
          city: data.city,
          postalCode: data.postalCode,
        },
      });

      if (data.deliveryMethod === 'novaPoshta' && data.novaPoshtaDepartment) {
        await tx.novaPoshtaDepartment.upsert({
          where: { deliveryInformationId: updatedDeliveryInfo.id },
          create: {
            shortName: data.novaPoshtaDepartment.shortName,
            city: data.novaPoshtaDepartment.addressParts?.city,
            street: data.novaPoshtaDepartment.addressParts?.street,
            building: data.novaPoshtaDepartment.addressParts?.building,
            latitude: data.novaPoshtaDepartment.coordinates?.latitude,
            longitude: data.novaPoshtaDepartment.coordinates?.longitude,
            deliveryInformationId: updatedDeliveryInfo.id,
          },
          update: {
            shortName: data.novaPoshtaDepartment.shortName,
            city: data.novaPoshtaDepartment.addressParts?.city,
            street: data.novaPoshtaDepartment.addressParts?.street,
            building: data.novaPoshtaDepartment.addressParts?.building,
            latitude: data.novaPoshtaDepartment.coordinates?.latitude,
            longitude: data.novaPoshtaDepartment.coordinates?.longitude,
          },
        });
      } else {
        // ukrPoshta or selfPickup — no Nova Poshta department needed
        await tx.novaPoshtaDepartment.deleteMany({
          where: { deliveryInformationId: updatedDeliveryInfo.id },
        });
      }
    });

    // Sync delivery address to Shopify cart AFTER the DB transaction completes.
    // This keeps the DB transaction short and avoids deadlocks from external I/O.
    if (sessionCart) {
      const cartUpdateResult = await updateCartDeliveryPreferences(
        sessionCart.cartToken,
        data,
        user.contactInformation,
      );

      if (!cartUpdateResult.success) {
        // Delivery info saved to DB but Shopify cart address not updated.
        // The order will still use DB data at order-creation time, so this is non-fatal.
      }
    }

    return {
      success: true,
      message: 'Delivery information saved successfully!',
    };
  } catch (error) {
    const session = await auth.api.getSession({ headers: await headers() });
    await captureServerError(error, {
      service: 'checkout',
      action: 'save_delivery_info',
      userId: session?.user?.id,
      extra: { deliveryMethod: data.deliveryMethod, city: data.city },
    });
    return {
      success: false,
      message:
        'An error occurred while saving your delivery information. Please try again.',
    };
  }
}
