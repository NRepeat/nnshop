import { StyreneAWeb } from '@/shared/utils/custom-fonts';
import type { Metadata } from 'next';
import { Jost, Geist, Geist_Mono } from 'next/font/google';
import '../../globals.css';
import { Providers } from '@/app/providers';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { NextIntlClientProvider } from 'next-intl';
import { Header } from '@widgets/header/ui/Header';
import { Footer } from '@widgets/footer/ui/Footer';

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

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
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
            {/*{modal}*/}
            <Footer locale={locale} />
          </NextIntlClientProvider>
        </Providers>
      </body>
      <SpeedInsights />
    </html>
  );
}
