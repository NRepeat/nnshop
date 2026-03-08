
import { ReactNode, Suspense } from 'react';
import { Toaster } from 'sonner';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { NextIntlClientProvider } from 'next-intl';
import { PostHogProvider } from '@shared/lib/posthog/PostHogProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider>
      <Suspense>
        <NuqsAdapter>
          <PostHogProvider>
            {children}
            <Toaster position="bottom-center" />
          </PostHogProvider>
        </NuqsAdapter>
      </Suspense>
    </NextIntlClientProvider>
  );
}
