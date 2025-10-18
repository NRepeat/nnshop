import { ReactNode } from 'react';
import { Provider } from './authUIProvider';
import { Toaster } from 'sonner';
import { NextIntlClientProvider } from 'next-intl';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider>
      <NextIntlClientProvider>{children}</NextIntlClientProvider>
      <Toaster />
    </Provider>
  );
}
