import { VisualEditing } from 'next-sanity/visual-editing';
import { routing } from '@/shared/i18n/routing';
import { Header } from '@widgets/header/ui/Header';
import { SanityLive } from '@shared/sanity/lib/live';
import { DisableDraftMode } from '@shared/sanity/components/live/DisableDraftMode';
import { draftMode } from 'next/headers';
import { Footer } from '@widgets/footer/ui/Footer';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Suspense } from 'react';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  modal,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
  modal: React.ReactNode;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  return (
    <div className="">
      <Header locale={locale} />
      {modal}
      {children}
      <Suspense fallback={<div>Loading...</div>}>
        <SanityLive />
      </Suspense>
      {(await draftMode()).isEnabled && (
        <>
          <DisableDraftMode />
          <VisualEditing />
        </>
      )}
      <Footer />
      <SpeedInsights />
    </div>
  );
}
