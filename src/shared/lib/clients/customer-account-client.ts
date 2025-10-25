import { BaseShopifyClient } from './base-client';
import { ShopifyClientConfig } from './types';

export class CustomerAccountClient extends BaseShopifyClient {
  private shopId: string;

  constructor(config: ShopifyClientConfig & { shopId: string }) {
    super(config);
    this.shopId = config.shopId;

    if (!this.shopId) {
      throw new Error('Shop ID is required for Customer Account API');
    }
  }

  protected buildBaseUrl(): string {
    if (!this.shopId) {
      this.shopId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID!;
    }
    return `https://shopify.com/${this.shopId}/account/customer/api/${this.apiVersion}/graphql`;
  }

  async buildHeaders(): Promise<Record<string, string>> {
    return {
      'Content-Type': 'application/json',
      Authorization: this.accessToken,
    };
  }
}
