'use server';

import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';

/**
 * Saves the GA4 client_id (parsed from _ga cookie) to the User record.
 * Called from GA4Identify client component on every page load.
 * Skips DB write if value hasn't changed.
 */
export async function saveGaClientId(gaClientId: string): Promise<void> {
  if (!gaClientId || typeof gaClientId !== 'string') return;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id || session.user.isAnonymous) return;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { gaClientId: true },
  });

  if (user?.gaClientId === gaClientId) return;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { gaClientId },
  });
}
