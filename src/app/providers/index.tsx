'use client';

import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { NextIntlClientProvider } from 'next-intl';
import { PostHogProvider } from '@shared/lib/posthog/PostHogProvider';
import { usePostHogIdentify } from '@shared/lib/posthog/usePostHogIdentify';

function AnalyticsIdentifier() {
  usePostHogIdentify();
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PostHogProvider>
      <NextIntlClientProvider>
        <NuqsAdapter>
          <AnalyticsIdentifier />
          {children}
          <Toaster position="bottom-center" />
        </NuqsAdapter>
      </NextIntlClientProvider>
    </PostHogProvider>
  );
}
