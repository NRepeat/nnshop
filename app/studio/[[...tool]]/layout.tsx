import type { Metadata } from 'next';
import '../../globals.css';

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
      <body>{children}</body>
    </html>
  );
}
