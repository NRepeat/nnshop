import { prisma } from '@shared/lib/prisma';
import { adminClient } from '@shared/lib/shopify/admin-client';
import { BonusMoveType } from '~/generated/prisma/enums';

/**
 * Loyalty rules:
 *  - 1 bonus = 1 UAH
 *  - Accrual: 5% of items at full price OR with discount <= 40%
 *  - Items with discount > 40%: ineligible for accrual AND for spend
 *  - Spend per purchase <= 50% of current balance
 *  - Bonuses expire 1 year after accrual
 */
export const ACCRUAL_RATE = 0.05;
export const MAX_DISCOUNT_PCT = 0.4;
export const SPEND_LIMIT_RATIO = 0.5;
export const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
export const EPS = 1e-9;

export const SHOPIFY_ORDER_QUERY = /* GraphQL */ `
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

export interface ShopifyOrderForBonus {
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

export const round2 = (n: number) => Math.round(n * 100) / 100;

export function computeEligibleSpend(
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

export type AccrueResult =
  | { ok: true; status: 'accrued'; movementId: string; accrual: number; balance: number }
  | { ok: true; status: 'already_processed'; movementId: string; amount: number }
  | { ok: true; status: 'no_eligible_items'; accrual: 0 }
  | { ok: false; status: number; error: string };

/**
 * Run loyalty bonus accrual for an order. Idempotent via deterministic movementId.
 * Returns structured result; callers map to HTTP status as needed.
 */
export async function accrueBonusForOrder(orderId: string): Promise<AccrueResult> {
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
    return { ok: false, status: 404, error: 'order not found' };
  }
  if (order.draft) {
    return { ok: false, status: 409, error: 'order is draft' };
  }
  if (!order.shopifyOrderId) {
    return { ok: false, status: 409, error: 'order has no shopify id' };
  }

  const phone = order.user.contactInformation?.phone;
  const card =
    (phone && order.user.loyaltyCards.find((c) => c.phone === phone)) ||
    order.user.loyaltyCards[0];
  if (!card) {
    return { ok: false, status: 409, error: 'no loyalty card for user' };
  }

  const { order: shopifyOrder } = await adminClient.client.request<
    ShopifyOrderForBonus,
    { id: string }
  >({
    query: SHOPIFY_ORDER_QUERY,
    variables: { id: order.shopifyOrderId },
  });

  if (!shopifyOrder) {
    return { ok: false, status: 404, error: 'shopify order not found' };
  }

  if (shopifyOrder.displayFinancialStatus !== 'PAID') {
    return {
      ok: false,
      status: 409,
      error: `order not paid (status=${shopifyOrder.displayFinancialStatus})`,
    };
  }

  const movementId = `${order.id}:${BonusMoveType.ACCRUAL}`;
  const existing = await prisma.bonusMovements.findUnique({
    where: { id: movementId },
  });
  if (existing) {
    return {
      ok: true,
      status: 'already_processed',
      movementId,
      amount: existing.amount,
    };
  }

  const eligibleAmount = computeEligibleSpend(shopifyOrder);
  const accrual = round2(eligibleAmount * ACCRUAL_RATE);
  if (!(accrual > 0)) {
    return { ok: true, status: 'no_eligible_items', accrual: 0 };
  }

  const now = new Date();
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

  return {
    ok: true,
    status: 'accrued',
    movementId,
    accrual,
    balance: updatedCard.bonusBalance,
  };
}
