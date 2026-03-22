import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@shared/lib/prisma';
import { trackServerPurchase } from '@shared/lib/analytics/server';
import { INTERNAL_API_SECRET } from '@shared/config/shop';

/**
 * POST /api/internal/ga4-purchase
 * Called from itali-shop-app when keyCRM status → DELIVERED (status 12).
 * Looks up gaClientId from User and fires GA4 Measurement Protocol purchase event.
 * Used for COD orders where revenue is confirmed at delivery, not at payment.
 */
export async function POST(req: NextRequest) {
  if (INTERNAL_API_SECRET) {
    const auth = req.headers.get('Authorization');
    if (auth !== `Bearer ${INTERNAL_API_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  let body: { orderName: string; amount: number; currency: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { orderName, amount, currency } = body;
  if (!orderName || !amount || !currency) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { orderName: { contains: orderName } },
    include: { user: { select: { id: true, gaClientId: true } } },
  });

  if (!order?.user?.gaClientId) {
    console.warn(`[ga4-purchase] no gaClientId for order ${orderName}`);
    return NextResponse.json({ ok: false, reason: 'no gaClientId' });
  }

  await trackServerPurchase({
    clientId: order.user.gaClientId,
    userId: order.user.id,
    transactionId: orderName,
    value: amount,
    currency,
  });

  console.log(`[ga4-purchase] purchase sent for ${orderName}, value: ${amount} ${currency}`);
  return NextResponse.json({ ok: true });
}
