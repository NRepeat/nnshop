import { getHomePage } from '@features/home/api/get-home-page';
import { HeroPageBuilder } from '@features/home/ui/HeroPageBuilder';
import { Locale } from '@shared/i18n/routing';
import { notFound } from 'next/navigation';

export const PageContent = async ({
  locale,
  gender,
}: {
  locale: Locale;
  gender: string;
}) => {
  const page = await getHomePage({ locale, gender });
  if (!page) {
    return notFound();
  }
  return (
    <div className="flex flex-col">
      <HeroPageBuilder content={page.content} locale={locale} />
    </div>
  );
};
