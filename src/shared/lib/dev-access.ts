import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';

/**
 * Returns true if the current user's email is in the DEV_EMAILS env var.
 * Used to restrict dev/test pages (collections, products) to internal users only.
 *
 * Env vars:
 *   DEV_EMAILS=email1@example.com,email2@example.com
 *   DEV_ONLY_HANDLES=test-collection,test-online-shop
 */
export async function isDevEmail(): Promise<boolean> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.email) return false;
  const allowed = (process.env.DEV_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
  return allowed.includes(session.user.email);
}

export function isDevOnlyHandle(handle: string): boolean {
  const devHandles = (process.env.DEV_ONLY_HANDLES ?? '')
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean);
  return devHandles.includes(handle);
}
