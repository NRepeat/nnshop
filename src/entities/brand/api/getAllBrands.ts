import { storefrontClient } from '@shared/lib/shopify/client';
import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import {
  GetAllProductsQuery,
  GetAllProductsQueryVariables,
} from '@shared/lib/shopify/types/storefront.generated';

const GET_ALL_BRANDS_QUERY = `#graphql
  query GetAllProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          vendor
          id
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export async function getAllBrands(locale: string = 'uk') {
  try {
    const brands = new Set<string>();
    let hasNextPage = true;
    let cursor: string | null = null;

    // Fetch all products to get unique vendors
    while (hasNextPage && brands.size < 500) {
      const response = (await storefrontClient.request<
        GetAllProductsQuery,
        GetAllProductsQueryVariables
      >({
        query: GET_ALL_BRANDS_QUERY,
        variables: {
          first: 250,
          after: cursor,
        },
        language: locale.toUpperCase() as StorefrontLanguageCode,
      })) as GetAllProductsQuery;

      response.products.edges.forEach((edge) => {
        if (edge.node.vendor) {
          brands.add(edge.node.vendor);
        }
      });

      hasNextPage = response.products.pageInfo.hasNextPage;
      cursor = response.products.pageInfo.endCursor as string;
    }

    // Convert Set to sorted array
    return Array.from(brands).sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
}
