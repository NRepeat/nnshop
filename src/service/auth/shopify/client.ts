import { decodeIdToken } from '@/lib/shopify/customer-account';
import { genericOAuth } from 'better-auth/plugins';

const shopifyClientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;
const shopifyClientSecret = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET;
const baseUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_AUTH_BASE_URL;
const authPath = process.env.SHOPIFY_CUSTOMER_ACCOUNT_AUTH_URL;
const tokenPath = process.env.SHOPIFY_CUSTOMER_ACCOUNT_TOKEN_URL;
const shopId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID;

if (!shopifyClientId) {
  throw new Error('Shopify client id not provided');
}
if (!shopifyClientSecret) {
  throw new Error('Shopify client seecret not provided');
}
if (!shopId) {
  throw new Error('Shopify account id not provided');
}
const baseAuthUrl = `${baseUrl}/${shopId}`;
const providerId = 'shopify';
const scopes = ['openid', 'email', 'customer-account-api:full'];
const discoveryUrl = `${baseAuthUrl}/.well-known/openid-configuration`;
const authorizationUrl = `${baseAuthUrl}/${authPath}`;
const tokenUrl = `${baseAuthUrl}/${tokenPath}`;

export const oauthShopifyClient = genericOAuth({
  config: [
    {
      providerId,
      clientId: shopifyClientId,
      clientSecret: shopifyClientSecret,
      discoveryUrl,
      scopes,
      tokenUrl,
      responseType: 'code',
      authorizationUrl: authorizationUrl,
      mapProfileToUser: async (profile) => {
        return {
          emailVerified: Boolean(profile.email_verified),
          email: String(profile.email ?? ''),
          id: profile.sub?.toString() || profile.id?.toString(),
          name: profile.email as string,
          image: profile.image as string,
        };
      },
      getUserInfo: async (tokens) => {
        if (tokens.idToken) {
          const userData = decodeIdToken(tokens.idToken);
          return {
            emailVerified: Boolean(userData.email_verified),
            email: String(userData.email ?? ''),
            id: userData.sub?.toString() || (userData.id?.toString() as string),
            name: userData.email as string,
            image: userData.image as string,
          };
        }

        throw new Error('No ID token available');
      },
    },
  ],
});
