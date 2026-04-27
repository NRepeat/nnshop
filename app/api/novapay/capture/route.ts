import { createNovaPay } from '@entities/novapay/model';
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
 * POST /api/novapay/capture
 *
 * Complete a NovaPay hold — charge previously blocked funds.
 * Called by itali-shop-app after CRM order confirmation, or auto-triggered
 * from the callback when capture_pending is detected.
 *
 * Requires INTERNAL_API_SECRET bearer token.
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
    `[novapay/capture] request: shopifyOrderId=${shopifyOrderId} orderName=${orderName}`,
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
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const paymentInfo = order.user?.paymentInformation;
  const desc = paymentInfo?.description ?? '';
  console.log(`[novapay/capture] order: ${order.orderName}, desc=${desc}`);

  // Must be a NovaPay payment
  if (!desc.includes('NovaPay')) {
    return NextResponse.json({ error: 'Not a NovaPay order' }, { status: 400 });
  }

  // Idempotency guards
  if (desc.includes('paid') || desc.includes('captured')) {
    return NextResponse.json({
      message: 'Already captured',
      orderName: order.orderName,
    });
  }
  if (desc.includes('capturing')) {
    return NextResponse.json({
      message: 'Capture in progress',
      orderName: order.orderName,
    });
  }

  // Extract session ID from description: "NovaPay holded: session=xxx" or "NovaPay session: xxx"
  const sessionMatch = desc.match(/session[=:]?\s*([a-f0-9-]+)/i);
  if (!sessionMatch) {
    console.error(`[novapay/capture] cannot extract session ID from: ${desc}`);
    return NextResponse.json(
      { error: 'Session ID not found' },
      { status: 400 },
    );
  }
  const sessionId = sessionMatch[1];

  // If not yet in holded state, mark as capture_pending
  if (!desc.includes('holded')) {
    console.log(
      `[novapay/capture] not yet holded for ${order.orderName} — marking capture_pending`,
    );
    if (paymentInfo) {
      await prisma.paymentInformation.update({
        where: { id: paymentInfo.id },
        data: {
          description: `capture_pending: ${new Date().toISOString()} session=${sessionId}`,
        },
      });
    }
    return NextResponse.json(
      {
        status: 'pending',
        message: 'Payment not yet holded, marked capture_pending',
      },
      { status: 202 },
    );
  }

  // Soft lock
  if (paymentInfo) {
    await prisma.paymentInformation.update({
      where: { id: paymentInfo.id },
      data: {
        description: `NovaPay capturing: ${new Date().toISOString()} session=${sessionId}`,
      },
    });
  }

  // Call NovaPay complete-hold
  try {
    const novapay = createNovaPay();
    const amount = paymentInfo?.amount
      ? Math.round(paymentInfo.amount * 100) / 100
      : undefined;
    await novapay.completeHold(sessionId, amount);
    console.log(
      `[novapay/capture] complete-hold success for session=${sessionId}`,
    );
  } catch (err) {
    console.error('[novapay/capture] complete-hold failed:', err);
    if (paymentInfo) {
      await prisma.paymentInformation
        .update({
          where: { id: paymentInfo.id },
          data: {
            description: `NovaPay capture_failed: ${err} session=${sessionId}`,
          },
        })
        .catch(() => {});
    }
    return NextResponse.json(
      { error: 'NovaPay complete-hold failed' },
      { status: 500 },
    );
  }

  // Update DB
  if (paymentInfo) {
    await prisma.paymentInformation
      .update({
        where: { id: paymentInfo.id },
        data: { description: `NovaPay captured: session=${sessionId}` },
      })
      .catch((err) =>
        console.error('[novapay/capture] DB update failed:', err),
      );
  }

  // Mark as paid in Shopify
  try {
    const result = await adminClient.client.request<any, any>({
      query: ORDER_MARK_AS_PAID_MUTATION,
      variables: { input: { id: order.shopifyOrderId } },
    });
    const errors = result?.orderMarkAsPaid?.userErrors ?? [];
    if (errors.length > 0) {
      const msg = errors.map((e: any) => e.message).join(', ');
      if (!msg.includes('already') && !msg.includes('cannot be marked')) {
        console.error(`[novapay/capture] orderMarkAsPaid errors: ${msg}`);
      }
    } else {
      console.log(
        `[novapay/capture] Shopify order marked as paid: ${order.shopifyOrderId}`,
      );
    }
  } catch (err) {
    console.error('[novapay/capture] orderMarkAsPaid failed:', err);
  }

  // Confirm in keyCRM + eSputnik (fire-and-forget)
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
        paymentMethod: 'novapay',
      }),
    }).catch((err) =>
      console.error('[novapay/capture] confirm-payment failed:', err),
    );
  } catch {}

  return NextResponse.json({ message: 'Captured', orderName: order.orderName });
}
