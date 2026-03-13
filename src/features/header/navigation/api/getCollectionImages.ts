'use server';

import { storefrontClient } from '@shared/lib/shopify/client';
import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import { cacheLife, cacheTag } from 'next/cache';

export async function getCollectionImages(
  handles: string[],
  locale: string,
): Promise<Record<string, string | null>> {
  'use cache';
  cacheLife('max');
  cacheTag('menu');

  // Filter out empty/invalid handles
  const validHandles = handles.filter((h) => h && h.length > 0);
  if (!validHandles.length) return {};

  const fields = validHandles
    .map(
      (h, i) => `
    c${i}: collection(handle: ${JSON.stringify(h)}) {
      image { url }
    }`,
    )
    .join('\n');

  const query = `#graphql\n  query GetCollectionImages {\n${fields}\n  }`;

  try {
    const data = await storefrontClient.request({
      query,
      language: locale.toUpperCase() as StorefrontLanguageCode,
    });

    const result: Record<string, string | null> = {};
    validHandles.forEach((h, i) => {
      result[h] = (data as Record<string, any>)[`c${i}`]?.image?.url ?? null;
    });
    return result;
  } catch (err) {
    console.error('[getCollectionImages] failed, returning empty map:', err);
    return {};
  }
}
