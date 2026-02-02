import {
  ShopifyClient,
  ShopifyClientConfig,
  GraphQLResponse,
  StorefrontLanguageCode,
} from './types';

export class StorefrontClient implements ShopifyClient {
  private accessToken: string;
  private shopDomain: string;
  private apiVersion: string;
  private maxRetries = 3;
  private retryDelay = 1000;
  private apiUrl: string;

  constructor(config: ShopifyClientConfig) {
    this.accessToken = config.accessToken!;
    this.shopDomain = config.shopDomain!;
    this.apiVersion = config.apiVersion!;
    this.apiUrl = `https://${this.shopDomain}/api/${this.apiVersion}/graphql.json`;

    this.validateConfig();
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

  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries = this.maxRetries,
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0) {
        throw error;
      }

      const isRetryableError =
        error instanceof Error &&
        (error.message.includes('502') ||
          error.message.includes('503') ||
          error.message.includes('Bad Gateway') ||
          error.message.includes('Service Unavailable') ||
          error.message.includes('ETIMEDOUT') ||
          error.message.includes('ECONNRESET'));

      if (!isRetryableError) {
        throw error;
      }

      const delay = this.retryDelay * (this.maxRetries - retries + 1);
      console.log(
        `Retrying request after ${delay}ms. Retries left: ${retries - 1}`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.retryWithBackoff(fn, retries - 1);
    }
  }

  async buildHeaders(): Promise<Record<string, string>> {
    return {
      'Content-Type': 'application/json',
      // 'X-Shopify-Storefront-Access-Token': this.accessToken,
      'Shopify-Storefront-Private-Token': this.accessToken,
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
    cache = 'force-cache',
    revalidate,
    tags,
  }: {
    query: string;
    variables: V;
    language?: StorefrontLanguageCode;
    signal?: AbortSignal;
    cache?: RequestCache;
    revalidate?: number | false;
    tags?: string[];
  }): Promise<T> {
    return this.retryWithBackoff(async () => {
      try {
        let modifiedQuery = query;
        if (language) {
          modifiedQuery = this.addLanguageContext(
            query,
            this.sanitizeLanguage(language),
          );
        }

        const headers = await this.buildHeaders();
        const body = await this.buildBody(modifiedQuery, variables as Record<string, unknown>);

        // Build Next.js fetch options
        const fetchOptions: RequestInit = {
          method: 'POST',
          headers,
          body,
          signal,
          cache,
        };

        // Add Next.js specific options
        if (revalidate !== undefined) {
          (fetchOptions as any).next = {
            revalidate,
            tags: tags || [],
          };
        } else if (tags && tags.length > 0) {
          (fetchOptions as any).next = {
            tags,
          };
        }

        const response = await fetch(this.apiUrl, fetchOptions);

        if (!response.ok) {
          // Detailed error logging for 401
          const errorText = await response.text();
          console.error('❌ Shopify API Error:', {
            status: response.status,
            statusText: response.statusText,
            url: this.apiUrl,
            headers: headers,
            responseBody: errorText,
          });
          throw new Error(
            `HTTP Error: ${response.status} ${response.statusText} - ${errorText}`,
          );
        }

        const result = await this.parseResponse<T>(response);

        if (result.errors) {
          console.error('GraphQL Errors:', JSON.stringify(result.errors, null, 2));
          throw new Error(
            `Storefront API GraphQL Error: ${JSON.stringify(result.errors)}`,
          );
        }

        return result.data as T;
      } catch (error) {
        if (error instanceof Error) {
          console.error('Storefront API Error:', error);
          throw new Error(`Storefront API Request Failed: ${error.message}`);
        }
        throw new Error(`Storefront API Request Failed: ${String(error)}`);
      }
    });
  }

  async requestWithExtensions<T>(
    query: string,
    variables: Record<string, unknown> = {},
    options?: {
      cache?: RequestCache;
      revalidate?: number | false;
      tags?: string[];
    },
  ) {
    try {
      const headers = await this.buildHeaders();
      const body = await this.buildBody(query, variables);

      const fetchOptions: RequestInit = {
        method: 'POST',
        headers,
        body,
        cache: options?.cache || 'force-cache',
      };

      // Add Next.js specific options
      if (options?.revalidate !== undefined || options?.tags) {
        (fetchOptions as any).next = {
          ...(options.revalidate !== undefined && { revalidate: options.revalidate }),
          ...(options.tags && { tags: options.tags }),
        };
      }

      const response = await fetch(this.apiUrl, fetchOptions);

      if (!response.ok) {
        throw new Error(
          `HTTP Error: ${response.status} ${response.statusText}`,
        );
      }

      const result = await response.json();

      return {
        data: result.data as T,
        errors: result.errors,
        extensions: result.extensions,
      };
    } catch (error) {
      console.error('Storefront API Error:', error);
      throw error;
    }
  }

  // For backward compatibility
  getUnderlyingClient() {
    return null;
  }

  isConfigured(): boolean {
    return !!(this.accessToken && this.shopDomain && this.apiVersion);
  }
}
