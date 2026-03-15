import { revalidatePath, revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';

import { revalidateSecret } from '@/shared/sanity/env';

// Types that require full layout revalidation (header, footer, etc.)
const LAYOUT_TYPES = [
  'siteSettings',
  'header',
  'footer',
  'infoBar',
  'page',
  'product',
  'promotionBanner',
];

export async function POST(req: NextRequest) {
  try {
    const { body, isValidSignature } = await parseBody<{
      type: string;
      path?: string;
      slug?: string;
    }>(req, revalidateSecret);
    if (!isValidSignature) {
      const message = 'Invalid signature';
      return new Response(message, { status: 401 });
    }

    if (!body) {
      const message = 'Bad Request';
      return new Response(message, { status: 400 });
    }

    const revalidatedPaths: string[] = [];
    const revalidatedTags: string[] = [];

    // Handle layout-related types (header, footer, siteSettings)
    if (body.type && LAYOUT_TYPES.includes(body.type)) {
      // Revalidate all layouts - this will refresh header/footer on all pages
      if (body?.path) {
        revalidatePath(body.path, 'layout');
      } else {
        revalidatePath('/', 'layout');
      }
      revalidatedPaths.push('/ (layout)');

      // Also revalidate the tag
      revalidateTag(body.type, 'max');
      revalidatedTags.push(body.type);
      if (body.type === 'product') {
        revalidatePath('/product/' + body.slug, 'page');
      }
    }

    // Handle slug-based revalidation
    if (body.slug) {
      revalidateTag(body.slug, 'max');
      revalidatePath(body.slug);
      revalidatedTags.push(body.slug);
    }

    // Handle type-based revalidation (for non-layout types)
    if (body.type && !LAYOUT_TYPES.includes(body.type)) {
      revalidateTag(body.type, 'max');
      revalidatedTags.push(body.type);
    }

    // If both slug and type provided
    if (body.slug && body.type) {
      revalidateTag(`${body.type}:${body.slug}`, 'max');
      revalidatedTags.push(`${body.type}:${body.slug}`);
    }

    // Shopify: collection updates also invalidate the slugs list
    if (body.type === 'collection') {
      revalidateTag('collections', 'max');
      revalidateTag('sitemap-categories', 'max');
      revalidatedTags.push('collections', 'sitemap-categories');
    }

    // Sitemap cache invalidation based on content type
    if (body.type === 'product') {
      revalidateTag('sitemap-products', 'max');
      revalidateTag('sitemap-brands', 'max'); // brands derived from product vendors
      revalidatedTags.push('sitemap-products', 'sitemap-brands');
    }
    if (body.type === 'post') {
      revalidateTag('sitemap-posts', 'max');
      revalidatedTags.push('sitemap-posts');
    }

    return NextResponse.json({
      status: 200,
      revalidated: true,
      now: Date.now(),
      body,
      revalidatedPaths,
      revalidatedTags,
    });
  } catch (err: any) {
    console.error(err);
    return new Response(err.message, { status: 500 });
  }
}
