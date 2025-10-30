import { ShopifyClient, ShopifyClientConfig, GraphQLResponse } from './types';

export abstract class BaseShopifyClient implements ShopifyClient {
  protected accessToken: string;
  protected shopDomain: string;
  protected apiVersion: string;
  protected baseUrl: string;

  constructor(config: ShopifyClientConfig) {
    this.accessToken = config.accessToken || '';
    this.shopDomain = config.shopDomain || '';
    this.apiVersion = config.apiVersion || '';
    this.baseUrl = this.buildBaseUrl();

    this.validateConfig();
  }

  protected validateConfig(): void {
    if (!this.accessToken) {
      throw new Error('Access token is required');
    }
    if (!this.shopDomain) {
      throw new Error('Shop domain is required');
    }
    if (!this.apiVersion) {
      throw new Error('API version is required');
    }
  }

  protected abstract buildBaseUrl(): string;
  abstract buildHeaders(): Promise<Record<string, string>>;

  async buildBody(
    query: string,
    variables: Record<string, unknown> = {},
  ): Promise<string> {
    return JSON.stringify({ query, variables });
  }

  async parseResponse<T>(response: Response): Promise<GraphQLResponse<T>> {
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `HTTP Error ${response.status}: ${response.statusText}. Body: ${errorBody}`,
      );
    }

    const data = await response.json();

    if (data.errors && data.errors.length > 0) {
      const errorMessages = data.errors
        .map((error: { message: string }) => error.message)
        .join(', ');
      throw new Error(`GraphQL Error: ${errorMessages}`);
    }

    return data;
  }

  async request<T>({
    query,
    variables,
  }: {
    query: string;
    variables: Record<string, unknown>;
  }): Promise<T> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: await this.buildHeaders(),
      body: await this.buildBody(query, variables),
    });

    const result = await this.parseResponse<T>(response);
    return result.data as T;
  }
}
