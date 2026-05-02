import { storefrontClient } from '@shared/lib/shopify/client';
import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import {
  Filter,
  PageInfo,
  Product,
  ProductFilter,
  SearchSortKeys,
} from '@shared/lib/shopify/types/storefront.types';
import { toFilterSlug } from '@shared/lib/filterSlug';
import { SEARCH_QUERY, DEFAULT_SEARCH_PAGE_SIZE } from '../lib/queries';

export type SearchProductsResult = {
  products: Product[];
  productFilters: Filter[];
  pageInfo: PageInfo;
  totalCount: number;
};

type Args = {
  query: string;
  locale: string;
  searchParams?: { [key: string]: string | string[] | undefined };
  first?: number;
  after?: string;
};

const RESERVED_PARAM_KEYS = new Set(['q', 'sort', 'limit', 'minPrice', 'maxPrice']);

export async function searchProducts(args: Args): Promise<SearchProductsResult> {
  const { query, locale, searchParams, first, after } = args;

  const translatedFilters: ProductFilter[] = [];

  // Detect whether we need a filter-defs lookup at all (skip if user only changed q/sort/limit).
  const hasFilterParams =
    !!searchParams &&
    Object.keys(searchParams).some(
      (k) =>
        !RESERVED_PARAM_KEYS.has(k) ||
        k === 'minPrice' ||
        k === 'maxPrice',
    );

  if (searchParams && hasFilterParams) {
    // Step 1: lightweight call to fetch filter definitions for slug → ProductFilter translation.
    const defResponse = await storefrontClient.request<
      { search: { productFilters: Filter[] } },
      { query: string; first: number }
    >({
      query: SEARCH_QUERY,
      language: locale.toUpperCase() as StorefrontLanguageCode,
      variables: { query, first: 1 },
    });
    const filterDefs = defResponse.search?.productFilters ?? [];

    for (const [key, value] of Object.entries(searchParams)) {
      if (key === 'q' || key === 'sort' || key === 'limit') continue;
      if (key === 'minPrice' || key === 'maxPrice') continue;

      const definition = filterDefs.find((f) => {
        const segment = f.id.split('.').pop() || '';
        return toFilterSlug(segment) === key || f.id.endsWith(`.${key}`);
      });
      if (!definition) continue;

      const values = Array.isArray(value)
        ? value
        : (value as string).split(';');
      values.forEach((v) => {
        const fv = definition.values.find((d) => toFilterSlug(d.label) === v);
        if (fv) {
          try {
            translatedFilters.push(JSON.parse(fv.input));
          } catch {}
        }
      });
    }

    if (searchParams.minPrice || searchParams.maxPrice) {
      const priceFilter: ProductFilter = { price: {} };
      if (searchParams.minPrice)
        priceFilter.price!.min = parseFloat(searchParams.minPrice as string);
      if (searchParams.maxPrice)
        priceFilter.price!.max = parseFloat(searchParams.maxPrice as string);
      translatedFilters.push(priceFilter);
    }
  }

  // Sort mapping (URL → SearchSortKeys). Search has only RELEVANCE/PRICE.
  let sortKey: SearchSortKeys | undefined;
  let reverse = false;
  const sortParam = searchParams?.sort as string | undefined;
  switch (sortParam) {
    case 'price-asc':
      sortKey = 'PRICE' as SearchSortKeys;
      reverse = false;
      break;
    case 'price-desc':
      sortKey = 'PRICE' as SearchSortKeys;
      reverse = true;
      break;
    case 'created-desc':
    case 'trending':
    default:
      sortKey = 'RELEVANCE' as SearchSortKeys;
      reverse = false;
  }

  const response = await storefrontClient.request<
    {
      search: {
        totalCount: number;
        pageInfo: PageInfo;
        productFilters: Filter[];
        edges: { cursor: string; node: Product & { __typename: string } }[];
      };
    },
    {
      query: string;
      first: number;
      after?: string;
      productFilters?: ProductFilter[];
      sortKey?: SearchSortKeys;
      reverse?: boolean;
    }
  >({
    query: SEARCH_QUERY,
    language: locale.toUpperCase() as StorefrontLanguageCode,
    variables: {
      query,
      first: first ?? DEFAULT_SEARCH_PAGE_SIZE,
      after,
      productFilters: translatedFilters.length > 0 ? translatedFilters : undefined,
      sortKey,
      reverse,
    },
  });

  const products = (response.search?.edges ?? [])
    .filter((e) => e.node.__typename === 'Product')
    .map((e) => e.node as Product);

  return {
    products,
    productFilters: response.search?.productFilters ?? [],
    pageInfo:
      response.search?.pageInfo ??
      ({
        hasNextPage: false,
        hasPreviousPage: false,
        endCursor: null,
        startCursor: null,
      } as PageInfo),
    totalCount: response.search?.totalCount ?? 0,
  };
}
