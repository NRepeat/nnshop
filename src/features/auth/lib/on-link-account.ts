'use server';

import { prisma } from '../../../shared/lib/prisma';

export const linkAnonymousDataToUser = async ({
  anonymousUserId,
  newUserId,
}: {
  anonymousUserId: string;
  newUserId: string;
}) => {
  console.log('[linkAnonymousData] START', { anonymousUserId, newUserId });
  try {
    await prisma.$transaction(async (tx) => {
      console.log('[linkAnonymousData] Transaction started');

      // Delete any existing data for the new user to avoid unique constraint violations
      const existingDeliveryInfo = await tx.deliveryInformation.findMany({
        where: { userId: newUserId },
        select: { id: true },
      });
      console.log('[linkAnonymousData] Existing delivery info for new user:', existingDeliveryInfo.length);

      for (const deliveryInfo of existingDeliveryInfo) {
        await tx.novaPoshtaDepartment.deleteMany({
          where: { deliveryInformationId: deliveryInfo.id },
        });
      }

      const deletedContact = await tx.contactInformation.deleteMany({
        where: { userId: newUserId },
      });
      console.log('[linkAnonymousData] Deleted contact info:', deletedContact.count);

      const deletedDelivery = await tx.deliveryInformation.deleteMany({
        where: { userId: newUserId },
      });
      console.log('[linkAnonymousData] Deleted delivery info:', deletedDelivery.count);

      const deletedPayment = await tx.paymentInformation.deleteMany({
        where: { userId: newUserId },
      });
      console.log('[linkAnonymousData] Deleted payment info:', deletedPayment.count);

      // Now update anonymous user's data to belong to the new user
      const updatedContact = await tx.contactInformation.updateMany({
        where: { userId: anonymousUserId },
        data: { userId: newUserId },
      });
      console.log('[linkAnonymousData] Updated contact info:', updatedContact.count);

      const updatedDelivery = await tx.deliveryInformation.updateMany({
        where: { userId: anonymousUserId },
        data: { userId: newUserId },
      });
      console.log('[linkAnonymousData] Updated delivery info:', updatedDelivery.count);

      const updatedPayment = await tx.paymentInformation.updateMany({
        where: { userId: anonymousUserId },
        data: { userId: newUserId },
      });
      console.log('[linkAnonymousData] Updated payment info:', updatedPayment.count);

      const updatedOrders = await tx.order.updateMany({
        where: { userId: anonymousUserId },
        data: { userId: newUserId },
      });
      console.log('[linkAnonymousData] Updated orders:', updatedOrders.count);

      const updatedFavorites = await tx.favoriteProduct.updateMany({
        where: { userId: anonymousUserId },
        data: { userId: newUserId },
      });
      console.log('[linkAnonymousData] Updated favorites:', updatedFavorites.count);

      console.log('[linkAnonymousData] Transaction complete');
    });
    console.log('[linkAnonymousData] DONE');
  } catch (error) {
    console.error('[linkAnonymousData] ERROR:', error);
  }
};
