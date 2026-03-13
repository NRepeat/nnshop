'use server';

const PRICE_APP_URL = process.env.PRICE_APP_URL ?? 'https://prod.nnninc.uk';

export async function subscribeToPriceChanges({
  email,
  shopifyProductId,
  shopifyVariantId,
}: {
  email: string;
  shopifyProductId: string;
  shopifyVariantId?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${PRICE_APP_URL}/api/price-subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        shopifyProductId,
        shopifyVariantId,
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
