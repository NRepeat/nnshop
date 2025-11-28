'use server';
import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';
import { PaymentInfo } from '../schema/paymentSchema';
import { User } from '~/generated/prisma/client';

export async function savePaymentInfo(
  data: PaymentInfo,
  orderId: string,
): Promise<{ success: boolean; user?: User | null; message: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      const user = await prisma.user.findFirst({
        where: {
          orders: {
            some: {
              id: orderId,
            },
          },
        },
      });
      if (!user) {
        throw new Error('User not found');
      }
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          paymentInformation: {
            upsert: {
              where: { userId: user.id },
              create: {
                ...data,
                orderId: orderId,
              },
              update: {
                ...data,
                orderId: orderId,
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
                orderId: orderId,
              },
              update: {
                ...data,
                orderId: orderId,
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
