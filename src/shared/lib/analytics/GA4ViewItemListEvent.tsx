'use client';

import { useEffect } from 'react';

interface GA4ListItem {
  item_id: string;
  item_name: string;
  price: number;
  item_brand?: string;
}

interface GA4ViewItemListEventProps {
  listId: string;
  listName: string;
  items: GA4ListItem[];
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Fires a GA4 `view_item_list` event once when a collection page renders.
 */
export function GA4ViewItemListEvent({
  listId,
  listName,
  items,
}: GA4ViewItemListEventProps) {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.gtag || items.length === 0) return;

    window.gtag('event', 'view_item_list', {
      item_list_id: listId,
      item_list_name: listName,
      items: items.map((item, index) => ({ ...item, index })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId]);

  return null;
}
