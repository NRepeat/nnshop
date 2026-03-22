'use client';

import { useEffect } from 'react';

interface GA4ViewItemEventProps {
  itemId: string;
  itemName: string;
  price: number;
  currency: string;
  itemBrand?: string;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Fires a GA4 `view_item` event once per product page view.
 */
export function GA4ViewItemEvent({
  itemId,
  itemName,
  price,
  currency,
  itemBrand,
}: GA4ViewItemEventProps) {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag('event', 'view_item', {
      currency,
      value: price,
      items: [
        {
          item_id: itemId,
          item_name: itemName,
          item_brand: itemBrand,
          price,
        },
      ],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  return null;
}
