import { auth } from '@/features/auth/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { NextRequest, NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';

const handler = toNextJsHandler(auth);

const BOT_PROTECTED_PATHS = ['/api/auth/sign-in/email', '/api/auth/sign-up/email', '/api/auth/forget-password'];

export const GET = handler.GET;

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  console.log('[auth-route] POST', url.pathname);

  if (BOT_PROTECTED_PATHS.includes(url.pathname)) {
    const verification = await checkBotId();
    if (verification.isBot) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
  }

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
