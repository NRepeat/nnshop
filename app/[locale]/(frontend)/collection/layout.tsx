import { locales } from '@shared/i18n/routing';
import { Header } from '@widgets/header/ui/Header';
import { cookies } from 'next/headers';
import { Suspense } from 'react';

export async function generateStaticParams() {
  const params = [];
  for (const locale of locales) {
    params.push({ locale: locale });
  }
  return params;
}

export default async function CollectionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <Header locale={locale} />
      {children}
    </>
  );
}
