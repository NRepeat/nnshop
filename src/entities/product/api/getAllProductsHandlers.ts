'use server';

import { storefrontClient } from '@shared/lib/shopify/client';
import { StorefrontLanguageCode } from '@shared/lib/clients/types';

const GET_ALL_PRODUCT_HANDLES = `

  query getAllProductHandles($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          handle
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

interface PaginatedHandlesResponse {
  products: {
    edges: {
      node: {
        handle: string;
      };
    }[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}

/**
 * Fetches every product handle from the Shopify store using cursor-based pagination.
 */
export const getAllProductHandles = async (
  locale: string,
  limit?: number, // Optional limit for build time
): Promise<string[]> => {
  let allHandles: string[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;
  const BATCH_SIZE = 250; // Shopify's maximum limit for products per request
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  try {
    while (hasNextPage) {
      // Stop if we've reached the limit
      if (limit && allHandles.length >= limit) {
        break;
      }

      await sleep(200); // Increased delay to avoid hitting rate limits
      const response: PaginatedHandlesResponse = await storefrontClient.request<
        PaginatedHandlesResponse,
        { first: number; after: string | null }
      >({
        query: GET_ALL_PRODUCT_HANDLES,
        variables: {
          first: BATCH_SIZE,
          after: cursor,
        },
        language: locale.toUpperCase() as StorefrontLanguageCode,
      });

      const productsData = response.products;

      if (productsData?.edges) {
        const handles = productsData.edges.map((edge) => edge.node.handle);
        allHandles.push(...handles);

        hasNextPage = productsData.pageInfo.hasNextPage;
        // hasNextPage = true;
        cursor = productsData.pageInfo.endCursor;
      } else {
        hasNextPage = false;
      }
    }
  } catch (error) {
    console.error('Failed to fetch all Shopify product handles:', error);
  }

  // Remove duplicates
  return [...new Set(allHandles)];
};
