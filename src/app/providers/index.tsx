
import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { NextIntlClientProvider } from 'next-intl';
import { PostHogProvider } from '@shared/lib/posthog/PostHogProvider';

interface ProvidersProps {
  children: ReactNode;
  bootstrap?: { distinctId: string; isIdentified: boolean };
}

export function Providers({ children, bootstrap }: ProvidersProps) {
  return (
    <NextIntlClientProvider>
      <PostHogProvider bootstrap={bootstrap}>
        <NuqsAdapter>
          {children}
          <Toaster position="bottom-center" />
        </NuqsAdapter>
      </PostHogProvider>
    </NextIntlClientProvider>
  );
}
