'use server';
import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';
import { PaymentInfo } from '../schema/paymentSchema';
import { User } from '~/generated/prisma/client';

export async function savePaymentInfo(
  data: PaymentInfo,
): Promise<{ success: boolean; user?: User | null; message: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return { success: false, message: 'Session not found' };
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        paymentInformation: {
          upsert: {
            where: { userId: session.user.id },
            create: {
              ...data,
            },
            update: {
              ...data,
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
  } catch (error) {
    console.error('Error saving payment info:', error);
    return {
      success: false,
      message:
        'An error occurred while saving your payment information. Please try again.',
    };
  }
}
