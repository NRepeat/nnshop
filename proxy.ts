import { routing } from '@shared/i18n/routing';
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { cleanSlug } from '@shared/lib/utils/cleanSlug';

import { GENDERED_HANDLES } from '@entities/collection/lib/resolve-handle';
const handleI18nRouting = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Global variables used across middleware
  const segments = pathname.split('/').filter(Boolean);
  const allowedGenders = ['man', 'woman'];
  const genderCookie = request.cookies.get('gender')?.value;

  // 0. Fast redirect for Ukrainian gendered handles on Russian locale
  if (segments.length >= 3 && segments[0] === 'ru' && allowedGenders.includes(segments[1])) {
    const slug = segments[2];
    if (GENDERED_HANDLES.has(slug)) {
      const url = request.nextUrl.clone();
      url.pathname = `/uk/${segments[1]}/${slug}`;
      return NextResponse.redirect(url, { status: 301 }); // Use 301 for SEO
    }
  }

  // Fix /[locale]/productt/[slug] → /[locale]/product/[slug] (301)
  const producttMatch = pathname.match(/^\/(uk|ru)\/productt\/(.+)$/);
  if (producttMatch) {
    const url = request.nextUrl.clone();
    url.pathname = cleanSlug(`/${producttMatch[1]}/product/${producttMatch[2]}`);
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

  // 1. Non-locale paths → /uk/[path] (301)
  const hasLocalePrefix = routing.locales.some((locale) =>
    pathname.startsWith(`/${locale}/`),
  );
  if (!hasLocalePrefix) {
    const url = request.nextUrl.clone();
    url.pathname = cleanSlug(`/uk${pathname}`);
    return NextResponse.redirect(url, { status: 301 });
  }

  // 2. Route Guard & Gender Detection
  if (segments.length >= 2) {
    const locale = segments[0];
    const secondSegment = segments[1];
    
    const reservedSystemPaths = [
      'account', 'auth', 'blog', 'brand', 'brands', 
      'cart', 'checkout', 'favorites', 'info', 
      'orders', 'product', 'quick', 'search'
    ];

    const isGender = allowedGenders.includes(secondSegment);
    const isSystemPath = reservedSystemPaths.includes(secondSegment);

    // 3. Fix brand URLs with _gender parameter (SEO consolidation)
    if (secondSegment === 'brand' && segments.length >= 3) {
      const _gender = request.nextUrl.searchParams.get('_gender');
      if (_gender) {
        const url = request.nextUrl.clone();
        url.searchParams.delete('_gender');
        const response = NextResponse.redirect(url, { status: 301 });
        response.cookies.set('gender', cleanSlug(_gender), { path: '/', maxAge: 60 * 60 * 24 * 365 });
        return response;
      }
    }

    // If it's not a valid gender and not a known system route, it's a 404.
    if (!isGender && !isSystemPath) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/404`;
      return NextResponse.rewrite(url);
    }
  }

  const i18nResponse = handleI18nRouting(request);

  // 4. Ensure gender cookie is set
  if (!genderCookie) {
    let initialGender = 'woman';
    if (segments.length >= 2 && allowedGenders.includes(segments[1])) {
      initialGender = segments[1];
    }
    i18nResponse.cookies.set('gender', cleanSlug(initialGender), { path: '/', maxAge: 60 * 60 * 24 * 365 });
  } 
  else if (segments.length >= 2 && allowedGenders.includes(segments[1]) && genderCookie !== segments[1]) {
    i18nResponse.cookies.set('gender', cleanSlug(segments[1]), { path: '/', maxAge: 60 * 60 * 24 * 365 });
  }

  return i18nResponse;
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|studio|ingest|.*\\..*).*)',
};
