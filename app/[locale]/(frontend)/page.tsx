import { Locale } from '@/shared/i18n/routing';
import { HeroPageBuilder } from '@features/home/ui/HeroPageBuilder';
import { HomePageSkeleton } from '@widgets/home/ui/HomePageSkeleton';
import { generatePageMetadata } from '@shared/lib/seo/generateMetadata';
import { getRootPage } from '@features/home/api/get-root-page';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

type Props = {
  params: Promise<{ locale: Locale }>;
};

export function generateStaticParams() {
  return [{ locale: 'uk' }, { locale: 'ru' }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const page = await getRootPage(locale);
  const isUk = locale === 'uk';

  const defaultDescription = isUk
    ? 'Mio Mio — інтернет-магазин італійського одягу та взуття. Широкий вибір стильного взуття для чоловіків та жінок. Доставка по Україні ✔️'
    : 'Mio Mio — интернет-магазин итальянской одежды и обуви. Широкий выбор стильной обуви для мужчин и женщин. Доставка по Украине ✔️';

  return generatePageMetadata(
    {
      title: isUk
        ? 'Mio Mio — інтернет-магазин італійського одягу та взуття'
        : 'Mio Mio — интернет-магазин итальянской одежды и обуви',
      description: page?.seo?.description || defaultDescription,
    },
    locale,
    '/',
  );
}

export default async function RootPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex flex-col h-fit">
      <h1 className="sr-only">Mio Mio</h1>
      <Suspense fallback={<HomePageSkeleton />}>
        <HeroPageBuilder locale={locale} gender="" slug="home" />
      </Suspense>
    </div>
  );
}
