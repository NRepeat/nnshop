import { unstable_cache as unstableCache } from 'next/cache';

/**
 * Cached fetch wrapper that supports Next.js cache tags
 * This allows us to use revalidateTag for cart-related data
 */
export async function cachedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  tags: string[] = [],
  revalidate: number = 60, // 60 seconds default
): Promise<T> {
  const cachedFn = unstableCache(fetchFn, [key], {
    tags,
    revalidate,
  });

  return cachedFn();
}

/**
 * Cache tags for cart-related data
 */
export const CART_TAGS = {
  CART: 'cart',
  CART_ITEMS: 'cart-items',
  CART_SESSION: 'cart-session',
} as const;
