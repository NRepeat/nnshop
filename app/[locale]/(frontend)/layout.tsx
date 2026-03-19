import type { Metadata, Viewport } from 'next';
import { Onest } from 'next/font/google';
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
import { ScrollDirectionProvider } from '@shared/ui/ScrollDirectionProvider';
import { SessionBanner } from '@features/session-banner';
import { generateOrganizationJsonLd } from '@shared/lib/seo/jsonld';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';

const jostSans = Onest({
  variable: '--font-jost-sans',
  subsets: ['latin', 'latin-ext', 'cyrillic'],
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
    images: [{ url: `${process.env.BLOB_BASE_URL}/og-image.jpg`, width: 1200, height: 630 }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};
async function DraftModeTools() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;
  return (
    <>
      <DisableDraftMode />
      <VisualEditing />
      <Suspense>
        <SanityLive />
      </Suspense>
    </>
  );
}

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
        <Script
          id="google-tag-manager"
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-05RL9JZJKK"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive" async>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-05RL9JZJKK');
          `}
        </Script>
        <Script
          id="pulse-live-chat"
          src="/assets/pulse/livechat/loader.js"
          data-live-chat-id="6683a3f051e3db46980f8c09"
          async
        ></Script>
        <JsonLd data={generateOrganizationJsonLd()} />
        <meta
          name="google-site-verification"
          content="qD1Qgm9RZihEYdNNxa5cH_88cZEGi-B8-mQcGwJLrAo"
        />
      </head>
      <body className={`${jostSans.variable} antialiased `}>
        <Providers>
          <ScrollDirectionProvider>
            <Header locale={locale} />
            <main>{children}</main>

            {modal && <div id="modal-slot">{modal}</div>}
            <Suspense>
              <SessionBanner locale={locale} />
            </Suspense>
            {auth && <div id="auth-slot">{auth}</div>}
            <Suspense>
              <Footer locale={locale} />
            </Suspense>
          </ScrollDirectionProvider>
        </Providers>
      </body>
      <Suspense>
        <DraftModeTools />
      </Suspense>
      <Analytics />
      <SpeedInsights />
    </html>
  );
}
