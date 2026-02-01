'use server';

import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';

export type CheckoutStep = 'info' | 'delivery' | 'payment';

export async function getCompletedSteps(): Promise<CheckoutStep[]> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return [];
    }

    const userId = session.user.id;

    const [contactInfo, deliveryInfo, paymentInfo] = await Promise.all([
      prisma.contactInformation.findUnique({ where: { userId } }),
      prisma.deliveryInformation.findUnique({ where: { userId } }),
      prisma.paymentInformation.findUnique({ where: { userId } }),
    ]);

    const completedSteps: CheckoutStep[] = [];

    if (contactInfo) {
      completedSteps.push('info');
    }

    if (deliveryInfo) {
      completedSteps.push('delivery');
    }

    if (paymentInfo) {
      completedSteps.push('payment');
    }

    return completedSteps;
  } catch (error) {
    console.error('Error getting completed steps:', error);
    return [];
  }
}
