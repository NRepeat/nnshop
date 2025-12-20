'use server';
import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import { storefrontClient } from '@shared/lib/shopify/client';
import {
  GetCollectionQuery,
  GetCollectionsHandlesQuery,
  GetCollectionsHandlesQueryVariables,
} from '@shared/lib/shopify/types/storefront.generated';
import { ProductFilter } from '@shared/lib/shopify/types/storefront.types';

const query = `
  #graphql
  query GetCollection(
    $handle: String!
    $filters: [ProductFilter!]
    $first: Int
    $after: String
    $last: Int
    $before: String
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
export const getCollection = async ({
  handle,
  filters,
  first,
  after,
  last,
  before,
  locale,
}: {
  handle: string;
  filters?: ProductFilter[];
  first?: number;
  after?: string;
  last?: number;
  before?: string;
  locale: string;
}) => {
  'use cache';

  const collection = await storefrontClient.request<
    GetCollectionQuery,
    {
      handle: string;
      filters?: ProductFilter[];
      first?: number;
      after?: string;
      last?: number;
      before?: string;
    }
  >({
    query,
    variables: { handle, filters, first, after, last, before },
    language: locale.toUpperCase() as StorefrontLanguageCode,
  });
  return collection as GetCollectionQuery;
};
