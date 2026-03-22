'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Fires a single GA4 event once when the component mounts.
 * Use for checkout step events: add_shipping_info, add_payment_info, etc.
 */
export function GA4EventOnMount({ event }: { event: string }) {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.gtag) return;
    window.gtag('event', event);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
