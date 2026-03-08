'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { ReactNode } from 'react';

interface PostHogProviderProps {
  children: ReactNode;
  bootstrap?: { distinctId: string; isIdentified: boolean };
}

export function PostHogProvider({ children, bootstrap }: PostHogProviderProps) {
  if (typeof window !== 'undefined' && !posthog.__loaded) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: '/ingest',
      ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: false,
      autocapture: true,
      capture_exceptions: true,
      bootstrap: bootstrap
        ? { distinctID: bootstrap.distinctId, isIdentifiedID: bootstrap.isIdentified }
        : undefined,
    });
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
