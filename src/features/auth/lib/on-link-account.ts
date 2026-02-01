'use server';

import { prisma } from '../../../shared/lib/prisma';

export const linkAnonymousDataToUser = async ({
  anonymousUserId,
  newUserId,
}: {
  anonymousUserId: string;
  newUserId: string;
}) => {
  try {
    await prisma.$transaction(async (tx) => {
      // Delete any existing data for the new user to avoid unique constraint violations
      // We prioritize keeping the anonymous user's data (cart, orders, etc.)

      // First delete NovaPoshtaDepartment (has foreign key to DeliveryInformation)
      const existingDeliveryInfo = await tx.deliveryInformation.findMany({
        where: { userId: newUserId },
        select: { id: true },
      });

      for (const deliveryInfo of existingDeliveryInfo) {
        await tx.novaPoshtaDepartment.deleteMany({
          where: { deliveryInformationId: deliveryInfo.id },
        });
      }

      await tx.contactInformation.deleteMany({
        where: { userId: newUserId },
      });

      await tx.deliveryInformation.deleteMany({
        where: { userId: newUserId },
      });

      await tx.paymentInformation.deleteMany({
        where: { userId: newUserId },
      });

      // Now update anonymous user's data to belong to the new user
      await tx.contactInformation.updateMany({
        where: { userId: anonymousUserId },
        data: { userId: newUserId },
      });

      await tx.deliveryInformation.updateMany({
        where: { userId: anonymousUserId },
        data: { userId: newUserId },
      });

      await tx.paymentInformation.updateMany({
        where: { userId: anonymousUserId },
        data: { userId: newUserId },
      });

      await tx.order.updateMany({
        where: { userId: anonymousUserId },
        data: { userId: newUserId },
      });

      await tx.favoriteProduct.updateMany({
        where: { userId: anonymousUserId },
        data: { userId: newUserId },
      });
    });
  } catch (error) {
    console.error('Error linking anonymous data to user:', error);
    throw new Error('An error occurred while linking anonymous data.');
  }
};
