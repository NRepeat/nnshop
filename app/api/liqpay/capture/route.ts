import LiqPay from '@entities/liqpay/model';
import { prisma } from '@shared/lib/prisma';
import { adminClient } from '@shared/lib/shopify/admin-client';
import { PRICE_APP_URL, INTERNAL_API_SECRET } from '@shared/config/shop';
import { NextRequest, NextResponse } from 'next/server';

const ORDER_MARK_AS_PAID_MUTATION = `
  mutation orderMarkAsPaid($input: OrderMarkAsPaidInput!) {
    orderMarkAsPaid(input: $input) {
      order { id }
      userErrors { field message }
    }
  }
`;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (INTERNAL_API_SECRET && authHeader !== `Bearer ${INTERNAL_API_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { orderName, shopifyOrderId } = body;
  if (!orderName && !shopifyOrderId) {
    return NextResponse.json({ error: 'Missing orderName or shopifyOrderId' }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: shopifyOrderId
      ? { shopifyOrderId }
      : { orderName: { contains: orderName } },
    include: { user: { include: { paymentInformation: true } } },
  });

  if (!order?.shopifyOrderId) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const numericOrderId = order.shopifyOrderId.split('/').pop()!;
  const amount = order.user?.paymentInformation?.amount;
  const currency = order.user?.paymentInformation?.currency || 'UAH';

  if (!amount) {
    return NextResponse.json({ error: 'Payment info not found' }, { status: 404 });
  }

  const liqpay = new LiqPay(process.env.LIQPAY_PUBLIC_KEY!, process.env.LIQPAY_PRIVATE_KEY!);

  try {
    await liqpay.api('request', {
      version: 3,
      action: 'hold_completion',
      order_id: numericOrderId,
      amount: Math.round(amount * 100) / 100,
      currency,
      description: `Capture order ${orderName}`,
    });
  } catch (err) {
    console.error('[liqpay/capture] hold_completion failed:', err);
    return NextResponse.json({ error: 'LiqPay hold_completion failed' }, { status: 500 });
  }

  // Mark as paid in Shopify
  try {
    await adminClient.client.request<any, any>({
      query: ORDER_MARK_AS_PAID_MUTATION,
      variables: { input: { id: order.shopifyOrderId } },
    });
  } catch (err) {
    console.error('[liqpay/capture] orderMarkAsPaid failed:', err);
  }

  // Confirm in keyCRM + eSputnik
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (INTERNAL_API_SECRET) headers['Authorization'] = `Bearer ${INTERNAL_API_SECRET}`;
    fetch(`${PRICE_APP_URL}/api/internal/confirm-payment`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ orderName: order.orderName, amount, currency, paymentMethod: 'liqpay' }),
    }).catch(console.error);
  } catch {}

  return NextResponse.json({ message: 'Captured', orderName });
}
