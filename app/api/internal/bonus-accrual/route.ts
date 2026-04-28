import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@shared/lib/prisma';
import { INTERNAL_API_SECRET } from '@shared/config/shop';
import { accrueBonusForOrder } from '@features/bonus/lib/accrue';

/**
 * POST /api/internal/bonus-accrual
 * Called from itali-shop-app when keyCRM status → "Виконано" (status 12 / DELIVERED).
 * Looks up Order by orderName (or shopifyOrderId), runs idempotent ACCRUAL.
 */
export async function POST(req: NextRequest) {
  if (INTERNAL_API_SECRET) {
    const auth = req.headers.get('Authorization');
    if (auth !== `Bearer ${INTERNAL_API_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  let body: { orderName?: string; shopifyOrderId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { orderName, shopifyOrderId } = body;
  if (!orderName && !shopifyOrderId) {
    return NextResponse.json(
      { error: 'orderName or shopifyOrderId required' },
      { status: 400 },
    );
  }

  const shopifyGid = shopifyOrderId
    ? shopifyOrderId.startsWith('gid://')
      ? shopifyOrderId
      : `gid://shopify/Order/${shopifyOrderId}`
    : null;

  const order = await prisma.order.findFirst({
    where: shopifyGid
      ? { shopifyOrderId: shopifyGid }
      : { orderName: { contains: orderName! } },
    select: { id: true },
  });

  if (!order) {
    console.warn(
      `[bonus-accrual] order not found (orderName=${orderName ?? '-'}, shopifyOrderId=${shopifyOrderId ?? '-'})`,
    );
    return NextResponse.json({ ok: false, reason: 'order not found' }, { status: 404 });
  }

  const result = await accrueBonusForOrder(order.id);

  if (!result.ok) {
    console.warn(`[bonus-accrual] order ${order.id}: ${result.error}`);
    return NextResponse.json(
      { ok: false, reason: result.error },
      { status: result.status },
    );
  }

  console.log(`[bonus-accrual] order ${order.id}: ${result.status}`);
  return NextResponse.json(result);
}
