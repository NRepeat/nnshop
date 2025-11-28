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
      // Update ContactInformation
      await tx.contactInformation.updateMany({
        where: { userId: anonymousUserId },
        data: { userId: newUserId },
      });

      // Update DeliveryInformation
      await tx.deliveryInformation.updateMany({
        where: { userId: anonymousUserId },
        data: { userId: newUserId },
      });

      // Update PaymentInformation
      await tx.paymentInformation.updateMany({
        where: { userId: anonymousUserId },
        data: { userId: newUserId },
      });

      // Update Orders
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
