'use client';

import { useEffect } from 'react';
import { recordView } from '../lib/storage';

type ViewTrackerProps = {
  productHandle: string;
  productId: string;
  productTitle?: string;
};

export const ViewTracker = ({ productHandle, productId }: ViewTrackerProps) => {
  useEffect(() => {
    recordView(productId, productHandle);
  }, [productHandle, productId]);

  return null;
};
