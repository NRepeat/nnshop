import { shopifyFactory, ShopifyClientType } from '../clients';

const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_SECRET_TOKEN;

if (!storefrontAccessToken) {
  console.warn(
    'Storefront client not created: SHOPIFY_STOREFRONT_SECRET_TOKEN is missing.',
  );
  throw new Error(
    'Storefront client not created: SHOPIFY_STOREFRONT_SECRET_TOKEN is missing.',
  );
}

export const storefrontClient = await shopifyFactory.createClient(
  ShopifyClientType.STOREFRONT,
  {
    accessToken: storefrontAccessToken!,
  },
);
