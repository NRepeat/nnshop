
import { ReactNode, Suspense } from 'react';
import { Toaster } from 'sonner';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { NextIntlClientProvider } from 'next-intl';
import { PostHogProvider } from '@shared/lib/posthog/PostHogProvider';
import { PostHogPageView } from '@shared/lib/posthog/PostHogPageView';
import { PostHogIdentify } from '@shared/lib/posthog/PostHogIdentify';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider>
      <Suspense>
        <NuqsAdapter>
          <PostHogProvider>
            <Suspense fallback={null}>
              <PostHogPageView />
            </Suspense>
            <Suspense fallback={null}>
              <PostHogIdentify />
            </Suspense>
            {children}
            <Toaster position="bottom-center" />
          </PostHogProvider>
        </NuqsAdapter>
      </Suspense>
    </NextIntlClientProvider>
  );
}
