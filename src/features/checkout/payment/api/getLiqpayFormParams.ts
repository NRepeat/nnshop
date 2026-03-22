'use server';

import LiqPay from '@entities/liqpay/model';
import { CheckoutData } from '@features/checkout/schema/checkoutDataSchema';

interface LiqpayFormParamsInput {
  shopifyOrderId: string;
  orderName: string; // human-readable order number e.g. "#6001"
  amount: number;
  currency: string;
  checkoutData?: Omit<CheckoutData, 'paymentInfo'> | null;
  lineItems?: { title: string; quantity: number }[];
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

  const { shopifyOrderId, orderName, amount, currency, lineItems } = input;
  const orderId = shopifyOrderId.split('/').pop()!;

  // Round to 2 decimal places to avoid floating-point artifacts (e.g. 13150.0000000001)
  const roundedAmount = Math.round(amount * 100) / 100;

  const description = `Оплата замовлення ${orderName} — Mio Mio`;

  // Build product_name (first item, max 100 chars) and product_description (all items, max 500 chars)
  const firstItem = lineItems?.[0];
  const product_name = firstItem
    ? `${firstItem.title}`.slice(0, 100)
    : 'Mio Mio';
  const product_description = lineItems && lineItems.length > 0
    ? lineItems
        .map((item) => `${item.quantity}x ${item.title}`)
        .join(', ')
        .slice(0, 500)
    : description;

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
    product_name,
    product_description,
    product_url: baseUrl,
  });

  return { data, signature, checkoutUrl: 'https://www.liqpay.ua/api/3/checkout' };
}
