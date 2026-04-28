import { describe, it, expect } from 'vitest';
import {
  ACCRUAL_RATE,
  computeEligibleSpend,
  MAX_DISCOUNT_PCT,
  round2,
  type ShopifyOrderForBonus,
} from './accrue';

type LineItem = NonNullable<ShopifyOrderForBonus['order']>['lineItems']['edges'][number]['node'];

function line(original: number, discounted: number, quantity = 1): LineItem {
  return {
    quantity,
    originalUnitPriceSet: { shopMoney: { amount: original.toFixed(2) } },
    discountedUnitPriceSet: { shopMoney: { amount: discounted.toFixed(2) } },
  };
}

function makeOrder(...items: LineItem[]): NonNullable<ShopifyOrderForBonus['order']> {
  return {
    id: 'gid://shopify/Order/1',
    displayFinancialStatus: 'PAID',
    lineItems: { edges: items.map((node) => ({ node })) },
  };
}

describe('round2', () => {
  it('rounds to 2 decimals', () => {
    expect(round2(1.234)).toBe(1.23);
    expect(round2(1.236)).toBe(1.24);
    expect(round2(0)).toBe(0);
  });
});

describe('computeEligibleSpend', () => {
  it('returns 0 for empty order', () => {
    const o = makeOrder();
    expect(computeEligibleSpend(o)).toBe(0);
  });

  it('counts full-price items at discounted price', () => {
    const o = makeOrder(line(1000, 1000, 2));
    expect(computeEligibleSpend(o)).toBe(2000);
  });

  it('counts items with discount <= 40% threshold', () => {
    // 40% off — exactly at threshold, eligible
    const o = makeOrder(line(1000, 600, 1));
    expect(computeEligibleSpend(o)).toBe(600);
  });

  it('excludes items with discount > 40%', () => {
    // 50% off — ineligible
    const o = makeOrder(line(1000, 500, 1));
    expect(computeEligibleSpend(o)).toBe(0);
  });

  it('mixes eligible and ineligible items', () => {
    const o = makeOrder(
      line(1000, 1000, 1), // eligible: 1000
      line(1000, 500, 2),  // ineligible (50% off)
      line(500, 350, 1),   // 30% off, eligible: 350
    );
    expect(computeEligibleSpend(o)).toBe(1350);
  });

  it('skips items with zero original price', () => {
    const o = makeOrder(line(0, 0, 1));
    expect(computeEligibleSpend(o)).toBe(0);
  });

  it('respects quantity', () => {
    const o = makeOrder(line(100, 100, 5));
    expect(computeEligibleSpend(o)).toBe(500);
  });
});

describe('bonus rule constants', () => {
  it('accrual rate is 5%', () => {
    expect(ACCRUAL_RATE).toBe(0.05);
  });

  it('max discount eligible for accrual is 40%', () => {
    expect(MAX_DISCOUNT_PCT).toBe(0.4);
  });

  it('5% accrual on eligible amount, rounded', () => {
    // 1234 * 0.05 = 61.7
    expect(round2(1234 * ACCRUAL_RATE)).toBe(61.7);
  });
});
