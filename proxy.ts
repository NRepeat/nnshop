import { routing } from '@shared/i18n/routing';
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { cleanSlug } from '@shared/lib/utils/cleanSlug';

import { hasGenderedSuffix } from '@entities/collection/lib/resolve-handle';
const handleI18nRouting = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Global variables used across middleware
  const segments = pathname.split('/').filter(Boolean);
  const allowedGenders = ['man', 'woman'];
  const genderCookie = request.cookies.get('gender')?.value;

  // 0. Fast escape for well-known and system paths
  if (pathname.startsWith('/.well-known/')) {
    return NextResponse.next();
  }

  // 0.2 Fast redirect for Ukrainian gendered handles on Russian locale
  if (segments.length >= 3 && segments[0] === 'ru' && allowedGenders.includes(segments[1])) {
    const slug = segments[2];
    if (hasGenderedSuffix(slug)) {
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

  // 4. Determine effective gender: URL takes priority over cookie
  const urlGender = segments.length >= 2 && allowedGenders.includes(segments[1]) ? segments[1] : null;
  const effectiveGender = urlGender || (genderCookie && allowedGenders.includes(genderCookie) ? genderCookie : 'woman');

  const i18nResponse = handleI18nRouting(request);

  // Update cookie if missing or stale
  if (!genderCookie) {
    i18nResponse.cookies.set('gender', cleanSlug(effectiveGender), { path: '/', maxAge: 60 * 60 * 24 * 365 });
  } else if (urlGender && genderCookie !== urlGender) {
    i18nResponse.cookies.set('gender', cleanSlug(urlGender), { path: '/', maxAge: 60 * 60 * 24 * 365 });
  }

  // For non-redirect responses, forward x-gender as a request header so server
  // components can read the correct gender immediately (without waiting for the
  // cookie to round-trip to the browser and back).
  const isRedirect = i18nResponse.status >= 300 && i18nResponse.status < 400;
  if (!isRedirect) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-gender', effectiveGender);

    const finalResponse = NextResponse.next({ request: { headers: requestHeaders } });

    // Copy cookies from the i18n response
    i18nResponse.cookies.getAll().forEach((cookie) => {
      finalResponse.cookies.set(cookie.name, cookie.value, {
        path: cookie.path,
        maxAge: cookie.maxAge,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite as 'lax' | 'strict' | 'none' | undefined,
      });
    });

    // Forward x-middleware-rewrite so next-intl locale routing still works
    const rewrite = i18nResponse.headers.get('x-middleware-rewrite');
    if (rewrite) finalResponse.headers.set('x-middleware-rewrite', rewrite);

    return finalResponse;
  }

  return i18nResponse;
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|studio|ingest|ga|.*\\..*).*)',
};
