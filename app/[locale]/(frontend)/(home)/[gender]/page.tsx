import { genders, Locale, locales } from '@/shared/i18n/routing';
import { PageContent } from '@widgets/home/ui/view';
import { Suspense } from 'react';

export async function generateStaticParams() {
  const params = [];
  for (const gender of genders) {
    for (const locale of locales) {
      params.push({ locale: locale, gender: gender });
    }
  }
  return params;
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale; gender: string }>;
}) {
  return (
    <Suspense>
      <PageContent params={params} />
    </Suspense>
  );
}
