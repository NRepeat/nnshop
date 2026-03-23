import LiqPay from '@entities/liqpay/model';
import { prisma } from '@shared/lib/prisma';
import { adminClient } from '@shared/lib/shopify/admin-client';
import { PRICE_APP_URL, INTERNAL_API_SECRET } from '@shared/config/shop';
import { NextRequest, NextResponse } from 'next/server';

const GET_ORDER_AMOUNT_QUERY = `
  query getOrderAmount($id: ID!) {
    order(id: $id) {
      totalPriceSet { shopMoney { amount currencyCode } }
    }
  }
`;

const ORDER_MARK_AS_PAID_MUTATION = `
  mutation orderMarkAsPaid($input: OrderMarkAsPaidInput!) {
    orderMarkAsPaid(input: $input) {
      order { id }
      userErrors { field message }
    }
  }
`;

// Retry helper
async function retry<T>(
  fn: () => Promise<T>,
  attempts: number,
  delayMs: number,
  label: string,
): Promise<T> {
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      console.warn(`[liqpay/capture] ${label} attempt ${i}/${attempts} failed:`, err);
      if (i === attempts) throw err;
      await new Promise((r) => setTimeout(r, delayMs * i));
    }
  }
  throw new Error('unreachable');
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (INTERNAL_API_SECRET && authHeader !== `Bearer ${INTERNAL_API_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { orderName } = body;
  const rawId: string | undefined = body.shopifyOrderId;
  // Normalize: itali-shop-app stores numeric IDs, nnshop DB stores GIDs
  const shopifyOrderId = rawId
    ? rawId.startsWith('gid://')
      ? rawId
      : `gid://shopify/Order/${rawId}`
    : undefined;
  console.log(`[liqpay/capture] request: shopifyOrderId=${shopifyOrderId} orderName=${orderName}`);

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
    console.warn(`[liqpay/capture] order not found in DB: shopifyOrderId=${shopifyOrderId} orderName=${orderName}`);
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const paymentInfo = order.user?.paymentInformation;
  console.log(`[liqpay/capture] DB order found: ${order.orderName} (${order.shopifyOrderId}), paymentInfo=${JSON.stringify(paymentInfo ?? null)}`);

  // ── Idempotency guard ─────────────────────────────────────────────────────
  // Prevent double capture if keyCRM webhook fires twice or callback races with capture
  if (paymentInfo?.description?.includes('captured')) {
    console.log(`[liqpay/capture] already captured for ${order.orderName}, skipping`);
    return NextResponse.json({ message: 'Already captured', orderName: order.orderName });
  }
  if (paymentInfo?.description?.includes('capturing')) {
    console.warn(`[liqpay/capture] capture already in progress for ${order.orderName}, skipping`);
    return NextResponse.json({ message: 'Capture in progress', orderName: order.orderName });
  }

  // ── Mark as "capturing" in DB before calling LiqPay (soft lock) ──────────
  if (paymentInfo) {
    await prisma.paymentInformation.update({
      where: { id: paymentInfo.id },
      data: { description: `capturing: ${new Date().toISOString()}` },
    });
    console.log(`[liqpay/capture] DB marked as "capturing" for ${order.orderName}`);
  }

  const numericOrderId = order.shopifyOrderId!.split('/').pop()!;

  // ── Resolve amount ────────────────────────────────────────────────────────
  let amount = paymentInfo?.amount;
  let currency = paymentInfo?.currency ?? 'UAH';

  if (!amount) {
    console.log(`[liqpay/capture] no paymentInformation — fetching amount from Shopify order ${order.shopifyOrderId}`);
    const shopifyData = await adminClient.client.request<any, any>({
      query: GET_ORDER_AMOUNT_QUERY,
      variables: { id: order.shopifyOrderId },
    });
    const shopMoney = shopifyData?.order?.totalPriceSet?.shopMoney;
    console.log(`[liqpay/capture] Shopify totalPriceSet:`, shopMoney);
    if (!shopMoney?.amount) {
      console.error(`[liqpay/capture] could not resolve amount for ${order.shopifyOrderId}`);
      return NextResponse.json({ error: 'Could not resolve order amount' }, { status: 404 });
    }
    amount = parseFloat(shopMoney.amount);
    currency = shopMoney.currencyCode ?? 'UAH';
  }

  // ── LiqPay hold_completion ────────────────────────────────────────────────
  console.log(`[liqpay/capture] calling hold_completion: order_id=${numericOrderId} amount=${amount} currency=${currency}`);
  const liqpay = new LiqPay(process.env.LIQPAY_PUBLIC_KEY!, process.env.LIQPAY_PRIVATE_KEY!);

  let liqpayResult: any;
  try {
    liqpayResult = await retry(
      () => liqpay.api('request', {
        version: 3,
        action: 'hold_completion',
        order_id: numericOrderId,
        amount: Math.round(amount! * 100) / 100,
        currency,
        description: `Capture order ${order.orderName}`,
      }),
      3,
      500,
      'hold_completion',
    );
    console.log(`[liqpay/capture] hold_completion response:`, JSON.stringify(liqpayResult));

    // LiqPay returned an error result (e.g. payment not yet in hold_wait state)
    if (liqpayResult?.result === 'error') {
      console.warn(`[liqpay/capture] hold_completion error for ${order.orderName}: ${liqpayResult.err_description}`);
      if (paymentInfo) {
        await prisma.paymentInformation.update({
          where: { id: paymentInfo.id },
          data: { description: `capture_failed: ${liqpayResult.err_description} (${new Date().toISOString()})` },
        }).catch(() => {});
      }
      return NextResponse.json(
        { error: 'LiqPay hold_completion error', detail: liqpayResult.err_description },
        { status: 422 },
      );
    }
  } catch (err) {
    console.error('[liqpay/capture] hold_completion failed after retries:', err);
    // Reset soft lock so it can be retried manually
    if (paymentInfo) {
      await prisma.paymentInformation.update({
        where: { id: paymentInfo.id },
        data: { description: `capture_failed: ${new Date().toISOString()}` },
      }).catch(() => {});
    }
    return NextResponse.json({ error: 'LiqPay hold_completion failed' }, { status: 500 });
  }

  // ── Mark as captured in DB ────────────────────────────────────────────────
  if (paymentInfo) {
    await prisma.paymentInformation.update({
      where: { id: paymentInfo.id },
      data: {
        description: `captured: liqpayPaymentId=${liqpayResult?.payment_id ?? liqpayResult?.transaction_id}, status=${liqpayResult?.status}`,
      },
    }).catch((err) => console.error('[liqpay/capture] failed to update DB status:', err));
    console.log(`[liqpay/capture] DB marked as "captured" for ${order.orderName}`);
  }

  // ── Mark as paid in Shopify (retry x3) ───────────────────────────────────
  try {
    await retry(async () => {
      const result = await adminClient.client.request<any, any>({
        query: ORDER_MARK_AS_PAID_MUTATION,
        variables: { input: { id: order.shopifyOrderId } },
      });
      const errors = result?.orderMarkAsPaid?.userErrors ?? [];
      if (errors.length > 0) {
        const msg = errors.map((e: any) => e.message).join(', ');
        // "already paid" is not an error — treat as success
        if (msg.includes('already') || msg.includes('cannot be marked')) {
          console.warn(`[liqpay/capture] orderMarkAsPaid skipped (${msg})`);
          return;
        }
        throw new Error(msg);
      }
      console.log(`[liqpay/capture] Shopify order ${order.shopifyOrderId} marked as paid`);
    }, 3, 1000, 'orderMarkAsPaid');
  } catch (err) {
    console.error('[liqpay/capture] orderMarkAsPaid failed after retries:', err);
    // Non-blocking — LiqPay capture succeeded, continue
  }

  // ── Confirm in keyCRM + eSputnik (fire-and-forget) ───────────────────────
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (INTERNAL_API_SECRET) headers['Authorization'] = `Bearer ${INTERNAL_API_SECRET}`;
    const confirmPayload = { orderName: order.orderName, amount, currency, paymentMethod: 'liqpay' };
    console.log(`[liqpay/capture] firing confirm-payment to ${PRICE_APP_URL}:`, confirmPayload);
    fetch(`${PRICE_APP_URL}/api/internal/confirm-payment`, {
      method: 'POST',
      headers,
      body: JSON.stringify(confirmPayload),
    })
      .then((r) => console.log(`[liqpay/capture] confirm-payment response: ${r.status}`))
      .catch((err) => console.error('[liqpay/capture] confirm-payment failed:', err));
  } catch {}

  console.log(`[liqpay/capture] done: ${order.orderName}`);
  return NextResponse.json({ message: 'Captured', orderName: order.orderName });
}
