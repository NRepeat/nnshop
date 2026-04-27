import { createPayParts } from '@entities/payparts/model';
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

/**
 * POST /api/payparts/capture
 *
 * Confirms a held PayParts payment (two-stage: LOCKED → confirm → SUCCESS).
 * Called by keyCRM after order confirmation.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (INTERNAL_API_SECRET && authHeader !== `Bearer ${INTERNAL_API_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { orderName } = body;
  const rawId: string | undefined = body.shopifyOrderId;
  const shopifyOrderId = rawId
    ? rawId.startsWith('gid://')
      ? rawId
      : `gid://shopify/Order/${rawId}`
    : undefined;
  console.log(
    `[payparts/capture] request: shopifyOrderId=${shopifyOrderId} orderName=${orderName}`,
  );

  if (!orderName && !shopifyOrderId) {
    return NextResponse.json(
      { error: 'Missing orderName or shopifyOrderId' },
      { status: 400 },
    );
  }

  const order = await prisma.order.findFirst({
    where: shopifyOrderId
      ? { shopifyOrderId }
      : { orderName: { contains: orderName } },
    include: { user: { include: { paymentInformation: true } } },
  });

  if (!order?.shopifyOrderId) {
    console.warn(
      `[payparts/capture] order not found: shopifyOrderId=${shopifyOrderId} orderName=${orderName}`,
    );
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const paymentInfo = order.user?.paymentInformation;
  const desc = paymentInfo?.description ?? '';
  console.log(
    `[payparts/capture] DB order: ${order.orderName} (${order.shopifyOrderId}), desc=${desc}`,
  );

  // ── Idempotency guards ──────────────────────────────────────────────────
  if (desc.includes('captured') || desc.includes('PayParts paid')) {
    console.log(
      `[payparts/capture] already captured for ${order.orderName}, skipping`,
    );
    return NextResponse.json({
      message: 'Already captured',
      orderName: order.orderName,
    });
  }
  if (desc.includes('capturing')) {
    console.warn(
      `[payparts/capture] capture already in progress for ${order.orderName}, skipping`,
    );
    return NextResponse.json({
      message: 'Capture in progress',
      orderName: order.orderName,
    });
  }

  // ── Soft lock ───────────────────────────────────────────────────────────
  if (paymentInfo) {
    await prisma.paymentInformation.update({
      where: { id: paymentInfo.id },
      data: { description: `capturing: ${new Date().toISOString()}` },
    });
    console.log(
      `[payparts/capture] DB marked as "capturing" for ${order.orderName}`,
    );
  }

  const numericOrderId = order.shopifyOrderId!.split('/').pop()!;

  // ── PayParts confirm ────────────────────────────────────────────────────
  const payparts = createPayParts();
  try {
    const result = await payparts.confirmPayment(numericOrderId);
    console.log(`[payparts/capture] confirm result:`, JSON.stringify(result));
  } catch (err) {
    console.error('[payparts/capture] confirmPayment failed:', err);
    if (paymentInfo) {
      await prisma.paymentInformation
        .update({
          where: { id: paymentInfo.id },
          data: {
            description: `capture_failed: ${err instanceof Error ? err.message : String(err)} (${new Date().toISOString()})`,
          },
        })
        .catch(() => {});
    }
    return NextResponse.json(
      { error: 'PayParts confirm failed' },
      { status: 500 },
    );
  }

  // ── Mark as captured in DB ──────────────────────────────────────────────
  if (paymentInfo) {
    await prisma.paymentInformation
      .update({
        where: { id: paymentInfo.id },
        data: { description: `captured: orderId=${numericOrderId}` },
      })
      .catch((err) =>
        console.error('[payparts/capture] failed to update DB status:', err),
      );
    console.log(
      `[payparts/capture] DB marked as "captured" for ${order.orderName}`,
    );
  }

  // ── Mark as paid in Shopify ─────────────────────────────────────────────
  try {
    const result = await adminClient.client.request<any, any>({
      query: ORDER_MARK_AS_PAID_MUTATION,
      variables: { input: { id: order.shopifyOrderId } },
    });
    const errors = result?.orderMarkAsPaid?.userErrors ?? [];
    if (errors.length > 0) {
      const msg = errors.map((e: any) => e.message).join(', ');
      if (!msg.includes('already') && !msg.includes('cannot be marked')) {
        console.error(`[payparts/capture] orderMarkAsPaid errors: ${msg}`);
      }
    } else {
      console.log(
        `[payparts/capture] Shopify order ${order.shopifyOrderId} marked as paid`,
      );
    }
  } catch (err) {
    console.error('[payparts/capture] orderMarkAsPaid failed:', err);
  }

  // ── Confirm in keyCRM (fire-and-forget) ─────────────────────────────────
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (INTERNAL_API_SECRET)
      headers['Authorization'] = `Bearer ${INTERNAL_API_SECRET}`;
    fetch(`${PRICE_APP_URL}/api/internal/confirm-payment`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        orderName: order.orderName,
        amount: paymentInfo?.amount,
        currency: paymentInfo?.currency ?? 'UAH',
        paymentMethod: 'payparts',
      }),
    })
      .then((r) =>
        console.log(`[payparts/capture] confirm-payment response: ${r.status}`),
      )
      .catch((err) =>
        console.error('[payparts/capture] confirm-payment failed:', err),
      );
  } catch {}

  console.log(`[payparts/capture] done: ${order.orderName}`);
  return NextResponse.json({ message: 'Captured', orderName: order.orderName });
}
