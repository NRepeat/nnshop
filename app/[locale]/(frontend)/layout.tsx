import type { Metadata, Viewport } from 'next';
import { Onest } from 'next/font/google';
import '../../globals.css';
import { Providers } from '@/app/providers';
import { Header } from '@widgets/header/ui/Header';
import { Footer } from '@widgets/footer/ui/Footer';
import { locales } from '@shared/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { DisableDraftMode } from '@shared/sanity/components/live/DisableDraftMode';
import { SanityLive } from '@shared/sanity/lib/live';
import { VisualEditing } from 'next-sanity/visual-editing';
import { draftMode } from 'next/headers';
import { Suspense } from 'react';
import { JsonLd } from '@shared/ui/JsonLd';
import { ScrollDirectionProvider } from '@shared/ui/ScrollDirectionProvider';
import { SessionBanner } from '@features/session-banner';
import { generateOrganizationJsonLd, generateWebSiteJsonLd } from '@shared/lib/seo/jsonld';
import Script from 'next/script';
import { ConsentBanner } from '@features/consent/ui/ConsentBanner';
import { GA4Identify } from '@shared/lib/analytics/GA4Identify';
import { GA4PageView } from '@shared/lib/analytics/GA4PageView';
import { ClarityInit } from '@shared/lib/analytics/ClarityInit';

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
  let isEnabled = false;
  if (process.env.NEXT_PHASE !== 'phase-production-build') {
    try {
      const dm = await draftMode();
      isEnabled = dm.isEnabled;
    } catch {
      // ignore
    }
  }
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
  const { locale = 'uk' } = (await params) || {};

  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  try {
    setRequestLocale(locale);
  } catch {
    // ignore
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.shopify.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
        <Script id="google-consent-init" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'analytics_storage': 'granted',
              'wait_for_update': 500
            });
          `}
        </Script>
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-M2QHJZQF');`}
        </Script>
        <Script
          id="google-tag-manager"
          src="https://www.googletagmanager.com/gtag/js?id=G-05RL9JZJKK"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            gtag('js', new Date());
            gtag('config', 'G-05RL9JZJKK', { send_page_view: false });
          `}
        </Script>
        <Script
          id="pulse-live-chat"
          src="/assets/pulse/livechat/loader.js"
          data-live-chat-id="6683a3f051e3db46980f8c09"
          strategy="lazyOnload"
        />
        <JsonLd data={generateOrganizationJsonLd()} />
        <JsonLd data={generateWebSiteJsonLd(locale)} />
        <meta
          name="google-site-verification"
          content="qD1Qgm9RZihEYdNNxa5cH_88cZEGi-B8-mQcGwJLrAo"
        />
      </head>
      <body className={`${jostSans.variable} antialiased `}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-M2QHJZQF"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
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
            <ConsentBanner />
            <GA4PageView />
            <GA4Identify />
            <ClarityInit />
          </ScrollDirectionProvider>
        </Providers>
        <Suspense>
          <DraftModeTools />
        </Suspense>
      </body>
    </html>
  );
}
