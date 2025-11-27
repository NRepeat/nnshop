import { sanityFetch } from '@shared/sanity/lib/client';
import { PAGE_QUERY } from '@shared/sanity/lib/query';

export const getProductPage = async () => {
  return sanityFetch({
    query: PAGE_QUERY,
    params: { slug: 'product-page' },
    revalidate: 3600,
  });
};
