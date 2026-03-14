'use client';

import { useEffect } from 'react';
import { recordProductView } from '../api/record-view';
import { authClient } from '@features/auth/lib/auth-client';
import { usePostHog } from 'posthog-js/react';

type ViewTrackerProps = {
  productHandle: string;
  productId: string;
  productTitle?: string;
};

export const ViewTracker = ({ productHandle, productId, productTitle }: ViewTrackerProps) => {
  const posthog = usePostHog();

  useEffect(() => {
    const track = async () => {
      const { data: session } = await authClient.getSession();
      if (!session?.user) {
        await authClient.signIn.anonymous();
      }

      recordProductView(productHandle, productId);
      posthog?.capture('product_viewed', {
        product_id: productId,
        product_handle: productHandle,
        product_title: productTitle,
        $current_url: window.location.href,
        $screen_width: window.screen.width,
        $screen_height: window.screen.height,
      });
    };
    track();
  }, [productHandle, productId, productTitle, posthog]);

  return null;
};
