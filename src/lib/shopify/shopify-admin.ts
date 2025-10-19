import { ShopifySession } from '~/generated/prisma';
import prisma from '../prisma';
import { tryCatch } from '../try-catch';

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ADMIN_API_KEY = process.env.SHOPIFY_ADMIN_API_KEY;
const SHOPIFY_ADMIN_API_SECRET_KEY = process.env.SHOPIFY_ADMIN_API_SECRET_KEY;
const TOKEN_REFRESH_BUFFER_SECONDS = 60;

if (!SHOPIFY_STORE_DOMAIN) {
  throw new Error('SHOPIFY_STORE_DOMAIN environment variable is required');
}

if (!SHOPIFY_ADMIN_API_KEY) {
  throw new Error('SHOPIFY_ADMIN_API_KEY environment variable is required');
}

if (!SHOPIFY_ADMIN_API_SECRET_KEY) {
  throw new Error(
    'SHOPIFY_ADMIN_API_SECRET_KEY environment variable is required',
  );
}

const tokenEndpoint = `https://${SHOPIFY_STORE_DOMAIN}/admin/oauth/access_token`;

type ShopifyAdminTokenResponse = {
  access_token: string;
  scope: string;
  expires_in?: number;
};

async function requestNewAdminToken(): Promise<ShopifyAdminTokenResponse> {
  const body = {
    client_id: SHOPIFY_ADMIN_API_KEY,
    client_secret: SHOPIFY_ADMIN_API_SECRET_KEY,
    grant_type: 'client_credentials' as const,
  };

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to obtain Shopify admin access token (${response.status} ${response.statusText}): ${errorBody}`,
    );
  }

  const payload = (await response.json()) as ShopifyAdminTokenResponse;

  if (!payload.access_token) {
    throw new Error(
      'Shopify admin token response did not include access_token',
    );
  }

  if (!payload.scope) {
    throw new Error('Shopify admin token response did not include scope');
  }

  return payload;
}
class Client {
  session: ShopifySession;
  url: string;
  constructor(session: ShopifySession) {
    if (!process.env.SHOPIFY_API_VERSION || !SHOPIFY_STORE_DOMAIN) {
      throw new Error(
        'SHOPIFY_ADMIN_API_VERSION or SHOPIFY_STORE_DOMAIN is not set',
      );
    }
    this.url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`;
    this.session = session;
  }

  async request<T>(query: string, variables: Record<string, unknown> = {}) {
    const response = await tryCatch(
      fetch(this.url, {
        method: 'POST',
        body: JSON.stringify({ query, variables }),
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': this.session.accessToken,
        },
      }),
    );
    if (response.error) {
      throw new Error(`Request failed  ${response.error}`);
    }
    const data = await response.data.json();
    console.log(data);
    if (data.errors) {
      if (data.graphQLErrors) {
        throw new Error(
          data.graphQLErrors
            .map((error: { message: string }) => error.message)
            .join(', '),
        );
      }
      throw new Error(
        data.errors
          .map((error: { message: string }) => error.message)
          .join(', '),
      );
    }
    return data.data as T;
  }
}

export async function shopifyAdminAuth(clientId: string) {
  const now = Date.now();

  // First check if we have a valid existing session
  const existing = await prisma.shopifySession.findUnique({
    where: { clientId },
  });

  if (existing) {
    const expiresAt = existing.expiresIn.getTime();
    const refreshThreshold = expiresAt - TOKEN_REFRESH_BUFFER_SECONDS * 1000;

    if (refreshThreshold > now) {
      return {
        session: existing,
        client: new Client(existing),
      };
    }
  }

  // Need to refresh token - do this outside transaction
  const tokenResponse = await requestNewAdminToken();

  const expiresInSeconds = tokenResponse.expires_in ?? 0;
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

  // Now update/create the session in a transaction
  const session = await prisma.shopifySession.upsert({
    where: { clientId },
    update: {
      accessToken: tokenResponse.access_token,
      scope: tokenResponse.scope,
      expiresIn: expiresAt,
    },
    create: {
      clientId,
      accessToken: tokenResponse.access_token,
      scope: tokenResponse.scope,
      expiresIn: expiresAt,
    },
  });

  return {
    session,
    client: new Client(session),
  };
}
