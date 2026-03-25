import { shopifyFactory, ShopifyClientType } from '../clients';

const adminAccessToken = process.env.SHOPIFY_ADMIN_API_SECRET_KEY;

if (!adminAccessToken) {
  console.warn(
    'Storefront client not created: SHOPIFY_ADMIN_API_SECRET_KEY is missing.',
  );
  throw new Error(
    'Storefront client not created: SHOPIFY_ADMIN_API_SECRET_KEY is missing.',
  );
}

const clientId = adminAccessToken;

// Dynamic wrapper: resolves a fresh/valid token from the factory on every
// request, so expired tokens are transparently refreshed without restarting.
export const adminClient = {
  get client() {
    return {
      request: async <T, V>(params: {
        query: string;
        variables: V;
      }): Promise<T> => {
        const { client } = await shopifyFactory.createAuthenticatedClient(
          ShopifyClientType.ADMIN,
          clientId,
        );
        return client.request<T, V>(params);
      },
    };
  },
};
