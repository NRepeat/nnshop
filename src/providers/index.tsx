import { ReactNode } from 'react';
import { Provider } from './authUIProvider';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider>
      {children}
      <Toaster />
    </Provider>
  );
}
