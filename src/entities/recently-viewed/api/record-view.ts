'use server';

import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';

export const recordProductView = async (
  productHandle: string,
  productId: string,
): Promise<{ success: boolean; reason?: string }> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    // Anonymous user not yet signed in (no cart action triggered yet) — skip silently
    return { success: false, reason: 'NO_SESSION' };
  }

  const userId = session.user.id;

  try {
    // Upsert: update viewedAt to move to front if already viewed
    await prisma.recentlyViewedProduct.upsert({
      where: { userId_productId: { userId, productId } },
      update: { viewedAt: new Date() },
      create: { userId, productId, productHandle },
    });

    // Cap at 20: find records beyond the 20 most recent, delete them
    const overflow = await prisma.recentlyViewedProduct.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
      skip: 20,
      select: { id: true },
    });
    if (overflow.length > 0) {
      await prisma.recentlyViewedProduct.deleteMany({
        where: { id: { in: overflow.map((r) => r.id) } },
      });
    }

    return { success: true };
  } catch (error) {
    console.error('[recordProductView] failed', {
      step: 'prisma-recently-viewed',
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, reason: 'DB_ERROR' };
  }
};
