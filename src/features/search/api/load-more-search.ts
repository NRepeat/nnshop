'use server';

/**
 * Server Action for cursor-based "Load more" pagination on /search.
 *
 * Returns the next page of products + the new pageInfo. Filters, sort,
 * and the original query are passed in from the client so we run the
 * exact same Storefront query as the initial server render.
 */
import { searchProducts } from './search-products';
import { Product, PageInfo } from '@shared/lib/shopify/types/storefront.types';

export type LoadMoreInput = {
  query: string;
  locale: string;
  searchParams: { [key: string]: string | string[] | undefined };
  after: string;
  pageSize?: number;
};

export type LoadMoreResult = {
  products: Product[];
  pageInfo: PageInfo;
};

export async function loadMoreSearchProducts(
  input: LoadMoreInput,
): Promise<LoadMoreResult> {
  const { query, locale, searchParams, after, pageSize } = input;
  const result = await searchProducts({
    query,
    locale,
    searchParams,
    first: pageSize ?? 24,
    after,
  });
  return {
    products: result.products,
    pageInfo: result.pageInfo,
  };
}
