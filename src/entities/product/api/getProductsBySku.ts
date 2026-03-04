import { storefrontClient } from '@shared/lib/shopify/client';
import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import { cacheLife } from 'next/cache';

const QUERY = `#graphql
  query GetProductsBySku($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          handle
          availableForSale
          productType
          vendor
          tags
          totalInventory
          priceRange {
            minVariantPrice { amount currencyCode }
            maxVariantPrice { amount currencyCode }
          }
          featuredImage { url altText width height }
          media(first: 5) {
            edges { node { previewImage { url altText } } }
          }
          options(first: 10) {
            id
            name
            optionValues { name }
          }
          metafield(namespace: "custom", key: "znizka") {
            key
            value
          }
          variants(first: 50) {
            edges {
              node {
                id
                title
                availableForSale
                quantityAvailable
                sku
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
                selectedOptions { name value }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Fetches products whose variant SKU matches the given SKU.
 * Excludes the current product by numeric Shopify ID.
 * Returns empty array if SKU is empty or on error.
 */
export async function getProductsBySku(
  sku: string,
  excludeProductId: string,
  locale: string,
  count: number = 3,
): Promise<any[]> {
  'use cache';
  cacheLife('minutes');

  if (!sku?.trim()) return [];

  const numericId = excludeProductId.split('/').pop();
  const queryStr = `sku:"${sku}" -id:${numericId}`;

  try {
    const data = await storefrontClient.request<any, any>({
      query: QUERY,
      variables: { query: queryStr, first: count + 5 },
      language: locale.toUpperCase() as StorefrontLanguageCode,
    });

    const products: any[] = (data?.products?.edges ?? []).map(
      (e: any) => e.node,
    );

    return products.slice(0, count);
  } catch {
    return [];
  }
}
