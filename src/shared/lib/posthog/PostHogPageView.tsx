'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';

export function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', {
        $current_url: url,
        $screen_width: window.screen.width,
        $screen_height: window.screen.height,
        $viewport_width: window.innerWidth,
        $viewport_height: window.innerHeight,
      });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}
