import { sanityFetch } from '@shared/sanity/lib/client';
import { normalizeLocaleForSanity } from '@shared/lib/locale';
import { Locale } from '@shared/i18n/routing';
import { PAGE_QUERY } from '@shared/sanity/lib/query';

export const getProductPage = async ({ language }: { language: Locale }) => {
  return sanityFetch({
    query: PAGE_QUERY,
    params: { slug: 'product-page' },
    revalidate: 3600,
  });
};
