import type { Metadata, Viewport } from 'next';
import { Jost } from 'next/font/google';
import '../globals.css';
import { Providers } from '@/app/providers';
import { Footer } from '@widgets/footer/ui/Footer';
import { genders, locales } from '@shared/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { DisableDraftMode } from '@shared/sanity/components/live/DisableDraftMode';
import { SanityLive } from '@shared/sanity/lib/live';
import { VisualEditing } from 'next-sanity/visual-editing';
import { draftMode } from 'next/headers';
import { Suspense } from 'react';
import { JsonLd } from '@shared/ui/JsonLd';
import { generateOrganizationJsonLd } from '@shared/lib/seo/jsonld';
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
  verification: {
    google: 'qD1Qgm9RZihEYdNNxa5cH_88cZEGi-B8-mQcGwJLrAo',
  },
  openGraph: {
    type: 'website',
    siteName: 'Mio Mio',
    locale: 'uk_UA',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};
export async function generateStaticParams() {
  const params = [];
  for (const gender of genders) {
    for (const locale of locales) {
      params.push({ locale: locale, gender: gender });
    }
  }
  return params;
}
interface RootProps {
  children: React.ReactNode;
  params: Promise<{ locale: string; gender: string }>;
  modal?: React.ReactNode;
  auth?: React.ReactNode;
}

export default async function RootLayout(props: RootProps) {
  const { children, params } = props;
  const { locale } = await params;

  setRequestLocale(locale);
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${jostSans.variable} antialiased`}>
        <link rel="preconnect" href="https://cdn.shopify.com" />
        <JsonLd data={generateOrganizationJsonLd()} />
        <Providers>
          {children}
          <Suspense>
            <Footer locale={locale} />
          </Suspense>
        </Providers>
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
      </body>
    </html>
  );
}
