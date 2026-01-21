import { HeroPageBuilder } from '@features/home/ui/HeroPageBuilder';
import { Locale } from '@shared/i18n/routing';
import { Suspense } from 'react';

export const PageContent = async ({
  params,
}: {
  params: Promise<{ locale: Locale; gender: string }>;
}) => {
  const { locale, gender } = await params;

  return (
    <Suspense>
      <div className="flex flex-col">
        <HeroPageBuilder gender={gender} locale={locale} />
      </div>
    </Suspense>
  );
};
