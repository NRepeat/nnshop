/** Fetch a tiny version of a Shopify image and return as base64 data URL */
export async function getBlurDataUrl(imageUrl: string): Promise<string> {
  if (!imageUrl || !imageUrl.includes('cdn.shopify.com')) return '';
  try {
    const url = new URL(imageUrl);
    url.searchParams.set('width', '64');
    url.searchParams.set('quality', '10');
    const res = await fetch(url.toString());
    if (!res.ok) return '';
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    return `data:${contentType};base64,${base64}`;
  } catch {
    return '';
  }
}
