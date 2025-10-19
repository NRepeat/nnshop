import {
  createStorefrontApiClient,
  StorefrontApiClient,
} from '@shopify/storefront-api-client';
import { ShopifyClient, ShopifyClientConfig, GraphQLResponse } from './types';

export class StorefrontClient implements ShopifyClient {
  private client: StorefrontApiClient;
  private accessToken: string;
  private shopDomain: string;
  private apiVersion: string;

  constructor(config: ShopifyClientConfig & { customFetchApi?: typeof fetch }) {
    this.accessToken = config.accessToken;
    this.shopDomain = config.shopDomain;
    this.apiVersion = config.apiVersion;

    this.validateConfig();

    this.client = createStorefrontApiClient({
      storeDomain: this.shopDomain,
      apiVersion: this.apiVersion,
      privateAccessToken: this.accessToken,
      customFetchApi: config.customFetchApi || fetch,
    });
  }

  private validateConfig(): void {
    if (!this.accessToken) {
      throw new Error('Access token is required for Storefront API');
    }
    if (!this.shopDomain) {
      throw new Error('Shop domain is required for Storefront API');
    }
    if (!this.apiVersion) {
      throw new Error('API version is required for Storefront API');
    }
  }

  async buildHeaders(): Promise<Record<string, string>> {
    return {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': this.accessToken,
    };
  }

  async buildBody(
    query: string,
    variables: Record<string, unknown> = {},
  ): Promise<string> {
    return JSON.stringify({ query, variables });
  }

  async parseResponse<T>(response: Response): Promise<GraphQLResponse<T>> {
    const data = await response.json();
    return data as GraphQLResponse<T>;
  }

  async request<T>(
    query: string,
    variables: Record<string, unknown> = {},
  ): Promise<T> {
    try {
      const response = await this.client.request(query, { variables });

      if (response.errors && response.errors.length > 0) {
        const errorMessages = response.errors
          .map((error) => error.message)
          .join(', ');
        throw new Error(`Storefront API GraphQL Error: ${errorMessages}`);
      }

      return response.data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Storefront API Request Failed: ${error.message}`);
      }
      throw new Error(`Storefront API Request Failed: ${String(error)}`);
    }
  }

  async requestWithExtensions<T>(
    query: string,
    variables: Record<string, unknown> = {},
  ) {
    const response = await this.client.request(query, { variables });
    return {
      data: response.data as T,
      errors: response.errors,
      extensions: response.extensions,
    };
  }

  getUnderlyingClient(): StorefrontApiClient {
    return this.client;
  }

  isConfigured(): boolean {
    return !!(this.accessToken && this.shopDomain && this.apiVersion);
  }
}
