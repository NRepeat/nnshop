import type { ImageLoaderProps } from 'next/image';

export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  const q = quality ?? 75;

  if (src.includes('cdn.shopify.com')) {
    const url = new URL(src);
    url.searchParams.set('width', String(width));
    url.searchParams.set('quality', String(q));
    url.searchParams.set('format', 'webp');
    return `/assets/shopify-cdn${url.pathname}${url.search}`;
  }

  if (src.includes('cdn.sanity.io')) {
    const url = new URL(src);
    url.searchParams.set('w', String(width));
    url.searchParams.set('q', String(q));
    url.searchParams.set('auto', 'format');
    url.searchParams.set('fit', 'max');
    return `/assets/sanity-cdn${url.pathname}${url.search}`;
  }

  return src;
}
