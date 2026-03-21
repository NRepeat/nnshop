'use client';

import { useEffect } from 'react';
import { recordProductView } from '../api/record-view';
import { authClient } from '@features/auth/lib/auth-client';

type ViewTrackerProps = {
  productHandle: string;
  productId: string;
  productTitle?: string;
};

export const ViewTracker = ({ productHandle, productId, productTitle }: ViewTrackerProps) => {
  useEffect(() => {
    const track = async () => {
      const { data: session } = await authClient.getSession();
      if (!session?.user) {
        await authClient.signIn.anonymous();
      }

      recordProductView(productHandle, productId);
    };
    track();
  }, [productHandle, productId, productTitle]);

  return null;
};
