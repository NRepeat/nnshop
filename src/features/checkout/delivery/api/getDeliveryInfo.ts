'use server';
import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';
import { DeliveryInfo } from '../model/deliverySchema';
import { prisma } from '@shared/lib/prisma';

export async function getDeliveryInfo(): Promise<DeliveryInfo | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      // It should not throw error, but rather return null, allowing a fresh start
      return null;
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user) {
      return null;
    }

    const prismaDeliveryInfo = await prisma.deliveryInformation.findUnique({
      where: { userId: user.id },
      include: {
        novaPoshtaDepartment: true,
      },
    });

    if (!prismaDeliveryInfo) {
      return null;
    }

    const deliveryInfo: DeliveryInfo = {
      deliveryMethod:
        prismaDeliveryInfo.deliveryMethod as DeliveryInfo['deliveryMethod'],
      country: prismaDeliveryInfo.country || undefined,
      address: prismaDeliveryInfo.address || undefined,
      apartment: prismaDeliveryInfo.apartment || undefined,
      city: prismaDeliveryInfo.city || undefined,
      postalCode: prismaDeliveryInfo.postalCode || undefined,
      novaPoshtaDepartment: prismaDeliveryInfo.novaPoshtaDepartment
        ? {
            id: prismaDeliveryInfo.novaPoshtaDepartment.id,
            shortName: prismaDeliveryInfo.novaPoshtaDepartment.shortName,
            addressParts: {
              city: prismaDeliveryInfo.novaPoshtaDepartment.city || undefined,
              street:
                prismaDeliveryInfo.novaPoshtaDepartment.street || undefined,
              building:
                prismaDeliveryInfo.novaPoshtaDepartment.building || undefined,
            },
            coordinates:
              prismaDeliveryInfo.novaPoshtaDepartment.latitude &&
              prismaDeliveryInfo.novaPoshtaDepartment.longitude
                ? {
                    latitude: prismaDeliveryInfo.novaPoshtaDepartment.latitude,
                    longitude:
                      prismaDeliveryInfo.novaPoshtaDepartment.longitude,
                  }
                : undefined,
          }
        : undefined,
    };

    return deliveryInfo;
  } catch (error) {
    console.error('Error getting delivery info:', error);
    return null;
  }
}
