'use server';
import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';
import { PaymentInfo } from '../schema/paymentSchema';

export async function getPaymentInfo(): Promise<PaymentInfo | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return null;
    }

    const paymentInfo = await prisma.paymentInformation.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    return paymentInfo as PaymentInfo | null;
  } catch (error) {
    console.error('Error getting payment info:', error);
    return null;
  }
}
