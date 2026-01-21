import type { Metadata } from 'next';
import { Jost } from 'next/font/google';
import '../../globals.css';
import { Providers } from '@/app/providers';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { NextIntlClientProvider } from 'next-intl';
import { Header } from '@widgets/header/ui/Header';
import { Footer } from '@widgets/footer/ui/Footer';
import { locales } from '@shared/i18n/routing';

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
  const { children, modal, auth, params } = props;
  const { locale } = await params;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${jostSans.variable} antialiased`}>
        <Providers>
          <NextIntlClientProvider locale={locale}>
            <Header locale={locale} />

            {children}

            {modal && <div id="modal-slot">{modal}</div>}
            {auth && <div id="auth-slot">{auth}</div>}

            <Footer locale={locale} />
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
