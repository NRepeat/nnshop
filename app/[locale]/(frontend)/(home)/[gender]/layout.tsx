import { setRequestLocale } from 'next-intl/server';

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string; gender: string }>;
}>) {
  const { locale } = await params;

  setRequestLocale(locale);
  return (
    <>
      {children}
    </>
  );
}
