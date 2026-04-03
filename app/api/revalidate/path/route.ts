import { revalidateTag, revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';

import { revalidateSecret } from '@/shared/sanity/env';

// Types that require full layout revalidation (header, footer, etc.)
const LAYOUT_TYPES = [
  'siteSettings',
  'header',
  'footer',
  'infoBar',
  'promotionBanner',
  'locale',
];

export async function POST(req: NextRequest) {
  try {
    const { body, isValidSignature } = await parseBody<{
      type: string;
      path?: string;
      slug?: string | { current?: string };
    }>(req, revalidateSecret);

    console.log('[Revalidate] Received webhook:', {
      type: body?.type,
      slug: body?.slug,
      path: body?.path,
      isValidSignature,
    });

    if (!isValidSignature) {
      console.error('[Revalidate] Invalid signature');
      const message = 'Invalid signature';
      return new Response(message, { status: 401 });
    }

    if (!body) {
      console.error('[Revalidate] No body provided');
      const message = 'Bad Request';
      return new Response(message, { status: 400 });
    }

    const revalidatedPaths: string[] = [];
    const revalidatedTags: string[] = [];

    // Fallback to body.path if slug is missing (common in some Sanity webhooks)
    const slugValue =
      typeof body.slug === 'string'
        ? body.slug
        : body.slug?.current || body.path || undefined;

    // Handle layout-related types (header, footer, siteSettings)
    if (body.type && LAYOUT_TYPES.includes(body.type)) {
      // Revalidate the tag only — avoid wiping the entire site cache
      console.log(`[Revalidate] Revalidating tag: ${body.type}`);
      revalidateTag(body.type, 'max');
      revalidatedTags.push(body.type);
    }

    // Homepage uses gender-based tags ('man', 'woman') and 'homepage'
    // Sanity document type is 'page', so we also match that
    if (body.type === 'homePage' || body.type === 'homepage' || body.type === 'page') {
      console.log('[Revalidate] Revalidating homepage');
      revalidateTag('homepage', 'max');
      revalidatedTags.push('homepage');
    }

    // Handle slug-based revalidation
    if (slugValue) {
      console.log(`[Revalidate] Revalidating tag by slug: ${slugValue}`);
      revalidateTag(slugValue, 'max');
      revalidatedTags.push(slugValue);

      if (body.type) {
        const typeSlugTag = `${body.type}:${slugValue}`;
        console.log(`[Revalidate] Revalidating tag by type:slug: ${typeSlugTag}`);
        revalidateTag(typeSlugTag, 'max');
        revalidatedTags.push(typeSlugTag);

        // Path-based revalidation for localized content
        if (body.type === 'page') {
          console.log(`[Revalidate] Revalidating paths for page slug: ${slugValue}`);
          revalidatePath(`/uk/info/${slugValue}`, 'page');
          revalidatePath(`/ru/info/${slugValue}`, 'page');
          revalidatedPaths.push(`/uk/info/${slugValue}`, `/ru/info/${slugValue}`);
        }

        if (body.type === 'post') {
          console.log(`[Revalidate] Revalidating paths for post slug: ${slugValue}`);
          revalidatePath(`/uk/blog/${slugValue}`, 'page');
          revalidatePath(`/ru/blog/${slugValue}`, 'page');
          revalidatedPaths.push(`/uk/blog/${slugValue}`, `/ru/blog/${slugValue}`);
        }
      }
    }

    // Handle type-based revalidation (for non-layout types)
    // We only do this if it's NOT a layout type AND we haven't already revalidated it via slug
    if (body.type && !LAYOUT_TYPES.includes(body.type) && body.type !== 'page') {
      console.log(`[Revalidate] Revalidating tag by type: ${body.type}`);
      revalidateTag(body.type, 'max');
      revalidatedTags.push(body.type);
    }

    // Locale updates invalidate the locales cache
    if (body.type === 'locale') {
      console.log('[Revalidate] Revalidating locales');
      revalidateTag('locales', 'max');
      revalidatedTags.push('locales');
    }

    // Shopify: collection updates also invalidate the slugs list
    if (body.type === 'collection') {
      console.log('[Revalidate] Revalidating collection tags');
      revalidateTag('collections', 'max');
      revalidateTag('sitemap-categories', 'max');
      revalidatedTags.push('collections', 'sitemap-categories');
    }

    // Sitemap cache invalidation based on content type
    if (body.type === 'product') {
      console.log('[Revalidate] Revalidating product sitemap tags');
      revalidateTag('sitemap-products', 'max');
      revalidateTag('sitemap-brands', 'max');
      revalidatedTags.push('sitemap-products', 'sitemap-brands');
    }
    if (body.type === 'post') {
      console.log('[Revalidate] Revalidating post sitemap tags');
      revalidateTag('sitemap-posts', 'max');
      revalidatedTags.push('sitemap-posts');
    }

    console.log('[Revalidate] Success:', {
      revalidatedTags,
      revalidatedPaths,
      now: new Date().toISOString(),
    });

    return NextResponse.json({
      status: 200,
      revalidated: true,
      now: Date.now(),
      body,
      revalidatedPaths,
      revalidatedTags,
    });
  } catch (err: any) {
    console.error('[Revalidate] Error:', err);
    return new Response(err.message, { status: 500 });
  }
}
