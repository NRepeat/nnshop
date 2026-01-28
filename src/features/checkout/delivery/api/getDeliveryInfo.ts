'use server';

import { DeliveryInfo } from '../model/deliverySchema';
import { prisma } from '@shared/lib/prisma';
import { Session, User } from 'better-auth';

export async function getDeliveryInfo(
  session: { session: Session; user: User } | null,
): Promise<DeliveryInfo | null> {
  try {
    if (!session) {
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
