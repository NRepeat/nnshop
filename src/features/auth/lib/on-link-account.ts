'use server';

import { revalidateTag } from 'next/cache';
import { prisma } from '../../../shared/lib/prisma';
import { ensureLoyaltyCardForUser } from '../../bonus/lib/link-card';
import { CART_TAGS } from '@shared/lib/cached-fetch';

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

      // If the anonymous session just completed an order (post-checkout login
      // via the bonus modal), also close out any pre-existing active cart on
      // the linked-into account so the user lands on a clean cart, not a stale
      // one carried over from a previous session.
      const anonHasCompletedCart = await tx.cart.findFirst({
        where: { userId: anonymousUserId, completed: true },
        select: { id: true },
      });
      if (anonHasCompletedCart) {
        await tx.cart.updateMany({
          where: { userId: newUserId, completed: false },
          data: { completed: true },
        });
      }
    });

    // Loyalty card: link/create card now that the user has a real account.
    // Only orders that already migrated above (Order.userId now = newUserId) qualify
    // for bonus accrual — accrueBonusForOrder finds the card via the user relation.
    try {
      const contact = await prisma.contactInformation.findUnique({
        where: { userId: newUserId },
        select: { phone: true, name: true, lastName: true },
      });
      if (contact?.phone) {
        const fullName = [contact.name, contact.lastName].filter(Boolean).join(' ');
        await ensureLoyaltyCardForUser(
          contact.phone,
          newUserId,
          fullName || undefined,
        );
      }
    } catch (cardErr) {
      console.error('[linkAnonymousData] loyalty card ensure failed', {
        step: 'ensure-loyalty-card',
        error: cardErr instanceof Error ? cardErr.message : String(cardErr),
      });
    }

    // Invalidate cart caches so the UI reflects the merged/closed state.
    try {
      revalidateTag(CART_TAGS.CART, { expire: 0 });
      revalidateTag(CART_TAGS.CART_ITEMS, { expire: 0 });
      revalidateTag(CART_TAGS.CART_SESSION, { expire: 0 });
    } catch {
      // revalidateTag throws if called outside request context — ignore.
    }
  } catch (error) {
    console.error('[linkAnonymousData] transaction failed', {
      step: 'prisma-link-anonymous-data',
      error: error instanceof Error ? error.message : String(error),
    });
    throw error; // re-throw so Promise.allSettled detects rejection
  }
};
