import {
  createStorefrontApiClient,
  StorefrontApiClient,
} from '@shopify/storefront-api-client';
import {
  ShopifyClient,
  ShopifyClientConfig,
  GraphQLResponse,
  StorefrontLanguageCode,
} from './types';

export class StorefrontClient implements ShopifyClient {
  private client: StorefrontApiClient;
  private accessToken: string;
  private shopDomain: string;
  private apiVersion: string;

  constructor(config: ShopifyClientConfig & { customFetchApi?: typeof fetch }) {
    this.accessToken = config.accessToken!;
    this.shopDomain = config.shopDomain!;
    this.apiVersion = config.apiVersion!;

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
  private addLanguageContext(
    query: string,
    language: StorefrontLanguageCode,
  ): string {
    if (query.includes('@inContext')) {
      return query;
    }
    let modifiedQuery = query.replace(
      /(query\s+\w+)\s*(\([^)]+\))\s*\{/,
      `$1 $2 @inContext(language: ${language}) {`,
    );

    if (modifiedQuery === query) {
      modifiedQuery = query.replace(
        /(query\s+\w+)\s*\{/,
        `$1 @inContext(language: ${language}) {`,
      );
    }

    if (modifiedQuery === query) {
      modifiedQuery = query.replace(
        /query\s*\{/,
        `query @inContext(language: ${language}) {`,
      );
    }

    return modifiedQuery;
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

  private validLanguages: Set<string> = new Set(['RU', 'UK']);

  private sanitizeLanguage(
    language: StorefrontLanguageCode,
  ): StorefrontLanguageCode {
    if (this.validLanguages.has(language)) {
      return language;
    }
    return 'UK';
  }

  async request<T, V>({
    query,
    variables,
    language,
    signal,
  }: {
    query: string;
    variables: V;
    language?: StorefrontLanguageCode;
    signal?: AbortSignal;
  }): Promise<T> {
    try {
      let modifiedQuery = query;
      if (language) {
        modifiedQuery = this.addLanguageContext(
          query,
          this.sanitizeLanguage(language),
        );
      }

      const ver = variables as Record<string, unknown>;
      const response = await this.client.request(modifiedQuery, {
        variables: ver,
      });
      if (response.errors) {
        console.error(JSON.stringify(response.errors, null, 2));
        throw new Error(
          `Storefront API GraphQL: ${JSON.stringify(response.errors)}`,
        );
      }

      return response.data as T;
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
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
