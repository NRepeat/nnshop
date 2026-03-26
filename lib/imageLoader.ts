import type { ImageLoaderProps } from 'next/image';

export default function imageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  const sanityQ = 100;
  const shopifyQ = 70;
  if (src.includes('cdn.shopify.com')) {
    const url = new URL(src);
    url.searchParams.set('width', String(width));
    url.searchParams.set('quality', String(shopifyQ));
    url.searchParams.set('format', 'webp');
    return url.toString();
  }

  if (src.includes('cdn.sanity.io')) {
    const url = new URL(src);
    url.searchParams.set('w', String(width));
    url.searchParams.set('q', String(sanityQ));
    url.searchParams.set('auto', 'format');
    url.searchParams.set('fit', 'max');
    return url.toString();
  }

  return src;
}
