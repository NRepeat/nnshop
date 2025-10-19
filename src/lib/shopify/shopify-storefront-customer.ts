export default class CustomerAccountClient {
  accessToken: string;
  apiVersion: string;
  shopId: string;
  graphqlUrl: string;
  constructor(accessToken: string) {
    this.accessToken = accessToken;
    if (!this.accessToken) {
      throw new Error('Access token is required');
    }
    this.shopId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID || '';
    this.apiVersion = process.env.SHOPIFY_API_VERSION || '';
    this.graphqlUrl = `https://shopify.com/${this.shopId}/account/customer/api/${this.apiVersion}/graphql`;
  }

  async buildBody(query: string, variables: Record<string, string | number>) {
    return JSON.stringify({ query, variables });
  }
  async parseResponse(response: Response) {
    return response.json();
  }
  async buildHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: this.accessToken,
    };
  }
  async request(query: string, variables: Record<string, string | number>) {
    const response = await fetch(this.graphqlUrl, {
      method: 'POST',
      body: await this.buildBody(query, variables),
      headers: await this.buildHeaders(),
    });
    return this.parseResponse(response);
  }
}
