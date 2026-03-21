import { routing } from '@shared/i18n/routing';
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { cleanSlug } from '@shared/lib/utils/cleanSlug';

import { hasGenderedSuffix } from '@entities/collection/lib/resolve-handle';
const handleI18nRouting = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let segments = pathname.split('/').filter(Boolean);
  const allowedGenders = ['man', 'woman'];
  const genderCookie = request.cookies.get('gender')?.value;

  // 0. Fast escape for well-known and system paths
  if (pathname.startsWith('/.well-known/')) {
    return NextResponse.next();
  }

  // --- GOAL STATE NORMALIZATION BLOCK ---
  const url = new URL(request.url);
  let changed = false;

  // 1. Canonical Host & Protocol Normalization
  const host = request.headers.get('host') || '';
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const isProductionDomain = host === 'miomio.com.ua' || host === 'www.miomio.com.ua';
  const canonicalHost = 'www.miomio.com.ua';

  if (isProductionDomain && (host !== canonicalHost || protocol === 'http')) {
    url.host = canonicalHost;
    url.protocol = 'https:';
    changed = true;
  }

  // 2. Trailing Slash Normalization (except root)
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1);
    changed = true;
  }

  // 3. Structural Path Logic
  // Refresh segments after potential trailing slash removal
  segments = url.pathname.split('/').filter(Boolean);

  // 3.1 Fix /[locale]/productt/[slug] → /[locale]/product/[slug] (301)
  const producttMatch = url.pathname.match(/^\/(uk|ru)\/productt\/(.+)$/);
  if (producttMatch) {
    url.pathname = cleanSlug(`/${producttMatch[1]}/product/${producttMatch[2]}`);
    segments = url.pathname.split('/').filter(Boolean);
    changed = true;
  }

  // 3.2 Fast redirect for Ukrainian gendered handles on Russian locale
  if (segments.length >= 3 && segments[0] === 'ru' && allowedGenders.includes(segments[1])) {
    const slug = segments[2];
    if (hasGenderedSuffix(slug)) {
      url.pathname = `/uk/${segments[1]}/${slug}`;
      segments = url.pathname.split('/').filter(Boolean);
      changed = true;
    }
  }

  // 3.3 Root and Locale Roots
  if (segments.length === 0) {
    url.pathname = '/uk/woman';
    changed = true;
  } else if (segments.length === 1 && routing.locales.includes(segments[0])) {
    url.pathname = `/${segments[0]}/woman`;
    changed = true;
  } else {
    // 3.4 Missing Locale Prefix
    const hasLocale = routing.locales.includes(segments[0]);
    if (!hasLocale) {
      url.pathname = cleanSlug(`/uk${url.pathname}`);
      segments = url.pathname.split('/').filter(Boolean);
      changed = true;
    }
  }

  // Perform single 301 redirect if any canonical part changed
  if (changed) {
    return NextResponse.redirect(url, { status: 301 });
  }

  // Refresh segments for the rest of the middleware if they were updated but not redirected
  // (though in this implementation, any path change triggers a redirect)
  segments = url.pathname.split('/').filter(Boolean);
  // --- END NORMALIZATION BLOCK ---

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
        const url = new URL(request.url);
        url.searchParams.delete('_gender');
        const response = NextResponse.redirect(url, { status: 301 });
        response.cookies.set('gender', cleanSlug(_gender), { path: '/', maxAge: 60 * 60 * 24 * 365 });
        return response;
      }
    }

    // If it's not a valid gender and not a known system route, it's a 404.
    if (!isGender && !isSystemPath) {
      const url = new URL(request.url);
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
  matcher: '/((?!api|trpc|_next|_vercel|studio|ingest|.*\\..*).*)',
};
