'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { ReactNode, useEffect } from 'react';

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (posthog.__loaded) return;
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: '/ingest',
      ui_host: 'https://us.posthog.com',
      capture_pageview: false,
      autocapture: false,
      capture_exceptions: true,
      person_profiles: 'always',
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: { password: true },
      },
      loaded: (ph) => {
        if (process.env.NODE_ENV !== 'development') {
          const startRecording = () => ph.startSessionRecording();
          if (typeof window !== 'undefined') {
            if ('requestIdleCallback' in window) {
              (window as any).requestIdleCallback(() => {
                setTimeout(startRecording, 3000);
              });
            } else {
              setTimeout(startRecording, 5000);
            }
          }
        }
      },
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
