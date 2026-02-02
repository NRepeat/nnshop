import { genders, locales } from '@shared/i18n/routing';

export async function generateStaticParams() {
  const params = [];
  for (const gender of genders) {
    for (const locale of locales) {
      params.push({ locale: locale, gender: gender });
    }
  }
  return params;
}

export default async function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
