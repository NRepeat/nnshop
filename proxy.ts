import { routing } from '@shared/i18n/routing';
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isRoot = pathname === '/';
  const isLocaleRoot = routing.locales.some((locale) => pathname === `/${locale}`);

  if (isRoot || isLocaleRoot) {
    const url = request.nextUrl.clone();
    url.pathname = `${pathname === '/' ? '' : pathname}/woman`;
    return NextResponse.redirect(url);
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|studio|.*\\..*).*)',
};
