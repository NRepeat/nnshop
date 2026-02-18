import type { Metadata, Viewport } from 'next';
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
import { JsonLd } from '@shared/ui/JsonLd';
import { generateOrganizationJsonLd } from '@shared/lib/seo/jsonld';
import { ScrollToTop } from '@shared/ui/ScrollToTop';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
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

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://miomio.com.ua';

export const metadata: Metadata = {
  title: {
    default: 'Mio Mio',
    template: '%s | Mio Mio',
  },
  description:
    'Mio Mio - інтернет-магазин взуття та аксесуарів. Широкий вибір стильного взуття для чоловіків та жінок.',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: 'website',
    siteName: 'Mio Mio',
    locale: 'uk_UA',
  },
  robots: 'noindex',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
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
      <head>
        <link rel="preconnect" href="https://cdn.shopify.com" />
        <JsonLd data={generateOrganizationJsonLd()} />
        <meta
          name="google-site-verification"
          content="qD1Qgm9RZihEYdNNxa5cH_88cZEGi-B8-mQcGwJLrAo"
        />
      </head>
      <body className={`${jostSans.variable} antialiased`}>
        <Providers>
          <ScrollToTop />
          <Header locale={locale} />

          <main>{children}</main>

          {modal && <div id="modal-slot">{modal}</div>}
          {auth && <div id="auth-slot">{auth}</div>}
          <Suspense>
            <Footer locale={locale} />
          </Suspense>
        </Providers>
      </body>
      {(await draftMode()).isEnabled && (
        <>
          <DisableDraftMode />
          <VisualEditing />
          <Suspense>
            <SanityLive />
          </Suspense>
        </>
      )}
      <Analytics />
      <SpeedInsights />
    </html>
  );
}
