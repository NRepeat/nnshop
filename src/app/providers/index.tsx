import { ReactNode } from 'react';
import { Provider } from '@/app/providers/authUIProvider';
import { Toaster } from 'sonner';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { NextIntlClientProvider } from 'next-intl';

export function Providers({ children }: { children: ReactNode }) {
  return (
    // <Provider>
    <NextIntlClientProvider>
      <NuqsAdapter>
        {children}
        <Toaster />
      </NuqsAdapter>
    </NextIntlClientProvider>
    // </Provider>
  );
}
