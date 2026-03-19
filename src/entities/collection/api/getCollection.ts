'use server';
import { toFilterSlug } from '@shared/lib/filterSlug';
import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import { storefrontClient } from '@shared/lib/shopify/client';
import { DISCOUNT_METAFIELD_KEY } from '@shared/config/shop';
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

  let sortKey = 'MANUAL';
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

  const collection = await storefrontClient.request<
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
