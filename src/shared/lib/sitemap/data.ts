import { cacheLife, cacheTag } from 'next/cache';
import { storefrontClient } from '@shared/lib/shopify/client';
import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import { vendorToHandle } from '@shared/lib/utils/vendorToHandle';
import { client as sanityClient } from '@/shared/sanity/lib/client';
import { DEFAULT_GENDER } from '@shared/config/shop';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProductSitemapNode {
  handle: string;
  updatedAt: string;
}

interface VendorSitemapNode {
  vendor: string;
}

interface CollectionSitemapNode {
  id: string;
  handle: string;
  updatedAt: string;
}

interface ProductsForSitemapResponse {
  products: {
    edges: Array<{ node: ProductSitemapNode }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

interface VendorsForSitemapResponse {
  products: {
    edges: Array<{ node: VendorSitemapNode }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

interface CollectionsForSitemapResponse {
  collections: {
    edges: Array<{ node: CollectionSitemapNode }>;
  };
}

export interface SitemapProduct {
  handle: string;
  updatedAt: string;
}

export interface SitemapCategory {
  handle: string;
  ruHandle: string;
  updatedAt: string;
  gender: string;
}

export interface SitemapBrand {
  vendor: string;
  handle: string;
}

export interface SitemapPost {
  slug: string;
  language: string;
  updatedAt: string;
  translations?: Array<{ slug: string; language: string }>;
}

// ---------------------------------------------------------------------------
// Gender resolution (mirrors logic in the old sitemap.ts)
// ---------------------------------------------------------------------------

const GENDER_SLUG_PATTERNS: Record<string, string[]> = {
  man: ['cholov'],
  woman: ['zhinoch'],
};

function getGenderFromHandle(handle: string): string {
  for (const [gender, patterns] of Object.entries(GENDER_SLUG_PATTERNS)) {
    if (patterns.some((p) => handle.includes(p))) return gender;
  }
  return DEFAULT_GENDER;
}

// ---------------------------------------------------------------------------
// GraphQL queries
// ---------------------------------------------------------------------------

const GET_PRODUCTS_FOR_SITEMAP = `#graphql
  query GetProductsForSitemap($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          handle
          updatedAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const GET_COLLECTIONS_FOR_SITEMAP = `#graphql
  query GetCollectionsForSitemap {
    collections(first: 250) {
      edges {
        node {
          id
          handle
          updatedAt
        }
      }
    }
  }
`;

const GET_VENDORS_FOR_SITEMAP = `#graphql
  query GetVendorsForSitemap($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          vendor
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// ---------------------------------------------------------------------------
// Exported cached data functions
// ---------------------------------------------------------------------------

export async function getSitemapProducts(): Promise<SitemapProduct[]> {
  'use cache';
  cacheLife('max');
  cacheTag('sitemap-products');

  const allProducts: SitemapProduct[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  try {
    while (hasNextPage) {
      const response: ProductsForSitemapResponse =
        await storefrontClient.request<
          ProductsForSitemapResponse,
          { first: number; after: string | null }
        >({
          query: GET_PRODUCTS_FOR_SITEMAP,
          variables: { first: 250, after: cursor },
          language: 'UK' as StorefrontLanguageCode,
        });

      if (response.products?.edges) {
        allProducts.push(...response.products.edges.map((edge) => edge.node));
        hasNextPage = response.products.pageInfo.hasNextPage;
        cursor = response.products.pageInfo.endCursor;
      } else {
        hasNextPage = false;
      }
    }
  } catch (error) {
    console.error('Failed to fetch products for sitemap:', error);
  }

  return allProducts;
}

export async function getSitemapCategories(): Promise<SitemapCategory[]> {
  'use cache';
  cacheLife('max');
  cacheTag('sitemap-categories');

  try {
    const [ukResponse, ruResponse] = await Promise.all([
      storefrontClient.request<
        CollectionsForSitemapResponse,
        Record<string, never>
      >({
        query: GET_COLLECTIONS_FOR_SITEMAP,
        variables: {},
        language: 'UK' as StorefrontLanguageCode,
      }),
      storefrontClient.request<
        CollectionsForSitemapResponse,
        Record<string, never>
      >({
        query: GET_COLLECTIONS_FOR_SITEMAP,
        variables: {},
        language: 'RU' as StorefrontLanguageCode,
      }),
    ]);

    // Build a map of collection ID → RU handle
    const ruHandleById = new Map<string, string>();
    for (const edge of ruResponse.collections?.edges ?? []) {
      ruHandleById.set(edge.node.id, edge.node.handle);
    }

    return (ukResponse.collections?.edges ?? []).map((edge) => ({
      handle: edge.node.handle,
      ruHandle: ruHandleById.get(edge.node.id) ?? edge.node.handle,
      updatedAt: edge.node.updatedAt,
      gender: getGenderFromHandle(edge.node.handle),
    }));
  } catch (error) {
    console.error('Failed to fetch collections for sitemap:', error);
    return [];
  }
}

export async function getSitemapBrands(): Promise<SitemapBrand[]> {
  'use cache';
  cacheLife('max');
  cacheTag('sitemap-brands');

  const vendorSet = new Set<string>();
  let hasNextPage = true;
  let cursor: string | null = null;

  try {
    while (hasNextPage && vendorSet.size < 500) {
      const response: VendorsForSitemapResponse =
        await storefrontClient.request<
          VendorsForSitemapResponse,
          { first: number; after: string | null }
        >({
          query: GET_VENDORS_FOR_SITEMAP,
          variables: { first: 250, after: cursor },
          language: 'UK' as StorefrontLanguageCode,
        });

      if (response.products?.edges) {
        for (const edge of response.products.edges) {
          if (edge.node.vendor) vendorSet.add(edge.node.vendor);
        }
        hasNextPage = response.products.pageInfo.hasNextPage;
        cursor = response.products.pageInfo.endCursor;
      } else {
        hasNextPage = false;
      }
    }
  } catch (error) {
    console.error('Failed to fetch vendors for sitemap:', error);
  }

  return Array.from(vendorSet)
    .sort((a, b) => a.localeCompare(b))
    .map((vendor) => ({ vendor, handle: vendorToHandle(vendor) }));
}

const POSTS_FOR_SITEMAP_QUERY = `
  *[_type == "post" && defined(slug.current) && !(_id in path("drafts.**"))] {
    "slug": slug.current,
    language,
    "updatedAt": _updatedAt,
    "translations": *[_type == "translation.metadata" && references(^._id)][0].translations[].value->{
      "slug": slug.current,
      language
    }
  }
`;

export async function getSitemapPosts(): Promise<SitemapPost[]> {
  'use cache';
  cacheLife('max');
  cacheTag('sitemap-posts');
  cacheTag('post');

  try {
    const posts = await sanityClient.fetch<SitemapPost[]>(
      POSTS_FOR_SITEMAP_QUERY,
    );
    return posts ?? [];
  } catch (error) {
    console.error('Failed to fetch posts for sitemap:', error);
    return [];
  }
}
