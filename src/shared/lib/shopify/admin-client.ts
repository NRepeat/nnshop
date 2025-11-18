import { shopifyFactory, ShopifyClientType, ShopifyClient } from '../clients';

const adminAccessToken = process.env.SHOPIFY_ADMIN_API_SECRET_KEY;

if (!adminAccessToken) {
  console.warn(
    'Storefront client not created: SHOPIFY_ADMIN_API_SECRET_KEY is missing.',
  );
  throw new Error(
    'Storefront client not created: SHOPIFY_ADMIN_API_SECRET_KEY is missing.',
  );
}

export const adminClient = await shopifyFactory.createClient(
  ShopifyClientType.ADMIN,
  {
    accessToken: adminAccessToken,
  },
);
