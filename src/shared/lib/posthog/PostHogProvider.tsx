'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: 'identified_only',
      capture_pageview: false, // captured manually in PostHogPageView
      capture_pageleave: true,
      session_recording: {
        maskAllInputs: true, // hide passwords/card numbers
        maskInputOptions: { password: true },
      },
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
