import { storefrontClient } from '@shared/lib/shopify/client';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { StorefrontLanguageCode } from '@shared/lib/clients/types';

// Reuse the same GraphQL fragment structure as getProductsByIds.ts
const GET_PRODUCTS_BY_HANDLES = `#graphql
  query getProductsByHandles($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
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
          metafield(namespace: "custom", key: "znizka") {
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
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
                selectedOptions { name value }
              }
            }
          }
          options {
            name
            optionValues { name }
          }
          priceRange {
            minVariantPrice { amount currencyCode }
            maxVariantPrice { amount currencyCode }
          }
          featuredImage { url altText width height }
          media(first: 20) {
            edges {
              node {
                previewImage { url width height altText }
              }
            }
          }
        }
      }
    }
  }
`;

interface ProductsByHandlesResponse {
  products: {
    edges: { node: Product }[];
  };
}

export const getProductsByHandles = async (
  handles: string[],
  locale: string,
): Promise<Product[]> => {
  if (handles.length === 0) return [];

  const searchQuery = handles.map((h) => `handle:${h}`).join(' OR ');

  try {
    const response = await storefrontClient.request<
      ProductsByHandlesResponse,
      { query: string; first: number }
    >({
      query: GET_PRODUCTS_BY_HANDLES,
      variables: { query: searchQuery, first: handles.length },
      language: locale.toUpperCase() as StorefrontLanguageCode,
    });

    const products = response.products?.edges.map((e) => e.node) ?? [];

    // Re-sort to match the order of handles (DB returns by viewedAt DESC)
    const productMap = new Map(products.map((p) => [p.handle, p]));
    return handles
      .map((h) => productMap.get(h))
      .filter((p): p is Product => p !== undefined);
  } catch (error) {
    console.error('[getProductsByHandles] failed', {
      step: 'shopify-by-handles',
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
};
