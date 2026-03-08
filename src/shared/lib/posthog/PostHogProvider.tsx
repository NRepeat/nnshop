'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { ReactNode } from 'react';

export function PostHogProvider({ children }: { children: ReactNode }) {
  if (typeof window !== 'undefined' && !posthog.__loaded) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: '/ingest',
      ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: false,
      autocapture: false,
      capture_exceptions: false,
    });
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
