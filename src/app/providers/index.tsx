import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { NextIntlClientProvider } from 'next-intl';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider>
      {/* <Provider> */}
        <NuqsAdapter>
          {children}
          <Toaster />
        </NuqsAdapter>
      {/* </Provider> */}
    </NextIntlClientProvider>
  );
}
