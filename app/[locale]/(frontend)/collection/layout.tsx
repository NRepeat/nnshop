import { locales } from '@shared/i18n/routing';
// import { Header } from '@widgets/header/ui/Header'; // Removed unused import
import { setRequestLocale } from 'next-intl/server';
// import { cookies } from 'next/headers'; // Removed unused import

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
  setRequestLocale(locale);
  return (
    <>
      {/*<Header locale={locale} />*/}
      {children}
    </>
  );
}
