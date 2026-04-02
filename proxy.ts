import { routing } from '@shared/i18n/routing';
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { cleanSlug } from '@shared/lib/utils/cleanSlug';

import { hasGenderedSuffix } from '@entities/collection/lib/resolve-handle';
import { storefrontClient } from '@shared/lib/shopify/client';
import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import {
  GetCollectionQuery,
  GetProductByHandleQuery,
} from '@shared/lib/shopify/types/storefront.generated';
import { GetCollectionProxy } from '@entities/collection/api/query';
import {
  GET_PRODUCT_QUERY,
  GET_PROXY_PRODUCT_QUERY,
} from '@entities/product/api/getProduct';

const handleI18nRouting = createMiddleware(routing);

async function checkProductExists(handle: string, locale: string): Promise<{ exists: boolean; canonicalHandle?: string; correctLocale?: string }> {
  try {
    const product = await storefrontClient.request<
      GetProductByHandleQuery,
      { handle: string }
    >({
      query: GET_PROXY_PRODUCT_QUERY,
      variables: { handle },
      language: locale.toUpperCase() as StorefrontLanguageCode,
    });

    if (!product.product) {
      // Product not found with current locale — try the other locale
      const altLocale = locale === 'uk' ? 'ru' : 'uk';
      const altProduct = await storefrontClient.request<
        GetProductByHandleQuery,
        { handle: string }
      >({
        query: GET_PROXY_PRODUCT_QUERY,
        variables: { handle },
        language: altLocale.toUpperCase() as StorefrontLanguageCode,
      });

      if (altProduct.product) {
        // Product exists but belongs to the other locale
        return { exists: true, canonicalHandle: altProduct.product.handle, correctLocale: altLocale };
      }

      return { exists: false };
    }

    // Handle mismatch = wrong locale handle (e.g. UK handle on /ru/ path)
    if (product.product.handle !== handle) {
      return { exists: true, canonicalHandle: product.product.handle };
    }

    return { exists: true };
  } catch (e) {
    console.error(`❌ Proxy: Error checking product ${handle}:`, e);
    return { exists: true }; // Fail safe
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
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const isProductionHost =
    host === 'miomio.com.ua' || host === 'www.miomio.com.ua';

  // Strip internal port (e.g. :3000) only on production behind reverse proxy
  if (isProductionHost) {
    request.nextUrl.port = '';
  }

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
    const result = await checkProductExists(handle, locale);

    if (!result.exists) {
      console.log(`🚫 Proxy: Product ${handle} not found. Returning 404.`);
      return NextResponse.rewrite(new URL('/404', request.url), { status: 404 });
    }

    if (result.canonicalHandle || result.correctLocale) {
      const targetLocale = result.correctLocale || locale;
      const targetHandle = result.canonicalHandle || handle;
      console.log(`🔀 Proxy: Product /${locale}/product/${handle} → /${targetLocale}/product/${targetHandle}`);
      const redirectUrl = new URL(request.url);
      if (isProductionHost) {
        redirectUrl.host = 'www.miomio.com.ua';
        redirectUrl.port = '';
        redirectUrl.protocol = 'https:';
      }
      redirectUrl.pathname = `/${targetLocale}/product/${targetHandle}`;
      return NextResponse.redirect(redirectUrl, { status: 301 });
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
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const canonicalHost = 'www.miomio.com.ua';

  // Strip internal port (e.g. :3000) when behind a reverse proxy
  if (isProductionHost) {
    url.port = '';
    url.protocol = 'https:';
    if (host !== canonicalHost) {
      url.host = canonicalHost;
      changed = true;
    }
    if (protocol === 'http') {
      changed = true;
    }
  }

  // 2. Trailing Slash Normalization (except root)
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1);
    changed = true;
  }

  // 2.1 Strip empty query string (trailing "?")
  // new URL() normalizes search to '' even when raw URL has trailing '?',
  // so check the raw URL string instead
  if (url.search === '' && request.url.endsWith('?')) {
    url.search = '';
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

  // 3.3 Missing Locale Prefix → hard 404
  if (segments.length > 0) {
    const hasLocale = routing.locales.includes(segments[0]);
    if (!hasLocale) {
      return new NextResponse(null, { status: 404 });
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
  
    request.headers.set('x-pathname', pathname);

    // Brand page: check collection exists in Shopify before rendering
    if (secondSegment === 'brand' && segments.length >= 3) {
      const handle = decodeURIComponent(segments[2]);
      const exists = await checkCollectionExists(handle, locale);

      if (!exists) {
        console.log(`🚫 Proxy: Brand ${handle} not found. Returning 404.`);
        return NextResponse.rewrite(new URL('/404', request.url), { status: 404 });
      }
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
  if (segments[1] && allowedGenders.includes(segments[1])) {
    i18nResponse.headers.set('x-gender', segments[1]);
  }
  i18nResponse.headers.set('x-pathname', pathname);

  return i18nResponse;
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|studio|ingest|.*\\..*).*)',
};
