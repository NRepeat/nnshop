'use server';

import LiqPay from '@entities/liqpay/model';
import { CheckoutData } from '@features/checkout/schema/checkoutDataSchema';

interface LiqpayFormParamsInput {
  shopifyOrderId: string;
  amount: number;
  currency: string;
  checkoutData?: Omit<CheckoutData, 'paymentInfo'> | null;
}

export async function getLiqpayFormParams(input: LiqpayFormParamsInput): Promise<{
  data: string;
  signature: string;
  checkoutUrl: string;
}> {
  const publicKey = process.env.LIQPAY_PUBLIC_KEY;
  const privateKey = process.env.LIQPAY_PRIVATE_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  if (!publicKey || !privateKey) {
    throw new Error('LiqPay keys not configured');
  }

  const { shopifyOrderId, amount, currency, checkoutData } = input;
  const orderId = shopifyOrderId.split('/').pop()!;

  // Round to 2 decimal places to avoid floating-point artifacts (e.g. 13150.0000000001)
  const roundedAmount = Math.round(amount * 100) / 100;

  const description = `Оплата замовлення #${orderId} — Mio Mio`;

  const liqpay = new LiqPay(publicKey, privateKey);
  const { data, signature } = liqpay.cnbObject({
    version: 3,
    action: 'hold',
    amount: roundedAmount,
    currency,
    description,
    order_id: orderId,
    server_url: `${baseUrl}/api/liqpay/callback`,
    result_url: `${baseUrl}/checkout/success/${orderId}`,
    language: 'uk',
  });

  return { data, signature, checkoutUrl: 'https://www.liqpay.ua/api/3/checkout' };
}
