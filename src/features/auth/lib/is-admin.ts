import { headers } from 'next/headers';
import { auth } from './auth';

function getAllowlist(): Set<string> {
  const raw = process.env.ADMIN_EMAILS || '';
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAllowlist().has(email.toLowerCase());
}

export async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  if (!isAdminEmail(session.user.email)) return null;
  return session;
}
