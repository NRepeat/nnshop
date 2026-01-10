import { auth } from '@features/auth/lib/auth';
import { routing } from '@shared/i18n/routing';
import createMiddleware from 'next-intl/middleware';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    try {
      await auth.api.signInAnonymous();
    } catch (error) {
      console.error('Failed to sign in anonymously:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|studio|.*\\..*).*)',
};
