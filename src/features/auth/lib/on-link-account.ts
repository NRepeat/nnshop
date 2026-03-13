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

      await tx.recentlyViewedProduct.updateMany({
        where: { userId: anonymousUserId },
        data: { userId: newUserId },
      });
    });
  } catch (error) {
    console.error('[linkAnonymousData] transaction failed', {
      step: 'prisma-link-anonymous-data',
      error: error instanceof Error ? error.message : String(error),
    });
    throw error; // re-throw so Promise.allSettled detects rejection
  }
};
