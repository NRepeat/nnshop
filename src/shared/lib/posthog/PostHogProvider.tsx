'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { ReactNode } from 'react';

export function PostHogProvider({ children }: { children: ReactNode }) {
  if (typeof window !== 'undefined' && !posthog.__loaded) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: '/ingest',
      ui_host: 'https://us.posthog.com',
      capture_pageview: false,
      autocapture: false,
      capture_exceptions: false,
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: { password: true },
      },
      loaded: (ph) => {
        ph.startSessionRecording();
      },
    });
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
