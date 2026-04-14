import { createPayParts } from '@entities/payparts/model';
import { prisma } from '@shared/lib/prisma';
import { INTERNAL_API_SECRET } from '@shared/config/shop';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/payparts/void
 *
 * Cancels a held PayParts payment (releases the hold without capture).
 * Called by keyCRM when customer cancels or order cannot be fulfilled.
 */
export async function POST(request: NextRequest) {
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
  console.log(`[payparts/void] request: shopifyOrderId=${shopifyOrderId} orderName=${orderName}`);

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
    console.warn(`[payparts/void] order not found: shopifyOrderId=${shopifyOrderId} orderName=${orderName}`);
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const paymentInfo = order.user?.paymentInformation;
  const desc = paymentInfo?.description ?? '';
  console.log(`[payparts/void] DB order: ${order.orderName} (${order.shopifyOrderId}), desc=${desc}`);

  // ── Guards ──────────────────────────────────────────────────────────────
  if (desc.includes('captured') || desc.includes('PayParts paid')) {
    console.warn(`[payparts/void] order ${order.orderName} was already captured — void skipped`);
    return NextResponse.json({ message: 'Already captured, void skipped', orderName: order.orderName });
  }
  if (desc.includes('capturing')) {
    console.warn(`[payparts/void] capture in progress for ${order.orderName} — void skipped`);
    return NextResponse.json({ message: 'Capture in progress, void skipped', orderName: order.orderName });
  }
  if (desc.includes('voided') || desc.includes('canceled')) {
    console.log(`[payparts/void] already voided for ${order.orderName}, skipping`);
    return NextResponse.json({ message: 'Already voided', orderName: order.orderName });
  }

  const numericOrderId = order.shopifyOrderId!.split('/').pop()!;

  // ── PayParts cancel ─────────────────────────────────────────────────────
  const payparts = createPayParts();
  try {
    const result = await payparts.cancelPayment(numericOrderId);
    console.log(`[payparts/void] cancel result:`, JSON.stringify(result));
  } catch (err) {
    console.error('[payparts/void] cancelPayment failed:', err);
    return NextResponse.json({ error: 'PayParts cancel failed' }, { status: 500 });
  }

  // ── Update DB ───────────────────────────────────────────────────────────
  if (paymentInfo) {
    await prisma.paymentInformation.update({
      where: { id: paymentInfo.id },
      data: { description: `voided: orderId=${numericOrderId}` },
    }).catch((err) => console.error('[payparts/void] failed to update DB status:', err));
    console.log(`[payparts/void] DB marked as "voided" for ${order.orderName}`);
  }

  console.log(`[payparts/void] done: ${order.orderName}`);
  return NextResponse.json({ message: 'Voided', orderName: order.orderName });
}
