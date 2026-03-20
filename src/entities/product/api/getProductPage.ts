import { sanityFetch } from '@shared/sanity/lib/sanityFetch';
import { PAGE_QUERY } from '@shared/sanity/lib/query';

export const getProductPage = async () => {
  return sanityFetch({
    query: PAGE_QUERY,
    params: { slug: 'product-page' },
    tags: ['page', 'page:product-page'],
  });
};
