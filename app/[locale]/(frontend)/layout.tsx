import type { Metadata } from 'next';
import { Jost } from 'next/font/google';
import '../../globals.css';
import { Providers } from '@/app/providers';
import { Header } from '@widgets/header/ui/Header';
import { Footer } from '@widgets/footer/ui/Footer';
import { locales } from '@shared/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { DisableDraftMode } from '@shared/sanity/components/live/DisableDraftMode';
import { SanityLive } from '@shared/sanity/lib/live';
import { VisualEditing } from 'next-sanity/visual-editing';
import { draftMode } from 'next/headers';
import { Suspense } from 'react';

const jostSans = Jost({
  variable: '--font-jost-sans',
  subsets: ['latin'],
  display: 'swap',
  fallback: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif',
  ],
});

export const metadata: Metadata = {
  title: 'Mio Mio',
};
export async function generateStaticParams() {
  const params = [];
  for (const locale of locales) {
    params.push({ locale: locale });
  }
  return params;
}
interface RootProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
  modal?: React.ReactNode;
  auth?: React.ReactNode;
}

export default async function RootLayout(props: RootProps) {
  const { children, params, auth, modal } = props;
  const { locale } = await params;

  setRequestLocale(locale);
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${jostSans.variable} antialiased`}>
        <Providers>
          <Header locale={locale} />

          {children}

          {modal && <div id="modal-slot">{modal}</div>}
          {auth && <div id="auth-slot">{auth}</div>}
          <Suspense>
            <Footer locale={locale} />
          </Suspense>
        </Providers>
        {(await draftMode()).isEnabled && (
          <>
            <DisableDraftMode />
            <VisualEditing />
          </>
        )}
        <Suspense fallback={<div>Loading...</div>}>
          <SanityLive />
        </Suspense>
      </body>
    </html>
  )
}
