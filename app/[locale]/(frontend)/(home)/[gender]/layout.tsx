import { VisualEditing } from 'next-sanity/visual-editing';
import { genders, locales, routing } from '@/shared/i18n/routing';
import { Header } from '@widgets/header/ui/Header';
import { SanityLive } from '@shared/sanity/lib/live';
import { DisableDraftMode } from '@shared/sanity/components/live/DisableDraftMode';
import { draftMode } from 'next/headers';
import { Footer } from '@widgets/footer/ui/Footer';
import { Suspense } from 'react';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

export async function generateStaticParams() {
  for (const gender of genders) {
    for (const locale of locales) {
      return [{ locale: locale, gender: gender }];
    }
  }
}

export default async function LocaleLayout({
  children,
  modal,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string; gender: string }>;
  modal: React.ReactNode;
}>) {
  const { locale, gender } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  return (
    <NextIntlClientProvider>
      <Header locale={locale} gender={gender} />

      {modal}
      {children}
      {(await draftMode()).isEnabled && (
        <>
          <DisableDraftMode />
          <VisualEditing />
        </>
      )}
      <Footer locale={locale} />
      <Suspense fallback={<div>Loading...</div>}>
        <SanityLive />
      </Suspense>
    </NextIntlClientProvider>
  );
}
