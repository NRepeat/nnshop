'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Fires a GA4 `begin_checkout` event once when the checkout info page mounts.
 */
export function GA4BeginCheckoutEvent() {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.gtag) return;
    window.gtag('event', 'begin_checkout');
  }, []);

  return null;
}
