'use server';
import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';
import { PaymentInfo } from '../schema/paymentSchema';
import { User } from '~/generated/prisma/client';

export async function savePaymentInfo(
  data: PaymentInfo,
  shopifyOrderId: string,
): Promise<{ success: boolean; user?: User | null; message: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    // Find the DB order by shopifyOrderId
    const order = await prisma.order.findFirst({
      where: { shopifyOrderId: shopifyOrderId },
    });
    const dbOrderId = order?.id || shopifyOrderId;

    if (!session) {
      if (!order) throw new Error('Order not found');
      const user = await prisma.user.findUnique({ where: { id: order.userId } });
      if (!user) {
        throw new Error('User not found');
      }
      await prisma.user.update({
        where: { id: user.id },
        data: {
          paymentInformation: {
            upsert: {
              where: { userId: user.id },
              create: {
                ...data,
                orderId: dbOrderId,
              },
              update: {
                ...data,
                orderId: dbOrderId,
              },
            },
          },
        },
      });
      return {
        success: true,
        user,
        message: 'Payment information saved successfully!',
      };
    } else {
      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          paymentInformation: {
            upsert: {
              where: { userId: session.user.id },
              create: {
                ...data,
                orderId: dbOrderId,
              },
              update: {
                ...data,
                orderId: dbOrderId,
              },
            },
          },
        },
      });

      return {
        success: true,
        user,
        message: 'Payment information saved successfully!',
      };
    }
  } catch (error) {
    console.error('Error saving payment info:', error);
    return {
      success: false,
      message:
        'An error occurred while saving your payment information. Please try again.',
    };
  }
}
