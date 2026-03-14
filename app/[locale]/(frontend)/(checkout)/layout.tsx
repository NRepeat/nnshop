import { ScrollToTop } from '@shared/ui/ScrollToTop';
import { ReactNode } from 'react';

export default function CheckoutLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <ScrollToTop />
      {children}
    </>
  );
}
