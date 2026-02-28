import { Suspense } from 'react';
import { HeroPageBuilder } from '@features/home/ui/HeroPageBuilder';
import { RecentlyViewedSection } from '@entities/recently-viewed/ui/RecentlyViewedSection';
import { NewsletterSection } from '@features/newsletter/ui/NewsletterSection';
import { Locale } from '@shared/i18n/routing';

export const PageContent = async ({
  params,
}: {
  params: Promise<{ locale: Locale; gender: string }>;
}) => {
  const { locale, gender } = await params;

  return (
    <div className="flex flex-col h-fit min-h-screen">
      <HeroPageBuilder gender={gender} locale={locale} />
      <NewsletterSection />
    </div>
  );
};
