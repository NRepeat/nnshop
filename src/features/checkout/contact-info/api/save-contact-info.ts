'use server';
import { auth } from '@features/auth/lib/auth';
import { contactInfoSchema, formatPhoneForShopify } from '@features/checkout/schema/contactInfoSchema';
import { updateCartBuyerIdentity } from '@entities/cart/api/shopify-cart-buyer-identity-update';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';
import { captureServerError } from '@shared/lib/posthog/posthog-server';
import { ensureLoyaltyCardForUser } from '@features/bonus/lib/link-card';
import z from 'zod';

const saveContactInfo = async (data: z.infer<typeof contactInfoSchema>) => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      throw new Error('Session not found');
    }
    const transaction = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: {
          id: session.user.id,
        },
      });
      if (!user) {
        throw new Error('User not found');
      }
      return await tx.user.update({
        where: { id: user.id },
        data: {
          contactInformation: {
            upsert: {
              where: {
                userId: user.id,
              },
              update: {
                countryCode: data.countryCode,
                email: data.email,
                lastName: data.lastName,
                name: data.name,
                phone: data.phone,
                preferViber: data.preferViber || false,
              },
              create: {
                countryCode: data.countryCode,
                email: data.email,
                lastName: data.lastName,
                name: data.name,
                phone: data.phone,
                preferViber: data.preferViber || false,
              },
            },
          },
        },
      });
    });
    // Update Shopify cart buyer identity so tax/shipping calculations know who is checking out
    const cartRecord = await prisma.cart.findFirst({
      where: { userId: session.user.id, completed: false },
    });
    if (cartRecord) {
      const formattedPhone = formatPhoneForShopify(data.phone, data.countryCode);
      await updateCartBuyerIdentity(cartRecord.cartToken, {
        email: data.email,
        phone: formattedPhone,
        countryCode: data.countryCode,
      });
    }

    // Loyalty card lifecycle:
    //   - registered users: link existing seeded card by phone, or create new card.
    //   - anonymous users: skipped — bonuses can't accrue without a real account.
    if (!session.user.isAnonymous) {
      try {
        const fullName = [data.name, data.lastName].filter(Boolean).join(' ');
        await ensureLoyaltyCardForUser(
          data.phone,
          session.user.id,
          fullName || undefined,
        );
      } catch (err) {
        console.error('[save-contact-info] ensureLoyaltyCardForUser failed:', err);
      }
    }

    return transaction;
  } catch (e) {
    const session = await auth.api.getSession({ headers: await headers() });
    await captureServerError(e, {
      service: 'checkout',
      action: 'save_contact_info',
      userId: session?.user?.id,
      extra: { email: data.email },
    });
    throw new Error(String(e));
  }
};
export default saveContactInfo;
