import { routing } from '@shared/i18n/routing';
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { cleanSlug } from '@shared/lib/utils/cleanSlug';

import { hasGenderedSuffix } from '@entities/collection/lib/resolve-handle';
import { storefrontClient } from '@shared/lib/shopify/client';
import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import { GetCollectionQuery } from '@shared/lib/shopify/types/storefront.generated';
import { GetCollectionProxy } from '@entities/collection/api/query';

const handleI18nRouting = createMiddleware(routing);

async function checkProductExists(handle: string, locale: string) {
  try {
    const query = `#graphql
      query checkProduct($handle: String!) {
        product(handle: $handle) {
          id
        }
      }
    `;
    const response = await storefrontClient.request<any, { handle: string }>({
      query,
      variables: { handle },
      language: locale as StorefrontLanguageCode,
    });
    return !!response.product;
  } catch (e) {
    console.error(`❌ Proxy: Error checking product ${handle}:`, e);
    return true; // Fail safe
  }
}
async function checkCollectionExists(handle: string, locale: string) {
  'use cache';
  try {
    const collection = await storefrontClient.request<
      GetCollectionQuery,
      {
        handle: string;
      }
    >({
      query: GetCollectionProxy,
      variables: {
        handle,
      },
      language: locale.toUpperCase() as StorefrontLanguageCode,
    });

    return !!collection.collection;
  } catch (e) {
    console.error(`❌ Proxy: Error checking collectio ${handle}:`, e);
    return true;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip internal and checked requests
  if (
    pathname.includes('_next') ||
    pathname.includes('favicon') ||
    request.headers.get('x-middleware-skip') === 'true'
  ) {
    return NextResponse.next();
  }

  let segments = pathname.split('/').filter(Boolean);
  const allowedGenders = ['man', 'woman'];

  const locale = segments[0] || 'uk';
  const isProductPage = segments.length >= 3 && segments[1] === 'product';

  if (isProductPage) {
    const handle = decodeURIComponent(segments[2]);
    const exists = await checkProductExists(handle, locale);

    if (!exists) {
      console.log(`🚫 Proxy: Product ${handle} not found. Returning 404.`);
      const url = new URL(request.url);
      url.pathname = `/${locale}/404`; // Standard path for not found

      const response = NextResponse.rewrite(url, { status: 404 });
      response.headers.set('x-middleware-skip', 'true');
      return NextResponse.rewrite(new URL('/404', url), { status: 404 });
    }
  }

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
  const isProductionDomain =
    host === 'miomio.com.ua' || host === 'www.miomio.com.ua';
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
    url.pathname = cleanSlug(
      `/${producttMatch[1]}/product/${producttMatch[2]}`,
    );
    segments = url.pathname.split('/').filter(Boolean);
    changed = true;
  }

  // 3.2 Fast redirect for Ukrainian gendered handles on Russian locale
  if (
    segments.length >= 3 &&
    segments[0] === 'ru' &&
    allowedGenders.includes(segments[1])
  ) {
    const slug = segments[2];
    if (hasGenderedSuffix(slug)) {
      url.pathname = `/uk/${segments[1]}/${slug}`;
      segments = url.pathname.split('/').filter(Boolean);
      changed = true;
    }
  }

  // 3.3 Missing Locale Prefix (root and locale-only paths handled by i18n middleware)
  if (segments.length > 0) {
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
    const secondSegment = segments[1];

    const reservedSystemPaths = [
      'account',
      'auth',
      'blog',
      'brand',
      'brands',
      'cart',
      'checkout',
      'favorites',
      'info',
      'orders',
      'product',
      'quick',
      'search',
    ];

    const isGender = allowedGenders.includes(secondSegment);
    const isSystemPath = reservedSystemPaths.includes(secondSegment);

    // If it's not a valid gender and not a known system route, it's a 404.
    // We stop processing here and let Next.js return a true 404 status.
    if (!isGender && !isSystemPath) {
      return NextResponse.next();
    }

    // Repetitive path: /uk/woman/woman, /uk/man/man etc
    if (isGender && segments.length >= 3 && segments[2] === segments[1]) {
      return NextResponse.next();
    }
    if (isGender && segments.length >= 3) {
      const handle = decodeURIComponent(segments[2]);
      const exists = await checkCollectionExists(handle, locale);

      if (!exists) {
        console.log(
          `🚫 Proxy: Collection ${handle} not found. Returning 404.`,
          segments,
          exists,
        );
        const url = new URL(request.url);
        url.pathname = `/${locale}/404`; // Standard path for not found

        const response = NextResponse.rewrite(url, { status: 404 });
        response.headers.set('x-middleware-skip', 'true');
        return NextResponse.rewrite(new URL('/404', url), { status: 404 });
      }
    }
  }

  const i18nResponse = handleI18nRouting(request);

  // Important: if the URL contains /product/, and we know it will trigger notFound()
  // on the page level, we must ensure we don't fix the status to 200 via rewrites here.
  return i18nResponse;
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|studio|ingest|.*\\..*).*)',
};
