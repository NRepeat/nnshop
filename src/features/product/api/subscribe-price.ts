'use server';

import { PRICE_APP_URL } from '@shared/config/shop';

export async function subscribeToPriceChanges({
  email,
  shopifyProductId,
}: {
  email: string;
  shopifyProductId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${PRICE_APP_URL}/api/price-subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        shopifyProductId,
        subscriptionType: 'ANY_CHANGE',
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data?.error ?? 'Failed to subscribe' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Network error' };
  }
}
