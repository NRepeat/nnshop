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
  const handles: string[] = [];
  const locales: StorefrontLanguageCode[] = ['RU', 'UK'];
  try {
    for (const locale of locales) {
      const collection = await storefrontClient.request<
        GetCollectionsHandlesQuery,
        GetCollectionsHandlesQueryVariables
      >({
        query: GET_COLLECTION_SLUGS,
        language: locale,
      });
      if (!collection) {
        throw new Error();
      }
      handles.push(...collection.collections.edges.map((n) => n.node.handle));
    }

    return handles;
  } catch (error) {
    console.error(error);
    throw new Error("Can't fetch slugs");
  }
};

export const getCollectionFilters = async ({
  handle,
  locale,
}: {
  handle: string;
  locale: string;
}) => {
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

  console.log(
    '🚀 ~ getCollection ~ collection.collection?.id:',
    decodeURIComponent(handle),
  );
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
    variables: { id: collection.collection?.id || '' },
    language: targetLocale as StorefrontLanguageCode,
  });

  const alternateData = alternateRequest;
  return { collection, alternateHandle: alternateData.collection?.handle };
};
