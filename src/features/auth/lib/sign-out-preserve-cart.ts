'use server';

import { headers } from 'next/headers';
import { auth } from './auth';
import { prisma } from '@shared/lib/prisma';

/**
 * Sign out while preserving the active cart.
 *
 * Default better-auth signOut destroys the session. Cart rows are keyed by
 * userId, so the next request creates a fresh anonymous user with no cart.
 *
 * This action:
 *   1. Reads the current user's active cart (if any)
 *   2. Signs out (deletes session)
 *   3. Creates a new anonymous session in the same request
 *   4. Reassigns the cart to the new anonymous user
 *
 * Cookies are mutated in-place via Next's headers() handle.
 */
export async function signOutPreservingCart(): Promise<{ ok: boolean }> {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session?.user || session.user.isAnonymous) {
    // Already anonymous (or no session) — nothing to migrate.
    if (session) {
      await auth.api.signOut({ headers: reqHeaders });
    }
    return { ok: true };
  }

  const oldUserId = session.user.id;
  const activeCart = await prisma.cart.findFirst({
    where: { userId: oldUserId, completed: false },
    select: { id: true },
  });

  await auth.api.signOut({ headers: reqHeaders });

  // Anonymous plugin endpoint — creates new anon user + session cookie.
  // signInAnonymous refuses if an anonymous session is already attached, so
  // calling this immediately after signOut is the documented way to land in
  // a clean anon session.
  const anonResult = await auth.api.signInAnonymous({ headers: reqHeaders });
  const newAnonUserId = anonResult?.user?.id;

  if (activeCart && newAnonUserId) {
    await prisma.cart.update({
      where: { id: activeCart.id },
      data: { userId: newAnonUserId },
    });
  }

  return { ok: true };
}
