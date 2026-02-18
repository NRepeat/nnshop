import { storefrontClient } from '@shared/lib/shopify/client';

/**
 * Batch-fetch featured image URLs for a list of product handles.
 * Uses aliased queries to do it in a single Storefront API request.
 * Returns a map of handle → imageUrl.
 */
export async function fetchProductImages(
  handles: string[],
  locale = 'UK',
): Promise<Record<string, string>> {
  const unique = [...new Set(handles.filter(Boolean))];
  if (unique.length === 0) return {};

  const aliases = unique
    .map((h, i) => `p${i}: product(handle: ${JSON.stringify(h)}) { featuredImage { url } }`)
    .join('\n');

  const query = `query fetchOrderImages { ${aliases} }`;

  try {
    const data = await storefrontClient.request<Record<string, { featuredImage: { url: string } | null } | null>>({
      query,
      language: locale as any,
    });

    const result: Record<string, string> = {};
    unique.forEach((handle, i) => {
      const url = data[`p${i}`]?.featuredImage?.url;
      if (url) result[handle] = url;
    });
    return result;
  } catch (err) {
    console.error('fetchProductImages error:', err);
    return {};
  }
}
