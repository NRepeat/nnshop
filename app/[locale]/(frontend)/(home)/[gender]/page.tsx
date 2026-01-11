import { genders, Locale, locales } from '@/shared/i18n/routing';
import { PageContent } from '@widgets/home/ui/view';

export async function generateStaticParams() {
  for (const gender of genders) {
    for (const locale of locales) {
      return [{ locale: locale, gender: gender }];
    }
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale; gender: string }>;
}) {
  const { locale, gender } = await params;
  return <PageContent locale={locale} gender={gender} />;
}
