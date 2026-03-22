import { getProductsByIds } from './getProductsByIds';

export const getReletedProducts = async (ids: string[], locale: string) => {
  'use cache'
  try {
    if (!ids || ids.length === 0) {
      return [];
    }
    const res = await getProductsByIds(ids, locale);
    // Shopify returns products in arbitrary order — restore original ids order
    const indexMap = new Map(
      ids.map((id, i) => [id.match(/\/(\d+)$/)?.[1] ?? id, i]),
    );
    return [...res].sort((a, b) => {
      const aIdx = indexMap.get(a.id.match(/\/(\d+)$/)?.[1] ?? a.id) ?? Infinity;
      const bIdx = indexMap.get(b.id.match(/\/(\d+)$/)?.[1] ?? b.id) ?? Infinity;
      return aIdx - bIdx;
    });
  } catch (err) {
    console.error('Error fetching related products:', err);
    return [];
  }
};
