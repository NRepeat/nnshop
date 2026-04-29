import '../globals.css';
import './admin-theme.css';
import { Onest } from 'next/font/google';
import { Suspense } from 'react';
import { AdminGuard } from './AdminGuard';
import { SidebarInset, SidebarProvider } from '@shared/ui/sidebar';

const font = Onest({
  variable: '--font-jost-sans',
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  display: 'swap',
});

export const metadata = {
  title: 'Admin — Mio Mio',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body
        className={`admin-theme ${font.variable} font-sans bg-background text-foreground min-h-screen antialiased`}
      >
        <SidebarProvider
          style={
            {
              '--sidebar-width': 'calc(var(--spacing) * 64)',
              '--header-height': 'calc(var(--spacing) * 12)',
            } as React.CSSProperties
          }
        >
          <Suspense fallback={null}>
            <AdminGuard />
          </Suspense>
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
