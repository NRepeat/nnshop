import { routing } from '@shared/i18n/routing';
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Fix /[locale]/productt/[slug] → /[locale]/product/[slug] (301)
  const producttMatch = pathname.match(/^\/(uk|ru)\/productt\/(.+)$/);
  if (producttMatch) {
    const url = request.nextUrl.clone();
    url.pathname = `/${producttMatch[1]}/product/${producttMatch[2]}`;
    return NextResponse.redirect(url, { status: 301 });
  }

  // Root and locale-root → /uk/woman (301)
  const isRoot = pathname === '/';
  const isLocaleRoot = routing.locales.some((locale) => pathname === `/${locale}`);
  if (isRoot || isLocaleRoot) {
    const url = request.nextUrl.clone();
    url.pathname = '/uk/woman';
    return NextResponse.redirect(url, { status: 301 });
  }

  // Non-locale paths → /uk/[path] (301)
  const hasLocalePrefix = routing.locales.some((locale) =>
    pathname.startsWith(`/${locale}/`),
  );
  if (!hasLocalePrefix) {
    const url = request.nextUrl.clone();
    url.pathname = `/uk${pathname}`;
    return NextResponse.redirect(url, { status: 301 });
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|studio|.*\\..*).*)',
};
