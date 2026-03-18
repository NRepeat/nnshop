import { HeroPageBuilder } from '@features/home/ui/HeroPageBuilder';
import { Locale } from '@shared/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { HomePageSkeleton } from './HomePageSkeleton';

export const PageContent = async ({
  params,
}: {
  params: Promise<{ locale: Locale; gender: string }>;
}) => {
  const { locale, gender } = await params;
  setRequestLocale(locale);

  return (  
    <div className="flex flex-col h-fit min-h-screen">
      <Suspense fallback={<HomePageSkeleton />}>
        <HeroPageBuilder gender={gender} locale={locale} />
      </Suspense>
    </div>
  );
};
