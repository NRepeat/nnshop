'use client';

import { useEffect } from 'react';
import { useCartUIStore } from '@shared/store/use-cart-ui-store';

interface GA4CartItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
}

interface GA4ViewCartEventProps {
  items: GA4CartItem[];
  value: number;
  currency: string;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function GA4ViewCartEvent({ items, value, currency }: GA4ViewCartEventProps) {
  const isOpen = useCartUIStore((s) => s.isOpen);

  useEffect(() => {
    if (!isOpen) return;
    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag('event', 'view_cart', {
      currency,
      value,
      items,
    });
  }, [isOpen]);

  return null;
}
