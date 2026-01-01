import { ReactNode } from 'react';
import { Provider } from '@/app/providers/authUIProvider';
import { Toaster } from 'sonner';
import { NextIntlClientProvider } from 'next-intl';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider>
      <NuqsAdapter>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <Toaster />
      </NuqsAdapter>
    </Provider>
  );
}
