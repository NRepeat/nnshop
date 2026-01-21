import type { Metadata } from 'next';
import { Jost } from 'next/font/google';
import '../../globals.css';
import { Providers } from '@/app/providers';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { NextIntlClientProvider } from 'next-intl';
import { Header } from '@widgets/header/ui/Header';
import { Footer } from '@widgets/footer/ui/Footer';
import { locales } from '@shared/i18n/routing';

// const geistSans = Geist({
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
//   display: 'swap',
//   fallback: [
//     'system-ui',
//     '-apple-system',
//     'BlinkMacSystemFont',
//     'Segoe UI',
//     'Roboto',
//     'sans-serif',
//   ],
// });
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

// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
//   display: 'swap',
//   fallback: ['Consolas', 'Monaco', 'Courier New', 'monospace'],
// });

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
export default async function RootLayout({
  children,
  params,
  auth,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
  auth: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <html lang={locale} suppressHydrationWarning className="">
      <body className={`${jostSans.variable}  antialiased `}>
        <Providers>
          <NextIntlClientProvider>
            <Header locale={locale} />
            {children}
            {modal}
            {auth}
            <Footer locale={locale} />
          </NextIntlClientProvider>
        </Providers>
      </body>
      <SpeedInsights />
    </html>
  );
}
