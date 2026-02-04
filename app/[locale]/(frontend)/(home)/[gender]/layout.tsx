import { setRequestLocale } from 'next-intl/server';

// export async function generateStaticParams() {
//   const params = [];
//   for (const gender of genders) {
//     for (const locale of locales) {
//       params.push({ locale: locale, gender: gender });
//     }
//   }
//   return params;
// }

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string; gender: string }>;
}>) {
  const { locale } = await params;

  setRequestLocale(locale);
  return <>{children}</>
}
