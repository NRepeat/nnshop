import { createNovaPay } from '@entities/novapay/model';
import { prisma } from '@shared/lib/prisma';
import { INTERNAL_API_SECRET } from '@shared/config/shop';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/novapay/void
 *
 * Void a NovaPay session — cancel or refund blocked funds.
 * Requires INTERNAL_API_SECRET bearer token.
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
    ? rawId.startsWith('gid://') ? rawId : `gid://shopify/Order/${rawId}`
    : undefined;
  console.log(`[novapay/void] request: shopifyOrderId=${shopifyOrderId} orderName=${orderName}`);

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

  const paymentInfo = order.user?.paymentInformation;
  const desc = paymentInfo?.description ?? '';
  console.log(`[novapay/void] order: ${order.orderName}, desc=${desc}`);

  if (!desc.includes('NovaPay')) {
    return NextResponse.json({ error: 'Not a NovaPay order' }, { status: 400 });
  }

  // Guards
  if (desc.includes('captured') || desc.includes('paid')) {
    return NextResponse.json({ message: 'Already captured, void skipped (use refund)', orderName: order.orderName });
  }
  if (desc.includes('capturing')) {
    return NextResponse.json({ message: 'Capture in progress, void skipped', orderName: order.orderName });
  }
  if (desc.includes('voided')) {
    return NextResponse.json({ message: 'Already voided', orderName: order.orderName });
  }

  // Extract session ID
  const sessionMatch = desc.match(/session[=:]?\s*([a-f0-9-]+)/i);
  if (!sessionMatch) {
    return NextResponse.json({ error: 'Session ID not found in payment description' }, { status: 400 });
  }
  const sessionId = sessionMatch[1];

  // Call NovaPay void
  try {
    const novapay = createNovaPay();
    await novapay.voidSession(sessionId);
    console.log(`[novapay/void] void success for session=${sessionId}`);
  } catch (err) {
    console.error('[novapay/void] void failed:', err);
    return NextResponse.json({ error: 'NovaPay void failed' }, { status: 500 });
  }

  // Update DB
  if (paymentInfo) {
    await prisma.paymentInformation.update({
      where: { id: paymentInfo.id },
      data: { description: `NovaPay voided: session=${sessionId}` },
    }).catch((err) => console.error('[novapay/void] DB update failed:', err));
  }

  console.log(`[novapay/void] done: ${order.orderName}`);
  return NextResponse.json({ message: 'Voided', orderName: order.orderName });
}
