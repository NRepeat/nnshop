import crypto from 'crypto';

const NOVAPAY_API_BASE = 'https://api-qecom.novapay.ua/v1';

export interface NovaPayProduct {
  description: string;
  count: number;
  price: number;
}

export interface CreateSessionParams {
  merchant_id: string;
  client_phone: string;
  client_first_name?: string;
  client_last_name?: string;
  client_patronymic?: string;
  client_email?: string;
  callback_url?: string;
  success_url?: string;
  fail_url?: string;
  metadata?: Record<string, unknown>;
}

export interface AddPaymentParams {
  merchant_id: string;
  session_id: string;
  amount: number;
  external_id?: string;
  use_hold?: boolean;
  products?: NovaPayProduct[];
}

export interface CompleteHoldParams {
  merchant_id: string;
  session_id: string;
  amount?: number;
}

export interface VoidParams {
  merchant_id: string;
  session_id: string;
}

export interface CreateSessionResponse {
  id: string;
  url?: string;
}

export interface AddPaymentResponse {
  id: string;
  url: string;
  delivery_price?: number;
}

export interface NovaPayPostback {
  id: string;
  status: 'created' | 'processing' | 'holded' | 'hold_confirmed' | 'processing_hold_completion' | 'paid' | 'expired' | 'failed' | 'processing_void' | 'voided';
  paytype?: string;
  terminal_name?: string;
  RRN?: string;
  APPROVAL?: string;
  created_at?: string;
  metadata?: Record<string, unknown>;
  client_first_name?: string;
  client_last_name?: string;
  client_patronymic?: string;
  client_phone?: string;
  client_ip?: string;
  processing_result?: string;
  card_details?: {
    pan?: string;
    card_bank?: string;
    card_country?: string;
    card_type?: string;
  };
  payments?: Array<{
    external_id?: string;
    amount?: number;
    products?: NovaPayProduct[];
  }>;
}

export interface NovaPayError {
  uuid?: string;
  type: 'processing' | 'validation';
  error?: string;
  code?: string;
  errors?: Array<{
    instancePath: string;
    schemaPath: string;
    keyword: string;
    params: Record<string, unknown>;
    message: string;
  }>;
}

export class NovaPay {
  constructor(
    private readonly merchantId: string,
    private readonly privateKey: string,
    private readonly novaPayPublicKey: string,
  ) {}

  /**
   * Sign request body with RSA SHA-256 and return base64-encoded signature.
   * NovaPay requires: SHA256(body) → RSA sign with merchant private key → base64.
   */
  private sign(body: string): string {
    const signer = crypto.createSign('SHA256');
    signer.update(body);
    signer.end();
    return signer.sign(this.privateKey, 'base64');
  }

  /**
   * Verify postback signature from NovaPay using their public key.
   * The x-sign header contains RSA SHA-256 signature of the raw body.
   */
  verifyPostback(rawBody: string, signature: string): boolean {
    try {
      const verifier = crypto.createVerify('SHA256');
      verifier.update(rawBody);
      verifier.end();
      return verifier.verify(this.novaPayPublicKey, signature, 'base64');
    } catch {
      return false;
    }
  }

  private async request<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const jsonBody = JSON.stringify(body);
    const xSign = this.sign(jsonBody);

    const res = await fetch(`${NOVAPAY_API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sign': xSign,
      },
      body: jsonBody,
    });

    const data = await res.json();

    if (!res.ok) {
      const err = data as NovaPayError;
      const message = err.error || err.errors?.map(e => e.message).join(', ') || `NovaPay error ${res.status}`;
      throw new Error(`NovaPay API error (${path}): ${message}`);
    }

    return data as T;
  }

  /**
   * Create a payment session.
   * Returns session ID and (optionally) a payment page URL.
   */
  async createSession(params: Omit<CreateSessionParams, 'merchant_id'>): Promise<CreateSessionResponse> {
    return this.request<CreateSessionResponse>('/session', {
      merchant_id: this.merchantId,
      ...params,
    });
  }

  /**
   * Add a payment to an existing session.
   * use_hold: true → two-stage payment (hold then complete).
   * Returns the payment page URL for customer redirect.
   */
  async addPayment(params: Omit<AddPaymentParams, 'merchant_id'>): Promise<AddPaymentResponse> {
    return this.request<AddPaymentResponse>('/payment', {
      merchant_id: this.merchantId,
      ...params,
    });
  }

  /**
   * Complete a hold — charge previously blocked funds.
   * Called after order is confirmed by the merchant.
   */
  async completeHold(sessionId: string, amount?: number): Promise<void> {
    await this.request<null>('/complete-hold', {
      merchant_id: this.merchantId,
      session_id: sessionId,
      ...(amount != null ? { amount } : {}),
    });
  }

  /**
   * Void a session — cancel or refund blocked/debited funds.
   */
  async voidSession(sessionId: string): Promise<void> {
    await this.request<null>('/void', {
      merchant_id: this.merchantId,
      session_id: sessionId,
    });
  }
}

export function createNovaPay(): NovaPay {
  const merchantId = process.env.NOVAPAY_MERCHANT_ID;
  const privateKey = process.env.NOVAPAY_PRIVATE_KEY;
  const novaPayPublicKey = process.env.NOVAPAY_PUBLIC_KEY;

  if (!merchantId || !privateKey || !novaPayPublicKey) {
    throw new Error('NOVAPAY_MERCHANT_ID, NOVAPAY_PRIVATE_KEY, and NOVAPAY_PUBLIC_KEY must be set');
  }

  return new NovaPay(merchantId, privateKey, novaPayPublicKey);
}

export default NovaPay;
