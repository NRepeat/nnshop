import { AdminClient } from '../clients/admin-client';
import { StorefrontClient } from '../clients/storefront-client';
import { env } from '../env';

export const adminClient = new AdminClient({
  shopDomain: env.SHOPIFY_SHOP_DOMAIN,
  accessToken: env.SHOPIFY_ADMIN_ACCESS_TOKEN,
  apiVersion: env.SHOPIFY_API_VERSION,
});

export const storefrontClient = new StorefrontClient({
  shopDomain: env.SHOPIFY_SHOP_DOMAIN,
  accessToken: env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  apiVersion: env.SHOPIFY_API_VERSION,
});
