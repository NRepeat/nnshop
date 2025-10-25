import { BaseShopifyClient } from './base-client';
import { ShopifyClientConfig } from './types';

export class AdminClient extends BaseShopifyClient {
  constructor(config: ShopifyClientConfig) {
    super(config);
  }

  protected buildBaseUrl(): string {
    return `https://${this.shopDomain}/admin/api/${this.apiVersion}/graphql.json`;
  }

  async buildHeaders(): Promise<Record<string, string>> {
    return {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': this.accessToken,
    };
  }
}
