'use client';

import { useEffect } from 'react';

interface GA4Item {
  item_name: string;
  item_variant?: string;
  quantity: number;
  price: number;
}

interface GA4PurchaseEventProps {
  transactionId: string;
  value: number;
  currency: string;
  items: GA4Item[];
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Fires a GA4 `purchase` event once per order.
 * Deduplication via sessionStorage prevents double-firing on re-renders or
 * page refreshes within the same browser tab.
 */
export function GA4PurchaseEvent({
  transactionId,
  value,
  currency,
  items,
}: GA4PurchaseEventProps) {
  useEffect(() => {
    if (!transactionId || !value) return;

    const dedupKey = `ga4_purchase_${transactionId}`;
    if (sessionStorage.getItem(dedupKey)) return;

    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value,
      currency,
      items,
    });

    // Google Ads conversion tracking
    window.gtag('event', 'conversion', {
      send_to: 'AW-18024337537/TJVzCOvA4YocEIGh1pJD',
      value,
      currency,
      transaction_id: transactionId,
    });

    sessionStorage.setItem(dedupKey, '1');
  }, [transactionId, value, currency, items]);

  return null;
}
