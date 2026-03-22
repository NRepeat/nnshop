import LiqPay from '@entities/liqpay/model';
import { prisma } from '@shared/lib/prisma';
import { adminClient } from '@shared/lib/shopify/admin-client';
import { INTERNAL_API_SECRET } from '@shared/config/shop';
import { NextRequest, NextResponse } from 'next/server';

const GET_ORDER_AMOUNT_QUERY = `
  query getOrderAmount($id: ID!) {
    order(id: $id) {
      totalPriceSet { shopMoney { amount currencyCode } }
    }
  }
`;

export async function POST(request: NextRequest) {
  // Auth — reject if secret is configured and header doesn't match.
  // Also reject if secret is NOT configured: this endpoint triggers financial
  // operations and must never be publicly accessible.
  const authHeader = request.headers.get('Authorization');
  if (!INTERNAL_API_SECRET || authHeader !== `Bearer ${INTERNAL_API_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const orderName = typeof body.orderName === 'string' ? body.orderName : undefined;
  const rawId = typeof body.shopifyOrderId === 'string' ? body.shopifyOrderId : undefined;
  const shopifyOrderId = rawId
    ? rawId.startsWith('gid://')
      ? rawId
      : `gid://shopify/Order/${rawId}`
    : undefined;
  console.log(`[liqpay/void] request: shopifyOrderId=${shopifyOrderId} orderName=${orderName}`);

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
    console.warn(`[liqpay/void] order not found in DB: shopifyOrderId=${shopifyOrderId} orderName=${orderName}`);
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const paymentInfo = order.user?.paymentInformation;
  const desc = paymentInfo?.description ?? '';
  console.log(`[liqpay/void] DB order found: ${order.orderName} (${order.shopifyOrderId}), paymentInfo desc=${desc}`);

  // ── Guard: already captured → void is not applicable ──────────────────────
  // Captured payments need a proper refund, not a hold cancel.
  if (desc.includes('captured')) {
    console.warn(`[liqpay/void] order ${order.orderName} was already captured — void skipped (use refund)`);
    return NextResponse.json({ message: 'Already captured, void skipped', orderName: order.orderName });
  }

  // ── Guard: capture in progress — do not void concurrently ─────────────────
  if (desc.includes('capturing')) {
    console.warn(`[liqpay/void] capture in progress for ${order.orderName} — void skipped to avoid race condition`);
    return NextResponse.json({ message: 'Capture in progress, void skipped', orderName: order.orderName });
  }

  // ── Idempotency guard ──────────────────────────────────────────────────────
  if (desc.includes('voided')) {
    console.log(`[liqpay/void] already voided for ${order.orderName}, skipping`);
    return NextResponse.json({ message: 'Already voided', orderName: order.orderName });
  }

  const numericOrderId = order.shopifyOrderId.split('/').pop()!;

  // ── Resolve amount ─────────────────────────────────────────────────────────
  let amount = paymentInfo?.amount;
  let currency = paymentInfo?.currency ?? 'UAH';

  if (!amount) {
    console.log(`[liqpay/void] no paymentInformation — fetching amount from Shopify order ${order.shopifyOrderId}`);
    const shopifyData = await adminClient.client.request<any, any>({
      query: GET_ORDER_AMOUNT_QUERY,
      variables: { id: order.shopifyOrderId },
    });
    const shopMoney = shopifyData?.order?.totalPriceSet?.shopMoney;
    if (!shopMoney?.amount) {
      console.error(`[liqpay/void] could not resolve amount for ${order.shopifyOrderId}`);
      return NextResponse.json({ error: 'Could not resolve order amount' }, { status: 404 });
    }
    amount = parseFloat(shopMoney.amount);
    currency = shopMoney.currencyCode ?? 'UAH';
  }

  // ── LiqPay refund (releases the hold) ─────────────────────────────────────
  console.log(`[liqpay/void] calling refund: order_id=${numericOrderId} amount=${amount} currency=${currency}`);
  const liqpay = new LiqPay(process.env.LIQPAY_PUBLIC_KEY!, process.env.LIQPAY_PRIVATE_KEY!);

  let liqpayResult: any;
  try {
    liqpayResult = await liqpay.api('request', {
      version: 3,
      action: 'refund',
      order_id: numericOrderId,
      amount: Math.round(amount * 100) / 100,
      currency,
      description: `Void hold for order ${order.orderName}`,
    });
    console.log(`[liqpay/void] refund response:`, JSON.stringify(liqpayResult));
  } catch (err) {
    console.error('[liqpay/void] refund failed:', err);
    return NextResponse.json({ error: 'LiqPay refund failed' }, { status: 500 });
  }

  // LiqPay returns HTTP 200 even on errors — check result/status fields
  if (liqpayResult?.result === 'error') {
    console.error(`[liqpay/void] LiqPay returned error for ${order.orderName}:`, liqpayResult);
    return NextResponse.json(
      { error: 'LiqPay refund error', liqpayStatus: liqpayResult?.status },
      { status: 502 },
    );
  }

  // ── Update DB ──────────────────────────────────────────────────────────────
  if (paymentInfo) {
    await prisma.paymentInformation.update({
      where: { id: paymentInfo.id },
      data: {
        description: `voided: liqpayPaymentId=${liqpayResult?.payment_id ?? liqpayResult?.transaction_id}, status=${liqpayResult?.status}`,
      },
    }).catch((err) => console.error('[liqpay/void] failed to update DB status:', err));
    console.log(`[liqpay/void] DB marked as "voided" for ${order.orderName}`);
  }

  console.log(`[liqpay/void] done: ${order.orderName}`);
  return NextResponse.json({ message: 'Voided', orderName: order.orderName });
}
