'use server';
import { storefrontClient } from '@shared/lib/shopify/client';
import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import { cacheLife, cacheTag } from 'next/cache';

const QUERY = `#graphql
  query GetNewProductsByType($query: String!, $first: Int!) {
    products(first: $first, query: $query, sortKey: CREATED_AT, reverse: true) {
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
          images(first: 20) {
            edges { node { url altText width height } }
          }
          options(first: 10) { id name values }
          variants(first: 50) {
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
        }
      }
    }
  }
`;

/** Fetches products tagged "new" with the same productType, shuffled. */
export async function getNewProductsFiller({
  productType,
  excludeIds,
  locale,
  count,
}: {
  productType: string;
  excludeIds: string[];
  locale: string;
  count: number;
}) {
  'use cache';
  cacheLife('max');
  cacheTag('new-products-filler');
  cacheTag('product');

  if (!productType || count <= 0) return [];

  const queryStr = `tag:new product_type:"${productType}"`;

  try {
    const data = await storefrontClient.request<any, any>({
      query: QUERY,
      variables: { query: queryStr, first: 20 },
      language: locale.toUpperCase() as StorefrontLanguageCode,
    });

    const products: any[] = (data?.products?.edges ?? []).map(
      (e: any) => e.node,
    );

    // Exclude already-shown products
    const filtered = products.filter((p) => !excludeIds.includes(p.id));

    // Shuffle
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }

    return filtered.slice(0, count);
  } catch {
    return [];
  }
}
