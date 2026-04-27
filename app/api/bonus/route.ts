import { prisma } from '@shared/lib/prisma';
import { adminClient } from '@shared/lib/shopify/admin-client';
import { BonusMoveType } from '~/generated/prisma/enums';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Loyalty rules:
 *  - 1 bonus = 1 UAH
 *  - Accrual: 5% of items at full price OR with discount <= 40%
 *  - Items with discount > 40%: ineligible for accrual AND for spend
 *  - Spend per purchase <= 50% of current balance
 *  - Bonuses expire 1 year after accrual
 */
const ACCRUAL_RATE = 0.05;
const MAX_DISCOUNT_PCT = 0.4;
const SPEND_LIMIT_RATIO = 0.5;
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const EPS = 1e-9;

const SHOPIFY_ORDER_QUERY = /* GraphQL */ `
  query GetOrderForBonus($id: ID!) {
    order(id: $id) {
      id
      displayFinancialStatus
      lineItems(first: 250) {
        edges {
          node {
            quantity
            originalUnitPriceSet {
              shopMoney {
                amount
              }
            }
            discountedUnitPriceSet {
              shopMoney {
                amount
              }
            }
          }
        }
      }
    }
  }
`;

interface ShopifyOrderForBonus {
  order: {
    id: string;
    displayFinancialStatus: string | null;
    lineItems: {
      edges: Array<{
        node: {
          quantity: number;
          originalUnitPriceSet: { shopMoney: { amount: string } };
          discountedUnitPriceSet: { shopMoney: { amount: string } };
        };
      }>;
    };
  } | null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function computeEligibleSpend(
  order: NonNullable<ShopifyOrderForBonus['order']>,
): number {
  let eligible = 0;
  for (const { node } of order.lineItems.edges) {
    const original = parseFloat(node.originalUnitPriceSet.shopMoney.amount);
    const discounted = parseFloat(node.discountedUnitPriceSet.shopMoney.amount);
    if (!(original > 0)) continue;
    const discountPct = (original - discounted) / original;
    if (discountPct > MAX_DISCOUNT_PCT + EPS) continue;
    eligible += discounted * node.quantity;
  }
  return round2(eligible);
}

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

  // ACCRUAL requires the order to be PAID.
  // SPEND can happen at order creation time (PENDING).
  if (
    bonusMoveDirection === BonusMoveType.ACCRUAL &&
    shopifyOrder.displayFinancialStatus !== 'PAID'
  ) {
    return NextResponse.json(
      {
        error: `order not paid (status=${shopifyOrder.displayFinancialStatus})`,
      },
      { status: 409 },
    );
  }

  // Idempotency: deterministic id keyed by order + direction
  const movementId = `${order.id}:${bonusMoveDirection}`;
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

  const now = new Date();
  const eligibleAmount = computeEligibleSpend(shopifyOrder);

  if (bonusMoveDirection === BonusMoveType.ACCRUAL) {
    const accrual = round2(eligibleAmount * ACCRUAL_RATE);
    if (!(accrual > 0)) {
      return NextResponse.json({
        message: 'no eligible items for accrual',
        accrual: 0,
      });
    }
    const expireBy = new Date(now.getTime() + ONE_YEAR_MS);

    const [, updatedCard] = await prisma.$transaction([
      prisma.bonusMovements.create({
        data: {
          id: movementId,
          loyaltyCardId: card.id,
          date: now,
          type: BonusMoveType.ACCRUAL,
          amount: accrual,
        },
      }),
      prisma.loyaltyCards.update({
        where: { id: card.id },
        data: {
          bonusBalance: { increment: accrual },
          lastAccrualDate: now,
          allExpireBy: expireBy,
        },
      }),
    ]);

    return NextResponse.json({
      message: 'accrued',
      movementId,
      accrual,
      balance: updatedCard.bonusBalance,
    });
  }

  // SPEND
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
