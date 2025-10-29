import { shopifyFactory, ShopifyClientType, ShopifyClient } from '../clients';

const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_SECRET_TOKEN;

if (!storefrontAccessToken) {
  console.warn(
    'Storefront client not created: SHOPIFY_STOREFRONT_SECRET_TOKEN is missing.',
  );
  // Return a mock/dummy client or null if you prefer to handle this gracefully
}

// Create a single instance of the Storefront client using the factory
// We use a promise here to handle the async creation, which can be awaited in the files that use it.
export const storefrontClient = await shopifyFactory.createClient(
  ShopifyClientType.STOREFRONT,
  {
    accessToken: storefrontAccessToken!,
  },
);
