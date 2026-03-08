
import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { NextIntlClientProvider } from 'next-intl';
import { PostHogProvider } from '@shared/lib/posthog/PostHogProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider>
      <PostHogProvider>
        <NuqsAdapter>
          {children}
          <Toaster position="bottom-center" />
        </NuqsAdapter>
      </PostHogProvider>
    </NextIntlClientProvider>
  );
}
