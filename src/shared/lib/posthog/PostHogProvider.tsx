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
      disable_session_recording: true,
      loaded: (ph) => {
        if (process.env.NODE_ENV !== 'development') {
          const enableRecording = () => {
            ph.set_config({
              disable_session_recording: false,
              session_recording: {
                maskAllInputs: false,
                maskInputOptions: { password: true },
              },
            });
            ph.startSessionRecording();
          };
          if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(() => setTimeout(enableRecording, 3000));
          } else {
            setTimeout(enableRecording, 5000);
          }
        }
      },
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
