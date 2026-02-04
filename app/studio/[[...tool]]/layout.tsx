import type { Metadata } from 'next';
import '../../globals.css';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Mio Mio Studio',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={'en'} suppressHydrationWarning>
      <Suspense>
        <body>{children}</body>
      </Suspense>
    </html>
  );
}
