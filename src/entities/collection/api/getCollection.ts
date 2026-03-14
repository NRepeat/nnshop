'use server';
import { toFilterSlug } from '@shared/lib/filterSlug';
import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import { storefrontClient } from '@shared/lib/shopify/client';
import { DISCOUNT_METAFIELD_KEY } from '@shared/config/shop';
import { getProductsByIds } from '@entities/product/api/getProductsByIds';
import {
  GetCollectionQuery,
  GetCollectionFiltersQuery,
  GetCollectionsHandlesQuery,
  GetCollectionsHandlesQueryVariables,
  GetCollectionFiltersQueryVariables,
} from '@shared/lib/shopify/types/storefront.generated';
import { ProductFilter } from '@shared/lib/shopify/types/storefront.types';
import { cacheLife, cacheTag } from 'next/cache';

const GetCollectionLightweight = `#graphql
  query GetCollectionLight(
    $handle: String!
    $filters: [ProductFilter!]
    $first: Int
    $after: String
  ) {
    collection(handle: $handle) {
      id
      title
      handle
      products(first: $first filters: $filters after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            createdAt
            sortOrder: metafield(namespace:"custom", key:"sort_order") {
              value
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
      seo {
        description
      }

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
            metafield(namespace:"custom",key:"${DISCOUNT_METAFIELD_KEY}"){
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
            media(first: 6){
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
query GetCollectionFilters($handle: String!, $filters: [ProductFilter!]) {
    collection(handle: $handle) {
        products(first: 1, filters: $filters){
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
  cacheLife('max');
  cacheTag('collections');

  const handlesSet = new Set<string>();
  const locales: StorefrontLanguageCode[] = ['RU', 'UK'];
  try {
    const [ruCollection, ukCollection] = await Promise.all(
      locales.map((language) =>
        storefrontClient.request<
          GetCollectionsHandlesQuery,
          GetCollectionsHandlesQueryVariables
        >({
          query: GET_COLLECTION_SLUGS,
          language,
        }),
      ),
    );

    if (!ruCollection || !ukCollection) {
      throw new Error('No collections found');
    }

    ruCollection.collections.edges.forEach((edge) =>
      handlesSet.add(edge.node.handle),
    );
    ukCollection.collections.edges.forEach((edge) =>
      handlesSet.add(edge.node.handle),
    );

    return Array.from(handlesSet);
  } catch (error) {
    console.error('Error fetching collection slugs:', error);
    throw new Error("Can't fetch collection slugs");
  }
};

export const getCollectionFilters = async ({
  handle,
  locale,
  filters = [{ available: true }],
}: {
  handle: string;
  locale: string;
  filters?: ProductFilter[];
}) => {
  'use cache';
  cacheLife('max');
  cacheTag(`collection:${handle}`);
  cacheTag(handle);
  const collection = await storefrontClient.request<
    GetCollectionFiltersQuery,
    GetCollectionFiltersQueryVariables
  >({
    query: GetCollectionFilters,
    variables: { handle, filters },
    language: locale.toUpperCase() as StorefrontLanguageCode,
  });
  return collection.collection?.products.filters;
};

async function fetchAllCollectionEdges({
  handle,
  locale,
  filters,
}: {
  handle: string;
  locale: string;
  filters: ProductFilter[];
}): Promise<{
  edges: any[];
  filters: any[];
  collectionId: string;
  collectionTitle: string;
}> {
  const allEdges: any[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;
  let collectionFilters: any[] = [];
  let collectionId = '';
  let collectionTitle = '';

  while (hasNextPage) {
    const batch: any = await storefrontClient.request<any, any>({
      query: GetCollectionLightweight,
      variables: { handle, filters, first: 250, after: cursor ?? undefined },
      language: locale.toUpperCase() as StorefrontLanguageCode,
    });

    const col = batch.collection;
    if (!col) break;

    if (allEdges.length === 0) {
      collectionId = col.id ?? '';
      collectionTitle = col.title ?? '';
      collectionFilters = col.products?.filters ?? [];
    }

    const products = col.products;
    if (!products) break;

    allEdges.push(...products.edges);
    hasNextPage = products.pageInfo.hasNextPage;
    cursor = products.pageInfo.endCursor ?? null;
  }

  return {
    edges: allEdges,
    filters: collectionFilters,
    collectionId,
    collectionTitle,
  };
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
  genderTag,
}: {
  handle: string;
  searchParams?: { [key: string]: string | string[] | undefined };
  first?: number;
  after?: string;
  last?: number;
  before?: string;
  locale: string;
  gender?: string;
  /** When set, adds a Shopify tag filter for this gender value (e.g. 'woman' | 'man').
   *  Use only for brand/vendor pages where a single collection contains both genders. */
  genderTag?: string;
}) => {
  'use cache';
  cacheLife('max');
  cacheTag(`collection:${handle}`);
  cacheTag(handle);


  if (!locale) throw new Error('getCollection: locale is required');
  if (!handle) throw new Error('getCollection: handle is required');

  const filters: ProductFilter[] = [{ available: true }];
  //Mnay product without gender tag, go to Shopify
  // if (genderTag) {
  //   const genderMetafieldValue = genderTag === 'man' ? 'choloviche' : genderTag === 'woman' ? 'zhinoche' : null;
  //   if (genderMetafieldValue) {
  //     filters.push({ productMetafield: { namespace: 'custom', key: 'gender', value: genderMetafieldValue } });
  //   }
  // }

  if (searchParams) {
    const filterDefinitions = await getCollectionFilters({ handle, locale });
    if (filterDefinitions) {
      for (const [key, value] of Object.entries(searchParams)) {
        if (key === 'minPrice' || key === 'maxPrice' || key === 'sort')
          continue;

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
            if (filterValue) filters.push(JSON.parse(filterValue.input));
          });
        }
      }
    }

    if (searchParams.minPrice || searchParams.maxPrice) {
      const priceFilter: ProductFilter = { price: {} };
      if (searchParams.minPrice)
        priceFilter.price!.min = parseFloat(searchParams.minPrice as string);
      if (searchParams.maxPrice)
        priceFilter.price!.max = parseFloat(searchParams.maxPrice as string);
      filters.push(priceFilter);
    }
  }

  const sort = searchParams?.sort as string | undefined;
  const isDefaultSort = !sort || sort === 'trending';

  let collection: GetCollectionQuery;

  if (isDefaultSort) {
    // Fetch all product IDs (lightweight) to apply custom sort_order metafield sorting,
    // then fetch full data only for the current page.
    const {
      edges: allEdges,
      filters: shopifyFilters,
      collectionId: colId,
      collectionTitle: colTitle,
    } = await fetchAllCollectionEdges({
      handle,
      locale,
      filters,
    });

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
      const aDate = a.node.createdAt ? new Date(a.node.createdAt).getTime() : 0;
      const bDate = b.node.createdAt ? new Date(b.node.createdAt).getTime() : 0;
      return bDate - aDate;
    });

    const pageSize = first || last || 20;
    const startIndex = after
      ? parseInt(after, 10)
      : before
        ? Math.max(0, parseInt(before, 10) - pageSize)
        : 0;

    const slicedEdges = allEdges.slice(startIndex, startIndex + pageSize);
    const productIds = slicedEdges.map((e: any) => e.node.id);

    const fullProducts = await getProductsByIds(productIds, locale);

    const fullProductsMap = new Map(fullProducts.map((p) => [p.id, p]));

    // Build a minimal GetCollectionQuery-shaped response
    collection = {
      collection: {
        id: colId,
        title: colTitle,
        handle,
        description: '',
        seo: { description: null },
        image: null,
        products: {
          pageInfo: {
            hasNextPage: startIndex + pageSize < allEdges.length,
            hasPreviousPage: startIndex > 0,
            endCursor:
              startIndex + pageSize < allEdges.length
                ? String(startIndex + pageSize)
                : null,
            startCursor: String(startIndex),
          },
          edges: slicedEdges.map((e: any) => ({
            ...e,
            node: { ...e.node, ...(fullProductsMap.get(e.node.id) ?? {}) },
          })),
          filters: shopifyFilters,
        },
      },
    } as any;
  } else {
    let sortKey = 'RELEVANCE';
    let reverse = false;
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
    }

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
    { collection: { handle: string } },
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
