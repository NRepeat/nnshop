'use server';
import { toFilterSlug } from '@shared/lib/filterSlug';
import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import { storefrontClient } from '@shared/lib/shopify/client';
import {
  GetCollectionQuery,
  GetCollectionFiltersQuery,
  GetCollectionsHandlesQuery,
  GetCollectionsHandlesQueryVariables,
  GetCollectionFiltersQueryVariables,
} from '@shared/lib/shopify/types/storefront.generated';
import { ProductFilter } from '@shared/lib/shopify/types/storefront.types';
import { cacheLife, cacheTag } from 'next/cache';

const GetCollectionWithProducts = `#graphql
  query GetCollection(
    $handle: String!
    $filters: [ProductFilter!]
    $first: Int
    $after: String
    $last: Int
    $before: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
  ) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      
      image {
        url
        altText
      }

      products(
        first: $first
        last: $last
        filters: $filters
        sortKey: $sortKey
        reverse: $reverse
        after: $after
        before: $before
      ) {
        
        pageInfo {
          hasNextPage
          hasPreviousPage
          endCursor
          startCursor
        }
        edges {
        
          node {
            id
            title
            handle
            availableForSale
            productType
            vendor
            totalInventory
            tags
            createdAt
            metafield(namespace:"custom",key:"znizka"){
                       value
                       namespace
                       key
            }
            sortOrder: metafield(namespace:"custom",key:"sort_order"){
                       value
            }
            variants(first: 250) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  quantityAvailable
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }

                }
              }
            }
            options {
              name
              optionValues {
                name
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            featuredImage {
              url
              altText
              width
              height
            }
            media(first:20){
                    edges{
                      node{

                            previewImage{
                              url
                              width
                              height
                              altText
                          }
                      }
                    }
                  }
          }
        }
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
      }
    }
  }
`;

const GetCollectionFilters = `
#graphql
query GetCollectionFilters($handle: String!) {
    collection(handle: $handle) {
        products(first: 1){
            filters {
                id
                label
                type
                values {
                    id
                    label
                    count
                    input
                }
            }
        }
    }
}
`;

const GET_COLLECTION_SLUGS = `
  #graphql
  query GetCollectionsHandles{
    collections(first:250) {
    	edges{
        node{
          handle
        }
      }
    }
  }
  `;

export const getCollectionSlugs = async () => {
  'use cache';
  cacheLife('default');
  cacheTag('collection');

  const handlesSet = new Set<string>();
  const locales: StorefrontLanguageCode[] = ['RU', 'UK'];
  try {
    const collection = await storefrontClient.request<
      GetCollectionsHandlesQuery,
      GetCollectionsHandlesQueryVariables
    >({
      query: GET_COLLECTION_SLUGS,
      language: locales[0],
    });

    if (!collection) {
      throw new Error('No collections found');
    }

    collection.collections.edges.forEach((edge) => {
      handlesSet.add(edge.node.handle);
    });

    return Array.from(handlesSet);
  } catch (error) {
    console.error('Error fetching collection slugs:', error);
    throw new Error("Can't fetch collection slugs");
  }
};

export const getCollectionFilters = async ({
  handle,
  locale,
}: {
  handle: string;
  locale: string;
}) => {
  'use cache';
  cacheLife('default');
  const collection = await storefrontClient.request<
    GetCollectionFiltersQuery,
    GetCollectionFiltersQueryVariables
  >({
    query: GetCollectionFilters,
    variables: { handle },
    language: locale.toUpperCase() as StorefrontLanguageCode,
  });
  return collection.collection?.products.filters;
};

const GENDER_SLUG_PATTERNS: Record<string, string[]> = {
  man: ['cholov'],
  woman: ['zhinoch'],
};

async function fetchAllCollectionEdges({
  handle,
  locale,
  filters,
  sortKey,
  reverse,
}: {
  handle: string;
  locale: string;
  filters: ProductFilter[];
  sortKey: string;
  reverse: boolean;
}): Promise<{ edges: any[]; firstBatch: GetCollectionQuery | null }> {
  'use cache';
  cacheLife('hours');
  cacheTag(`collection:${handle}`);
  cacheTag(handle);

  const allEdges: any[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;
  let firstBatch: GetCollectionQuery | null = null;

  while (hasNextPage) {
    const batch: GetCollectionQuery = await storefrontClient.request<GetCollectionQuery, any>({
      query: GetCollectionWithProducts,
      variables: {
        handle,
        filters,
        first: 250,
        after: cursor ?? undefined,
        sortKey,
        reverse,
      },
      language: locale.toUpperCase() as StorefrontLanguageCode,
    });

    if (!firstBatch) firstBatch = batch;
    const products = batch.collection?.products;
    if (!products) break;

    allEdges.push(...products.edges);
    hasNextPage = products.pageInfo.hasNextPage;
    cursor = products.pageInfo.endCursor ?? null;
  }

  return { edges: allEdges, firstBatch };
}

export const getCollection = async ({
  handle,
  searchParams,
  first,
  after,
  last,
  before,
  locale,
  gender,
}: {
  handle: string;
  searchParams?: { [key: string]: string | string[] | undefined };
  first?: number;
  after?: string;
  last?: number;
  before?: string;
  locale: string;
  gender?: string;
}) => {
  'use cache';
  cacheLife('default');
  cacheTag(`collection:${handle}`);
  cacheTag(handle);
  
  if (!locale) {
    throw new Error('getCollection: locale is required');
  }

  if (!handle) {
    throw new Error('getCollection: handle is required');
  }

  const filters: ProductFilter[] = [];
  const sizeFilterLabels: string[] = [];
  const needsFilterDefs = !!(searchParams || gender);
  if (needsFilterDefs) {
    const filterDefinitions = await getCollectionFilters({ handle, locale });

    if (filterDefinitions) {
      if (searchParams) {
        for (const [key, value] of Object.entries(searchParams)) {
          if (key === 'minPrice' || key === 'maxPrice' || key === 'sort') {
            continue;
          }

          const definition = filterDefinitions.find((f) =>
            f.id.endsWith(`.${key}`),
          );
          if (definition) {
            const values = Array.isArray(value)
              ? value
              : (value as string).split(';');
            values.forEach((v) => {
              const filterValue = definition.values.find(
                (def) => toFilterSlug(def.label) === v,
              );
              if (filterValue) {
                const parsed = JSON.parse(filterValue.input);
                filters.push(parsed);
                const SIZE_KEYS = ['rozmir', 'rozmer', 'size'];
                const SIZE_OPTION_NAMES = ['розмір', 'размер', 'size'];
                const isSizeFilter =
                  (parsed.productMetafield && SIZE_KEYS.some((k) => parsed.productMetafield.key?.toLowerCase().includes(k))) ||
                  (parsed.variantOption && SIZE_OPTION_NAMES.some((n) => parsed.variantOption.name?.toLowerCase().includes(n)));
                if (isSizeFilter) {
                  sizeFilterLabels.push(filterValue.label);
                }
              }
            });
          }
        }
      }

      if (gender && GENDER_SLUG_PATTERNS[gender]) {
        const patterns = GENDER_SLUG_PATTERNS[gender];
        const genderDef = filterDefinitions.find((f) =>
          f.id === 'filter.p.m.custom.gender',
        );
        if (genderDef) {
          const match = genderDef.values.find((v) =>
            patterns.some((p) => toFilterSlug(v.label).includes(p)),
          );
          if (match) filters.push(JSON.parse(match.input));
        }
      }
    }

    if (searchParams?.minPrice || searchParams?.maxPrice) {
      const priceFilter: ProductFilter = { price: {} };
      if (searchParams?.minPrice) {
        priceFilter.price!.min = parseFloat(searchParams.minPrice as string);
      }
      if (searchParams?.maxPrice) {
        priceFilter.price!.max = parseFloat(searchParams.maxPrice as string);
      }
      filters.push(priceFilter);
    }
  }


  let sortKey = 'RELEVANCE';
  let reverse: boolean = false;

  const sort = searchParams?.sort as string | undefined;

  switch (sort) {
    case 'price-asc':
      sortKey = 'PRICE';
      reverse = false;
      break;
    case 'price-desc':
      sortKey = 'PRICE';
      reverse = true;
      break;
    case 'created-desc':
      sortKey = 'CREATED';
      reverse = true;
      break;
    case 'trending':
    default:
      sortKey = 'RELEVANCE';
      reverse = false;
      break;
  }

  const isDefaultSort = !sort || sort === 'trending';
  const isNewSort = sort === 'created-desc';
  const isPriceSort = sort === 'price-asc' || sort === 'price-desc';
  let collection: GetCollectionQuery;

  if (isDefaultSort) {
    const { edges: allEdges, firstBatch } = await fetchAllCollectionEdges({
      handle,
      locale,
      filters,
      sortKey: 'RELEVANCE',
      reverse: false,
    });

    // Sort all products: 1) by sort_order metafield (lower = higher position), 2) by createdAt desc (newest first)
    allEdges.sort((a: any, b: any) => {
      const aVal =
        a.node.sortOrder?.value != null
          ? parseFloat(a.node.sortOrder.value)
          : Infinity;
      const bVal =
        b.node.sortOrder?.value != null
          ? parseFloat(b.node.sortOrder.value)
          : Infinity;
      if (aVal !== bVal) return aVal - bVal;
      // Secondary sort: newest first
      const aDate = a.node.createdAt ? new Date(a.node.createdAt).getTime() : 0;
      const bDate = b.node.createdAt ? new Date(b.node.createdAt).getTime() : 0;
      return bDate - aDate;
    });

    const _SIZE_OPT = ['size', 'розмір', 'размер'];
    const availableEdges = allEdges.filter((edge: any) =>
      edge.node.variants?.edges?.some((v: any) => v.node.availableForSale)
    );
    const filteredEdges = sizeFilterLabels.length > 0
      ? availableEdges.filter((edge: any) => {
          const sizeOptIndex = edge.node.options?.findIndex((opt: any) =>
            _SIZE_OPT.includes(opt.name.toLowerCase())
          ) ?? -1;
          if (sizeOptIndex === -1) return true;
          const available = new Set(
            edge.node.variants?.edges
              ?.filter((v: any) => v.node.availableForSale)
              .map((v: any) => v.node.selectedOptions?.[sizeOptIndex]?.value)
              .filter(Boolean)
          );
          return sizeFilterLabels.some((lbl) => available.has(lbl));
        })
      : availableEdges;

    // Determine the page slice using offset-based cursor
    const pageSize = first || last || 20;
    const startIndex = after
      ? parseInt(after, 10)
      : before
        ? Math.max(0, parseInt(before, 10) - pageSize)
        : 0;

    const slicedEdges = filteredEdges.slice(startIndex, startIndex + pageSize);

    collection = firstBatch!;
    if (collection.collection) {
      collection.collection.products.edges = slicedEdges;
      collection.collection.products.pageInfo = {
        hasNextPage: startIndex + pageSize < filteredEdges.length,
        hasPreviousPage: startIndex > 0,
        endCursor: startIndex + pageSize < filteredEdges.length
          ? String(startIndex + pageSize)
          : null,
        startCursor: String(startIndex),
      };
    }
  } else if (isNewSort) {
    // Fetch all products sorted by creation date desc; "new" tag is secondary tiebreaker
    const { edges: allEdges, firstBatch } = await fetchAllCollectionEdges({
      handle,
      locale,
      filters,
      sortKey: 'CREATED',
      reverse: true,
    });

    // Primary: createdAt desc; secondary: "new"-tagged first when dates are equal
    allEdges.sort((a: any, b: any) => {
      const aDate = a.node.createdAt ? new Date(a.node.createdAt).getTime() : 0;
      const bDate = b.node.createdAt ? new Date(b.node.createdAt).getTime() : 0;
      if (bDate !== aDate) return bDate - aDate;
      const aIsNew = (a.node.tags as string[]).some((t) => t.toLowerCase() === 'new') ? 1 : 0;
      const bIsNew = (b.node.tags as string[]).some((t) => t.toLowerCase() === 'new') ? 1 : 0;
      return bIsNew - aIsNew;
    });
    const sortedEdges = allEdges;

    // Post-filter: only show products with an available variant for the selected size(s)
    const _SIZE_OPT2 = ['size', 'розмір', 'размер'];
    const availableEdges2 = sortedEdges.filter((edge: any) =>
      edge.node.variants?.edges?.some((v: any) => v.node.availableForSale)
    );
    const filteredEdges = sizeFilterLabels.length > 0
      ? availableEdges2.filter((edge: any) => {
          const sizeOptIndex = edge.node.options?.findIndex((opt: any) =>
            _SIZE_OPT2.includes(opt.name.toLowerCase())
          ) ?? -1;
          if (sizeOptIndex === -1) return true;
          const available = new Set(
            edge.node.variants?.edges
              ?.filter((v: any) => v.node.availableForSale)
              .map((v: any) => v.node.selectedOptions?.[sizeOptIndex]?.value)
              .filter(Boolean)
          );
          return sizeFilterLabels.some((lbl) => available.has(lbl));
        })
      : availableEdges2;

    // Determine the page slice using offset-based cursor
    const pageSize = first || last || 20;
    const startIndex = after
      ? parseInt(after, 10)
      : before
        ? Math.max(0, parseInt(before, 10) - pageSize)
        : 0;

    const slicedEdges = filteredEdges.slice(startIndex, startIndex + pageSize);

    collection = firstBatch!;
    if (collection.collection) {
      collection.collection.products.edges = slicedEdges;
      collection.collection.products.pageInfo = {
        hasNextPage: startIndex + pageSize < filteredEdges.length,
        hasPreviousPage: startIndex > 0,
        endCursor: startIndex + pageSize < filteredEdges.length
          ? String(startIndex + pageSize)
          : null,
        startCursor: String(startIndex),
      };
    }
  } else if (isPriceSort) {
    // Fetch all products and sort by effective price (accounts for znizka discount metafield)
    const { edges: allEdges, firstBatch } = await fetchAllCollectionEdges({
      handle,
      locale,
      filters,
      sortKey: 'PRICE',
      reverse: false,
    });

    // Sort by effective price: maxVariantPrice * (1 - znizka/100)
    allEdges.sort((a: any, b: any) => {
      const getEffectivePrice = (edge: any): number => {
        const base = parseFloat(edge.node.priceRange?.maxVariantPrice?.amount ?? '0');
        const znizka =
          edge.node.metafield?.key === 'znizka' && edge.node.metafield?.value
            ? parseFloat(edge.node.metafield.value)
            : 0;
        return znizka > 0 ? base * (1 - znizka / 100) : base;
      };
      const diff = getEffectivePrice(a) - getEffectivePrice(b);
      return sort === 'price-desc' ? -diff : diff;
    });

    // Post-filter: only show products with an available variant for the selected size(s)
    const _SIZE_OPT3 = ['size', 'розмір', 'размер'];
    const availableEdges3 = allEdges.filter((edge: any) =>
      edge.node.variants?.edges?.some((v: any) => v.node.availableForSale)
    );
    const filteredEdges = sizeFilterLabels.length > 0
      ? availableEdges3.filter((edge: any) => {
          const sizeOptIndex = edge.node.options?.findIndex((opt: any) =>
            _SIZE_OPT3.includes(opt.name.toLowerCase())
          ) ?? -1;
          if (sizeOptIndex === -1) return true;
          const available = new Set(
            edge.node.variants?.edges
              ?.filter((v: any) => v.node.availableForSale)
              .map((v: any) => v.node.selectedOptions?.[sizeOptIndex]?.value)
              .filter(Boolean)
          );
          return sizeFilterLabels.some((lbl) => available.has(lbl));
        })
      : availableEdges3;

    // Determine the page slice using offset-based cursor
    const pageSize = first || last || 20;
    const startIndex = after
      ? parseInt(after, 10)
      : before
        ? Math.max(0, parseInt(before, 10) - pageSize)
        : 0;

    const slicedEdges = filteredEdges.slice(startIndex, startIndex + pageSize);

    collection = firstBatch!;
    if (collection.collection) {
      collection.collection.products.edges = slicedEdges;
      collection.collection.products.pageInfo = {
        hasNextPage: startIndex + pageSize < filteredEdges.length,
        hasPreviousPage: startIndex > 0,
        endCursor: startIndex + pageSize < filteredEdges.length
          ? String(startIndex + pageSize)
          : null,
        startCursor: String(startIndex),
      };
    }
  } else {
    collection = await storefrontClient.request<
      GetCollectionQuery,
      {
        handle: string;
        filters?: ProductFilter[];
        first?: number;
        after?: string;
        last?: number;
        before?: string;
        sortKey?: string;
        reverse?: boolean;
      }
    >({
      query: GetCollectionWithProducts,
      variables: {
        handle,
        filters,
        first,
        after,
        last,
        before,
        sortKey,
        reverse,
      },
      language: locale.toUpperCase() as StorefrontLanguageCode,
    });
  }

  const collectionId = collection.collection?.id;
  if (!collectionId) {
    return { collection, alternateHandle: '' };
  }

  const targetLocale = locale === 'ru' ? 'UK' : 'RU';
  
  // The alternate handle fetch can be done in parallel if we restructuring, 
  // but for now let's at least ensure it's not blocking if possible or requested.
  // Actually, let's keep it simple for now as the main bottleneck was the sequential await in Grid.
  
  const alternateRequest = await storefrontClient.request<
    {
      collection: { handle: string };
    },
    { id: string }
  >({
    query: `#graphql
        query getCollectionHandleById($id: ID!) {
          collection(id: $id) {
            handle
          }
        }`,
    variables: { id: collectionId },
    language: targetLocale as StorefrontLanguageCode,
  });
  return {
    collection,
    alternateHandle: alternateRequest.collection?.handle ?? '',
  };
};
