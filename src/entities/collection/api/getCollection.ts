'use server';
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
import { cacheLife } from 'next/cache';

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

  const handlesSet = new Set<string>();
  const locales: StorefrontLanguageCode[] = ['RU', 'UK'];
  try {
    // Fetch collections from first locale only (handles are the same across locales)
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

    // Return deduplicated array
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

export const getCollection = async ({
  handle,
  searchParams,
  first,
  after,
  last,
  before,
  locale,
}: {
  handle: string;
  searchParams?: { [key: string]: string | string[] | undefined };
  first?: number;
  after?: string;
  last?: number;
  before?: string;
  locale: string;
}) => {
  'use cache';
  cacheLife('default');
  if (!locale) {
    throw new Error('getCollection: locale is required');
  }

  if (!handle) {
    throw new Error('getCollection: handle is required');
  }

  const filters: ProductFilter[] = [];
  if (searchParams) {
    const filterDefinitions = await getCollectionFilters({ handle, locale });

    if (filterDefinitions) {
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
            : (value as string).split(',');
          values.forEach((v) => {
            const filterValue = definition.values.find(
              (def) => def.label === v,
            );
            if (filterValue) {
              filters.push(JSON.parse(filterValue.input));
            }
          });
        }
      }
    }

    if (searchParams.minPrice || searchParams.maxPrice) {
      const priceFilter: ProductFilter = { price: {} };
      if (searchParams.minPrice) {
        priceFilter.price!.min = parseFloat(searchParams.minPrice as string);
      }
      if (searchParams.maxPrice) {
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
  let collection: GetCollectionQuery;

  if (isDefaultSort) {
    // For trending/popular sort: fetch all products and sort by sort_order metafield
    const allEdges: any[] = [];
    let cursor: string | null = null;
    let hasNextPage = true;
    let firstBatch: GetCollectionQuery | null = null;

    // Fetch all products from Shopify
    while (hasNextPage) {
      const batch: GetCollectionQuery = await storefrontClient.request<
        GetCollectionQuery,
        {
          handle: string;
          filters?: ProductFilter[];
          first?: number;
          after?: string;
          sortKey?: string;
          reverse?: boolean;
        }
      >({
        query: GetCollectionWithProducts,
        variables: {
          handle,
          filters,
          first: 250,
          after: cursor ?? undefined,
          sortKey: 'RELEVANCE',
          reverse: false,
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

    // Sort all products by sort_order metafield (lower value = higher position)
    allEdges.sort((a: any, b: any) => {
      const aVal =
        a.node.sortOrder?.value != null
          ? parseFloat(a.node.sortOrder.value)
          : Infinity;
      const bVal =
        b.node.sortOrder?.value != null
          ? parseFloat(b.node.sortOrder.value)
          : Infinity;
      return aVal - bVal;
    });

    // Create cursor-to-index mapping
    const cursorToIndex = new Map<string, number>();
    allEdges.forEach((edge, index) => {
      cursorToIndex.set(edge.node.id, index);
    });

    // Determine the page slice
    const pageSize = first || last || 20;
    let startIndex = 0;

    if (after) {
      // Find the index by cursor (which is actually the product ID)
      const afterIndex = cursorToIndex.get(after);
      startIndex = afterIndex !== undefined ? afterIndex + 1 : 0;
    } else if (before) {
      const beforeIndex = cursorToIndex.get(before);
      startIndex =
        beforeIndex !== undefined ? Math.max(0, beforeIndex - pageSize) : 0;
    }

    const slicedEdges = allEdges.slice(startIndex, startIndex + pageSize);

    collection = firstBatch!;
    if (collection.collection) {
      collection.collection.products.edges = slicedEdges;
      collection.collection.products.pageInfo = {
        hasNextPage: startIndex + pageSize < allEdges.length,
        hasPreviousPage: startIndex > 0,
        endCursor:
          slicedEdges.length > 0
            ? slicedEdges[slicedEdges.length - 1].node.id
            : null,
        startCursor: slicedEdges.length > 0 ? slicedEdges[0].node.id : null,
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
