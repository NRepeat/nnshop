import { storefrontClient } from '@shared/lib/shopify/client';
import { StorefrontLanguageCode } from '@shared/lib/clients/types';

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

type ProductEdge = {
  node: {
    vendor: string;
    id: string;
  };
};

export async function getAllBrands(locale: string = 'uk') {
  try {
    const brands = new Set<string>();
    let hasNextPage = true;
    let cursor: string | null = null;

    // Fetch all products to get unique vendors
    while (hasNextPage && brands.size < 100) {
      const response = await storefrontClient.request<{
        products: {
          edges: ProductEdge[];
          pageInfo: {
            hasNextPage: boolean;
            endCursor: string;
          };
        };
      }>({
        query: GET_ALL_BRANDS_QUERY,
        variables: {
          first: 250,
          after: cursor,
        },
        language: locale.toUpperCase() as StorefrontLanguageCode,
      });

      response.products.edges.forEach((edge) => {
        if (edge.node.vendor) {
          brands.add(edge.node.vendor);
        }
      });

      hasNextPage = response.products.pageInfo.hasNextPage;
      cursor = response.products.pageInfo.endCursor;
    }

    // Convert Set to sorted array
    return Array.from(brands).sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
}
