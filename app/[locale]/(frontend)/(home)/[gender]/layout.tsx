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
  const params = [];
  for (const gender of genders) {
    for (const locale of locales) {
      params.push({ locale: locale, gender: gender });
    }
  }
  return params;
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string; gender: string }>;
}>) {
  const { locale, gender } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  return (
    <>
      <Header locale={locale} gender={gender} />
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
    </>
  );
}
