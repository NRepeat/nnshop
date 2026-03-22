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

    // If it's not a valid gender and not a known system route, it's a 404.
    if (!isGender && !isSystemPath) {
      const url = new URL(request.url);
      url.pathname = `/${locale}/404`;
      return NextResponse.rewrite(url);
    }
  }

  // 4. Determine effective gender: URL takes priority, then search params, then cookie
  const urlGender = segments.length >= 2 && allowedGenders.includes(segments[1]) ? segments[1] : null;
  const searchGender = request.nextUrl.searchParams.get('_gender');
  const cookieGender = request.cookies.get('gender')?.value;
  
  const effectiveGender = urlGender || 
    (searchGender && allowedGenders.includes(searchGender) ? searchGender : 
    (cookieGender && allowedGenders.includes(cookieGender) ? cookieGender : 'woman'));

  const i18nResponse = handleI18nRouting(request);

  // For non-redirect responses, forward x-gender as a request header so server
  // components can read the correct gender immediately.
  const isRedirect = i18nResponse.status >= 300 && i18nResponse.status < 400;
  if (!isRedirect) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-gender', effectiveGender);

    const finalResponse = NextResponse.next({ request: { headers: requestHeaders } });

    // Set/Update the gender cookie to match the effective gender
    finalResponse.cookies.set('gender', effectiveGender, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    });

    // Copy other cookies from the i18n response
    i18nResponse.cookies.getAll().forEach((cookie) => {
      if (cookie.name === 'gender') return; // already set above
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
