import { auth } from '@/features/auth/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { NextRequest } from 'next/server';

const handler = toNextJsHandler(auth);

export const GET = handler.GET;

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  console.log('[auth-route] POST', url.pathname);

  const response = await handler.POST(req);

  if (response.status >= 400) {
    const cloned = response.clone();
    try {
      const body = await cloned.json();
      console.error('[auth-route] ERROR', response.status, JSON.stringify(body, null, 2));
    } catch {
      const text = await cloned.text();
      console.error('[auth-route] ERROR', response.status, text);
    }
  }

  return response;
}
