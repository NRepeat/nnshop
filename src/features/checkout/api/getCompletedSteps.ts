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

    const cacheOpts = { cacheStrategy: { ttl: 30, swr: 60 } } as any;
    const [contactInfo, deliveryInfo, paymentInfo] = await Promise.all([
      prisma.contactInformation.findUnique({ where: { userId }, ...cacheOpts }),
      prisma.deliveryInformation.findUnique({ where: { userId }, ...cacheOpts }),
      prisma.paymentInformation.findUnique({ where: { userId }, ...cacheOpts }),
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
