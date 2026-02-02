import React from 'react';
import { Provider } from '@/app/providers/authUIProvider';
export default function Layout({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}
