import { MetadataRoute } from 'next';
import { client as sanityClient } from '@/shared/sanity/lib/client';
import { SITEMAP_QUERY } from '@/shared/sanity/lib/query';
import { storefrontClient } from '@shared/lib/shopify/client';
import { locales } from '@shared/i18n/routing';
import { connection } from 'next/server';

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

function formatDateForSitemap(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

interface ProductNode {
  handle: string;
  updatedAt: string;
}

interface CollectionNode {
  handle: string;
  updatedAt: string;
}

const GET_ALL_PRODUCTS_FOR_SITEMAP = `#graphql
  query GetAllProductsForSitemap($first: Int!, $after: String) {
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

const GET_ALL_COLLECTIONS_FOR_SITEMAP = `#graphql
  query GetAllCollectionsForSitemap {
    collections(first: 250) {
      edges {
        node {
          handle
          updatedAt
        }
      }
    }
  }
`;

interface ProductsResponse {
  products: {
    edges: Array<{ node: ProductNode }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

interface CollectionsResponse {
  collections: {
    edges: Array<{ node: CollectionNode }>;
  };
}

async function getAllProductsForSitemap(): Promise<ProductNode[]> {
  const allProducts: ProductNode[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  try {
    while (hasNextPage) {
      const response: ProductsResponse = await storefrontClient.request<
        ProductsResponse,
        { first: number; after: string | null }
      >({
        query: GET_ALL_PRODUCTS_FOR_SITEMAP,
        variables: { first: 250, after: cursor },
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

async function getAllCollectionsForSitemap(): Promise<CollectionNode[]> {
  try {
    const response: CollectionsResponse = await storefrontClient.request<
      CollectionsResponse,
      Record<string, never>
    >({
      query: GET_ALL_COLLECTIONS_FOR_SITEMAP,
      variables: {},
    });

    return response.collections?.edges.map((edge) => edge.node) || [];
  } catch (error) {
    console.error('Failed to fetch collections for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();

  const sitemapEntries: MetadataRoute.Sitemap = [];

  try {
    // Fetch Sanity pages (existing logic)
    const sanityPaths = await sanityClient.fetch(SITEMAP_QUERY);

    if (sanityPaths) {
      for (const path of sanityPaths) {
        sitemapEntries.push({
          url: new URL(path.href!, BASE_URL).toString(),
          lastModified: formatDateForSitemap(path._updatedAt),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }

    // Fetch Shopify products
    const products = await getAllProductsForSitemap();

    for (const product of products) {
      for (const locale of locales) {
        const alternates: Record<string, string> = {};
        for (const altLocale of locales) {
          alternates[altLocale] = `${BASE_URL}/${altLocale}/product/${product.handle}`;
        }

        sitemapEntries.push({
          url: `${BASE_URL}/${locale}/product/${product.handle}`,
          lastModified: formatDateForSitemap(product.updatedAt),
          changeFrequency: 'daily',
          priority: 0.8,
          alternates: {
            languages: alternates,
          },
        });
      }
    }

    // Fetch Shopify collections
    const collections = await getAllCollectionsForSitemap();

    for (const collection of collections) {
      for (const locale of locales) {
        const alternates: Record<string, string> = {};
        for (const altLocale of locales) {
          alternates[altLocale] = `${BASE_URL}/${altLocale}/collection/${collection.handle}`;
        }

        sitemapEntries.push({
          url: `${BASE_URL}/${locale}/collection/${collection.handle}`,
          lastModified: formatDateForSitemap(collection.updatedAt),
          changeFrequency: 'daily',
          priority: 0.9,
          alternates: {
            languages: alternates,
          },
        });
      }
    }

    // Add static pages (home, info pages)
    const staticPages = ['', '/man', '/woman'];
    const infoPages = [
      'contacts',
      'delivery',
      'sustainability',
      'payment-returns',
      'public-offer-agreement',
      'privacy-policy',
    ];

    for (const page of staticPages) {
      for (const locale of locales) {
        const alternates: Record<string, string> = {};
        for (const altLocale of locales) {
          alternates[altLocale] = `${BASE_URL}/${altLocale}${page}`;
        }

        sitemapEntries.push({
          url: `${BASE_URL}/${locale}${page}`,
          lastModified: formatDateForSitemap(new Date()),
          changeFrequency: 'daily',
          priority: 1.0,
          alternates: {
            languages: alternates,
          },
        });
      }
    }

    for (const slug of infoPages) {
      for (const locale of locales) {
        const alternates: Record<string, string> = {};
        for (const altLocale of locales) {
          alternates[altLocale] = `${BASE_URL}/${altLocale}/info/${slug}`;
        }

        sitemapEntries.push({
          url: `${BASE_URL}/${locale}/info/${slug}`,
          lastModified: formatDateForSitemap(new Date()),
          changeFrequency: 'monthly',
          priority: 0.5,
          alternates: {
            languages: alternates,
          },
        });
      }
    }

    return sitemapEntries;
  } catch (error) {
    console.error('Failed to generate sitemap:', error);
    return [];
  }
}
