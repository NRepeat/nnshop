'use server';
import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import { storefrontClient } from '@shared/lib/shopify/client';
import { GetCollectionQuery } from '@shared/lib/shopify/types/storefront.generated';
import { ProductFilter } from '@shared/lib/shopify/types/storefront.types';
import { getLocale } from 'next-intl/server';
const query = `#graphql
  query GetCollection($handle: String!, $filters: [ProductFilter!]) {
    collection(handle: $handle) {
    id
    title
    handle
    description
      image {
        url
        altText
      }

      products(first: 250, filters: $filters) {
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
            variants(first: 50) {
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
                  image {
                    url
                    altText
                    width
                    height
                  }
                }
              }
            }
            options{
              name
              optionValues{
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

export const getCollection = async ({
  handle,
  filters,
}: {
  handle: string;
  filters?: ProductFilter[];
}) => {
  const locale = await getLocale();
  const collection = await storefrontClient.request<GetCollectionQuery>({
    query,
    variables: { handle, filters },
    language: locale.toUpperCase() as StorefrontLanguageCode,
  });
  return collection;
};
