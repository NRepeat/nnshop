import { Suspense } from 'react';
import { HeroPageBuilder } from '@features/home/ui/HeroPageBuilder';
import { RecentlyViewedSection } from '@entities/recently-viewed/ui/RecentlyViewedSection';
import { NewsletterSection } from '@features/newsletter/ui/NewsletterSection';
import { Locale } from '@shared/i18n/routing';

const genderH1: Record<string, Record<string, string>> = {
  uk: { woman: 'Жіноче взуття', man: 'Чоловіче взуття' },
  ru: { woman: 'Женская обувь', man: 'Мужская обувь' },
};

export const PageContent = async ({
  params,
}: {
  params: Promise<{ locale: Locale; gender: string }>;
}) => {
  const { locale, gender } = await params;

  return (
    <div className="flex flex-col h-fit min-h-screen">
      <h1 className="sr-only">{genderH1[locale]?.[gender] ?? ''}</h1>
      <HeroPageBuilder gender={gender} locale={locale} />
    </div>
  );
};
