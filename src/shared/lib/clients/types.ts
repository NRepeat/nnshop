export interface ShopifyClientConfig {
  accessToken?: string;
  shopDomain?: string;
  apiVersion?: string;
  customFetchApi?: typeof fetch;
}
export type StorefrontLanguageCode = 'RU' | 'UK';

export interface GraphQLRequest {
  query: string;
  variables?: Record<string, unknown>;
}

export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
  extensions?: Record<string, unknown>;
}

export interface ShopifyClient {
  request<T, V>({
    query,
    variables,
    language,
    cache,
  }: {
    query: string;
    variables?: V;
    language?: StorefrontLanguageCode;
    cache?: string;
  }): Promise<T>;
  buildHeaders(): Promise<Record<string, string>>;
  buildBody(
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<string>;
  parseResponse<T>(response: Response): Promise<GraphQLResponse<T>>;
}

export interface SessionData {
  accessToken: string;
  scope?: string;
  expiresIn?: Date;
  clientId?: string;
}

export interface AuthenticatedClient {
  session: SessionData;
  client: ShopifyClient;
}

export enum ShopifyClientType {
  ADMIN = 'admin',
  STOREFRONT = 'storefront',
  CUSTOMER_ACCOUNT = 'customer_account',
}

export interface ShopifyClientFactory {
  createClient(
    type: ShopifyClientType,
    config: ShopifyClientConfig,
  ): Promise<ShopifyClient>;
  createAuthenticatedClient(
    type: ShopifyClientType,
    clientId: string,
  ): Promise<AuthenticatedClient>;
}
