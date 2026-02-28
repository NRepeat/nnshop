'use client';

import { useEffect } from 'react';
import { recordProductView } from '../api/record-view';

type ViewTrackerProps = {
  productHandle: string;
  productId: string;
};

export const ViewTracker = ({ productHandle, productId }: ViewTrackerProps) => {
  useEffect(() => {
    recordProductView(productHandle, productId);
    // Fire-and-forget — no state update, no re-render
  }, [productHandle, productId]);

  return null;
};
