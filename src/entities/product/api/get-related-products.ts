import { getProductsByIds } from './getProductsByIds';

export const getReletedProducts = async (ids: string[], locale: string) => {
  'use cache'
  try {
    if (!ids || ids.length === 0) {
      return [];
    }
    const res = await getProductsByIds(ids, locale);
    return res;
  } catch (err) {
    console.error('Error fetching related products:', err);
    return [];
  }
};
