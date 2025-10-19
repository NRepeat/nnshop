import {
  createStorefrontApiClient,
  StorefrontApiClient,
} from '@shopify/storefront-api-client';
import { tryCatch } from '../try-catch';

export default class StoreFrontClient {
  accessToken: string;
  domain: string;
  apiVersion: string;
  client: StorefrontApiClient;
  constructor() {
    this.accessToken = process.env.SHOPIFY_STOREFRONT_SECRET_TOKEN || '';
    this.domain = 'https://' + process.env.SHOPIFY_STORE_DOMAIN || '';
    this.apiVersion = process.env.SHOPIFY_API_VERSION || '';
    this.client = createStorefrontApiClient({
      storeDomain: this.domain,
      apiVersion: this.apiVersion,
      privateAccessToken: this.accessToken,
    });
  }

  private addLanguageContext(query: string, language: ['ua,en']): string {
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

  async request<T>(
    query: string,
    variables: Record<string, number | string> = {},
    language?: ['ua,en'],
  ): Promise<T> {
    let modifiedQuery = query;

    if (language) {
      modifiedQuery = this.addLanguageContext(query, language);
    }

    const response = await tryCatch(
      this.client.request<T>(modifiedQuery, { ...variables, variables }),
    );
    if (response.error) {
      console.error('GraphQL Request Error:', response.error);
      throw response.error;
    }
    if (response.data.errors) {
      const graphQLErrors = Array.isArray(response.data.errors.graphQLErrors)
        ? response.data.errors.graphQLErrors
        : [];

      const errorMessage = [
        response.data.errors.message,
        ...graphQLErrors
          .map((error: { message: string }) => error?.message)
          .filter(Boolean),
      ]
        .filter(Boolean)
        .join(' ');

      throw new Error(errorMessage || 'Unknown Shopify GraphQL error');
    }
    return response.data.data as T;
  }
}
