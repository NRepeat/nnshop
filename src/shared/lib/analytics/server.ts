const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID;
const GA4_API_SECRET = process.env.GA4_API_SECRET;

interface GA4Item {
  item_name: string;
  item_variant?: string;
  quantity: number;
  price: number;
}

/**
 * Server-side GA4 purchase event via Measurement Protocol.
 * Fires even if the user closes the tab or has an ad blocker.
 * Requires GA4_MEASUREMENT_ID and GA4_API_SECRET env vars.
 */
export async function trackServerPurchase({
  clientId,
  userId,
  transactionId,
  value,
  currency,
  items,
}: {
  clientId: string;
  userId?: string;
  transactionId: string;
  value: number;
  currency: string;
  items?: GA4Item[];
}) {
  if (!GA4_MEASUREMENT_ID || !GA4_API_SECRET) {
    console.warn('[GA4 MP] Missing GA4_MEASUREMENT_ID or GA4_API_SECRET — skipping');
    return;
  }

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`;

  const body = {
    client_id: clientId,
    ...(userId ? { user_id: userId } : {}),
    events: [
      {
        name: 'purchase',
        params: {
          transaction_id: transactionId,
          value,
          currency,
          ...(items?.length ? { items } : {}),
        },
      },
    ],
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error('[GA4 MP] purchase event failed:', res.status);
    }
  } catch (err) {
    console.error('[GA4 MP] purchase event error:', err);
  }
}
