import { ReactNode, Suspense } from 'react';
import { Toaster } from 'sonner';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { NextIntlClientProvider } from 'next-intl';
import { PostHogProvider } from '@shared/lib/posthog/PostHogProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PostHogProvider>
      <NextIntlClientProvider>
        <Suspense>
          <NuqsAdapter>
            {children}
            <Toaster
              position="bottom-center"
              toastOptions={{ style: { zIndex: 199 } }}
            />
          </NuqsAdapter>
        </Suspense>
      </NextIntlClientProvider>
    </PostHogProvider>
  );
}
