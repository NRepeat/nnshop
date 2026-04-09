import crypto from 'crypto';

const PAYPARTS_API_BASE = 'https://payparts2.privatbank.ua/ipp/v2';

export interface PayPartsProduct {
  name: string;
  count: number;
  price: number;
}

export interface CreatePaymentParams {
  storeId: string;
  orderId: string;
  amount: number;
  partsCount: number;
  merchantType: 'PP' | 'II'; // PP = Оплата частинами, II = Миттєва розстрочка
  products: PayPartsProduct[];
  responseUrl: string;
  redirectUrl: string;
}

export interface CreatePaymentResponse {
  state: 'SUCCESS' | 'FAIL';
  storeId: string;
  orderId: string;
  token?: string;
  message?: string;
  signature: string;
}

export interface PayPartsCallback {
  storeId: string;
  orderId: string;
  paymentState: 'CREATED' | 'CANCELED' | 'SUCCESS' | 'FAIL' | 'CLIENT_WAIT' | 'PP_CREATION' | 'LOCKED';
  message?: string;
  iban?: string;
  signature: string;
}

/**
 * Remove floating point from amount: 301.00 → 30100
 */
function withoutFloatingPoint(amount: number): string {
  return Math.round(amount * 100).toString();
}

function sha1Base64(input: string): string {
  return crypto.createHash('sha1').update(input).digest('base64');
}

export class PayParts {
  constructor(
    private readonly storeId: string,
    private readonly password: string,
  ) {}

  /**
   * Build signature for create payment request.
   * SHA1(password + storeId + orderId + amount + partsCount + merchantType + responseUrl + redirectUrl + products_string + password)
   */
  private signCreatePayment(params: CreatePaymentParams): string {
    const productsString = params.products
      .map((p) => `${p.name}${p.count}${withoutFloatingPoint(p.price)}`)
      .join('');

    const raw =
      this.password +
      params.storeId +
      params.orderId +
      withoutFloatingPoint(params.amount) +
      params.partsCount +
      params.merchantType +
      params.responseUrl +
      params.redirectUrl +
      productsString +
      this.password;

    return sha1Base64(raw);
  }

  /**
   * Verify callback signature.
   * SHA1(password + storeId + orderId + paymentState + message + password)
   */
  verifyCallback(callback: PayPartsCallback): boolean {
    const raw =
      this.password +
      callback.storeId +
      callback.orderId +
      callback.paymentState +
      (callback.message || '') +
      this.password;

    const expected = sha1Base64(raw);
    return expected === callback.signature;
  }

  /**
   * Create a payment and get redirect token.
   */
  async createPayment(params: Omit<CreatePaymentParams, 'storeId' | 'signature'>): Promise<CreatePaymentResponse> {
    const fullParams: CreatePaymentParams = {
      ...params,
      storeId: this.storeId,
    };

    const signature = this.signCreatePayment(fullParams);
    const body = { ...fullParams, signature };

    console.log(`[PayParts] → /payment/create orderId=${params.orderId} amount=${params.amount}`);

    const res = await fetch(`${PAYPARTS_API_BASE}/payment/create`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'UTF-8',
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(body),
    });

    const data: CreatePaymentResponse = await res.json();
    console.log(`[PayParts] ← ${data.state}`, data.token ? `token=${data.token}` : data.message);

    if (data.state !== 'SUCCESS' || !data.token) {
      throw new Error(`PayParts error: ${data.message || data.state}`);
    }

    return data;
  }

  /**
   * Get the redirect URL for customer payment.
   */
  getPaymentUrl(token: string): string {
    return `${PAYPARTS_API_BASE}/payment?token=${token}`;
  }
}

export function createPayParts(): PayParts {
  const storeId = process.env.PAYPARTS_STORE_ID;
  const password = process.env.PAYPARTS_PASSWORD;

  if (!storeId || !password) {
    throw new Error('PAYPARTS_STORE_ID and PAYPARTS_PASSWORD must be set');
  }

  return new PayParts(storeId, password);
}

export default PayParts;
