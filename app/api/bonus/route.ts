import { prisma } from '@shared/lib/prisma';
import { adminClient } from '@shared/lib/shopify/admin-client';
import { BonusMoveType } from '~/generated/prisma/enums';
import { NextRequest, NextResponse } from 'next/server';
import {
  accrueBonusForOrder,
  computeEligibleSpend,
  EPS,
  round2,
  SHOPIFY_ORDER_QUERY,
  SPEND_LIMIT_RATIO,
  type ShopifyOrderForBonus,
} from '@features/bonus/lib/accrue';

export async function POST(req: NextRequest) {
  let body: {
    orderId?: string;
    bonusMoveDirection?: BonusMoveType;
    amount?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { orderId, bonusMoveDirection, amount: requestedSpend } = body;

  if (!orderId) {
    return NextResponse.json({ error: 'orderId required' }, { status: 400 });
  }
  if (
    bonusMoveDirection !== BonusMoveType.ACCRUAL &&
    bonusMoveDirection !== BonusMoveType.SPEND
  ) {
    return NextResponse.json(
      { error: 'bonusMoveDirection must be ACCRUAL or SPEND' },
      { status: 400 },
    );
  }

  if (bonusMoveDirection === BonusMoveType.ACCRUAL) {
    const result = await accrueBonusForOrder(orderId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    if (result.status === 'already_processed') {
      return NextResponse.json({
        message: 'already processed',
        movementId: result.movementId,
        amount: result.amount,
      });
    }
    if (result.status === 'no_eligible_items') {
      return NextResponse.json({
        message: 'no eligible items for accrual',
        accrual: 0,
      });
    }
    return NextResponse.json({
      message: 'accrued',
      movementId: result.movementId,
      accrual: result.accrual,
      balance: result.balance,
    });
  }

  // SPEND
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        include: {
          loyaltyCards: { orderBy: { lastAccrualDate: 'desc' } },
          contactInformation: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'order not found' }, { status: 404 });
  }
  if (order.draft) {
    return NextResponse.json({ error: 'order is draft' }, { status: 409 });
  }
  if (!order.shopifyOrderId) {
    return NextResponse.json(
      { error: 'order has no shopify id' },
      { status: 409 },
    );
  }

  const phone = order.user.contactInformation?.phone;
  const card =
    (phone && order.user.loyaltyCards.find((c) => c.phone === phone)) ||
    order.user.loyaltyCards[0];
  if (!card) {
    return NextResponse.json(
      { error: 'no loyalty card for user' },
      { status: 409 },
    );
  }

  const { order: shopifyOrder } = await adminClient.client.request<
    ShopifyOrderForBonus,
    { id: string }
  >({
    query: SHOPIFY_ORDER_QUERY,
    variables: { id: order.shopifyOrderId },
  });

  if (!shopifyOrder) {
    return NextResponse.json(
      { error: 'shopify order not found' },
      { status: 404 },
    );
  }

  const movementId = `${order.id}:${BonusMoveType.SPEND}`;
  const existing = await prisma.bonusMovements.findUnique({
    where: { id: movementId },
  });
  if (existing) {
    return NextResponse.json({
      message: 'already processed',
      movementId,
      amount: existing.amount,
    });
  }

  const eligibleAmount = computeEligibleSpend(shopifyOrder);
  const spend = round2(Number(requestedSpend ?? 0));
  if (!(spend > 0)) {
    return NextResponse.json(
      { error: 'amount required and must be > 0 for SPEND' },
      { status: 400 },
    );
  }
  if (spend > card.bonusBalance + EPS) {
    return NextResponse.json(
      { error: 'insufficient balance', balance: card.bonusBalance },
      { status: 409 },
    );
  }
  if (spend > card.bonusBalance * SPEND_LIMIT_RATIO + EPS) {
    return NextResponse.json(
      {
        error: 'spend exceeds 50% of available balance',
        max: round2(card.bonusBalance * SPEND_LIMIT_RATIO),
        balance: card.bonusBalance,
      },
      { status: 409 },
    );
  }
  if (spend > eligibleAmount + EPS) {
    return NextResponse.json(
      {
        error: 'spend exceeds eligible items total',
        eligible: eligibleAmount,
      },
      { status: 409 },
    );
  }

  const now = new Date();
  const [, updatedCard] = await prisma.$transaction([
    prisma.bonusMovements.create({
      data: {
        id: movementId,
        loyaltyCardId: card.id,
        date: now,
        type: BonusMoveType.SPEND,
        amount: spend,
      },
    }),
    prisma.loyaltyCards.update({
      where: { id: card.id },
      data: { bonusBalance: { decrement: spend } },
    }),
  ]);

  return NextResponse.json({
    message: 'spent',
    movementId,
    spent: spend,
    balance: updatedCard.bonusBalance,
  });
}
