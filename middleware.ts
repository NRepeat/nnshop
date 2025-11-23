import { routing } from '@/shared/i18n/routing';
import { auth } from '@features/auth/lib/auth';
import createMiddleware from 'next-intl/middleware';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const response = handleI18nRouting(request);

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    try {
      await auth.api.signInAnonymous();
    } catch (error) {
      console.error('Failed to sign in anonymously:', error);
      // If anonymous sign-in fails, redirect to a login page.
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  runtime: 'nodejs',
  matcher: '/((?!api|trpc|_next|_vercel|studio|.*\\..*).*)',
};
