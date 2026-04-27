export async function triggerBonus(orderId: string, direction: 'ACCRUAL' | 'SPEND', amount?: number) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  try {
    const response = await fetch(`${siteUrl}/api/bonus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        bonusMoveDirection: direction,
        amount,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`[triggerBonus] failed: ${direction} for order ${orderId}`, error);
      return { success: false, error };
    }

    const result = await response.json();
    console.log(`[triggerBonus] success: ${direction} for order ${orderId}`, result);
    return { success: true, data: result };
  } catch (err) {
    console.error(`[triggerBonus] unexpected error: ${direction} for order ${orderId}`, err);
    return { success: false, error: err };
  }
}
