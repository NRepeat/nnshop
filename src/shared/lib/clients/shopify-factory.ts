import {
  ShopifyClientFactory,
  ShopifyClientType,
  ShopifyClientConfig,
  AuthenticatedClient,
  ShopifyClient,
  SessionData,
} from './types';
import { AdminClient } from './admin-client';
import { StorefrontClient } from './storefront-client';
import { CustomerAccountClient } from './customer-account-client';
import prisma from '@/shared/lib/prisma';

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ADMIN_API_KEY = process.env.SHOPIFY_ADMIN_API_KEY;
const SHOPIFY_ADMIN_API_SECRET_KEY = process.env.SHOPIFY_ADMIN_API_SECRET_KEY;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION;
const SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID =
  process.env.SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID;
const TOKEN_REFRESH_BUFFER_SECONDS = 60;

type ShopifyAdminTokenResponse = {
  access_token: string;
  scope: string;
  expires_in?: number;
};

export class ShopifyFactory implements ShopifyClientFactory {
  private static instance: ShopifyFactory;

  private constructor() {}

  static getInstance(): ShopifyFactory {
    if (!ShopifyFactory.instance) {
      ShopifyFactory.instance = new ShopifyFactory();
    }
    return ShopifyFactory.instance;
  }

  async createClient(
    type: ShopifyClientType,
    config: ShopifyClientConfig,
  ): Promise<ShopifyClient> {
    this.validateEnvironmentVariables();
    let defaultConfig = await this.getDefaultConfig();
    defaultConfig = { ...defaultConfig, ...config };
    switch (type) {
      case ShopifyClientType.ADMIN:
        return new AdminClient(defaultConfig);

      case ShopifyClientType.STOREFRONT:
        return new StorefrontClient({
          ...defaultConfig,
        });

      case ShopifyClientType.CUSTOMER_ACCOUNT:
        if (!SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID) {
          throw new Error(
            'SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID environment variable is required for Customer Account API',
          );
        }
        return new CustomerAccountClient({
          ...defaultConfig,
          shopId: SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID,
        });

      default:
        throw new Error(`Unsupported client type: ${type}`);
    }
  }

  async getDefaultConfig(): Promise<ShopifyClientConfig> {
    return {
      apiVersion: process.env.SHOPIFY_API_VERSION!,
      shopDomain: process.env.SHOPIFY_STORE_DOMAIN!,
    };
  }

  async createAuthenticatedClient(
    type: ShopifyClientType,
    clientId: string,
  ): Promise<AuthenticatedClient> {
    switch (type) {
      case ShopifyClientType.ADMIN:
        return this.createAdminAuthenticatedClient(clientId);

      case ShopifyClientType.STOREFRONT:
        throw new Error(
          'Storefront API does not require session-based authentication',
        );

      case ShopifyClientType.CUSTOMER_ACCOUNT:
        throw new Error(
          'Customer Account API authentication should be handled separately',
        );

      default:
        throw new Error(`Unsupported authenticated client type: ${type}`);
    }
  }

  private async createAdminAuthenticatedClient(
    clientId: string,
  ): Promise<AuthenticatedClient> {
    const session = await this.getOrRefreshAdminSession(clientId);

    const client = await this.createClient(ShopifyClientType.ADMIN, {
      accessToken: session.accessToken,
      shopDomain: SHOPIFY_STORE_DOMAIN!,
      apiVersion: SHOPIFY_API_VERSION!,
    });

    return {
      session,
      client,
    };
  }

  private async getOrRefreshAdminSession(
    clientId: string,
  ): Promise<SessionData> {
    const now = Date.now();

    const existing = await prisma.shopifySession.findUnique({
      where: { clientId },
    });

    if (existing) {
      const expiresAt = existing.expiresIn.getTime();
      const refreshThreshold = expiresAt - TOKEN_REFRESH_BUFFER_SECONDS * 1000;

      if (refreshThreshold > now) {
        return {
          accessToken: existing.accessToken,
          scope: existing.scope,
          expiresIn: existing.expiresIn,
          clientId: existing.clientId,
        };
      }
    }

    const tokenResponse = await this.requestNewAdminToken();
    const expiresInSeconds = tokenResponse.expires_in ?? 0;
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

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
      accessToken: session.accessToken,
      scope: session.scope,
      expiresIn: session.expiresIn,
      clientId: session.clientId,
    };
  }

  private async requestNewAdminToken(): Promise<ShopifyAdminTokenResponse> {
    if (
      !SHOPIFY_STORE_DOMAIN ||
      !SHOPIFY_ADMIN_API_KEY ||
      !SHOPIFY_ADMIN_API_SECRET_KEY
    ) {
      throw new Error('Admin API credentials are not properly configured');
    }

    const tokenEndpoint = `https://${SHOPIFY_STORE_DOMAIN}/admin/oauth/access_token`;

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

  private validateEnvironmentVariables(): void {
    if (!SHOPIFY_STORE_DOMAIN) {
      throw new Error('SHOPIFY_STORE_DOMAIN environment variable is required');
    }

    if (!SHOPIFY_API_VERSION) {
      throw new Error('SHOPIFY_API_VERSION environment variable is required');
    }
  }
}

export const shopifyFactory = ShopifyFactory.getInstance();
