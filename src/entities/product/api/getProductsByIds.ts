'use server';

import { storefrontClient } from '@shared/lib/shopify/client';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import { getLocale } from 'next-intl/server';

const GET_PRODUCTS_BY_IDS = `
  query getProductsByIds($query: String!, $first: Int!, $after: String) {
    products(first: $first, query: $query, after: $after) {
      edges {
        cursor
        node {
          id
          handle
          title
          vendor
          options(first: 10) {
            id
            name
            optionValues{
            name
            }
          }
          priceRange {
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 1) {
            edges {
              node {
                image {
                  url
                  altText
                  width
                  height
                }
              }
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
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

interface PaginatedProductsResponse {
  products: {
    edges: {
      cursor: string;
      node: Product;
    }[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}

const ID_BATCH_SIZE = 50;

export const getProductsByIds = async (ids: string[]): Promise<Product[]> => {
  const locale = await getLocale();
  let allProducts: Product[] = [];
  let remainingIDs = [...ids];

  while (remainingIDs.length > 0) {
    const batchIDs = remainingIDs.splice(0, ID_BATCH_SIZE);
    const formated = batchIDs
      .map((item) => {
        if (!item) return null;
        const match = item.match(/\/(\d+)$/);
        return match ? match[1] : item;
      })
      .filter((i) => i !== null);
    let searchQuery = formated.map((id) => `id:${id}`).join(' OR ');
    if (formated.length === 1) {
      searchQuery = searchQuery + ' OR';
    }
    let hasNextPage = true;
    let cursor: string | null = null;
    const first = 50;
    while (hasNextPage) {
      try {
        const response: PaginatedProductsResponse =
          await storefrontClient.request<PaginatedProductsResponse>({
            query: GET_PRODUCTS_BY_IDS,
            variables: {
              query: searchQuery,
              first,
              after: cursor,
            },
            language: locale.toUpperCase() as StorefrontLanguageCode,
          });
        const productsData = response.products;

        if (productsData && productsData.edges) {
          allProducts.push(...productsData.edges.map((edge) => edge.node));
          hasNextPage = productsData.pageInfo.hasNextPage;
          cursor = productsData.pageInfo.endCursor;
        } else {
          hasNextPage = false;
        }
      } catch (error) {
        console.error('Shopify Storefront API request failed:', error);
        hasNextPage = false;
      }
    }
  }

  return allProducts;
};
