import { getAllBrands } from '@entities/brand/api/getAllBrands';
import { BrandCard } from '@entities/brand/ui/BrandCard';
import { Breadcrumbs } from '@shared/ui/breadcrumbs';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { locales } from '@shared/i18n/routing';

export async function generateStaticParams() {
  const params = [];
  for (const locale of locales) {
    params.push({ locale: locale });
  }
  return params;
}

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'BrandsPage' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

const BrandsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-white border border-gray-200 rounded-md p-6">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const BrandsContent = async ({ locale }: { locale: string }) => {
  const brands = await getAllBrands(locale);
  const t = await getTranslations({ locale, namespace: 'BrandsPage' });

  if (brands.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">{t('empty')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {brands.map((brand) => (
        <BrandCard key={brand} brand={brand} />
      ))}
    </div>
  );
};

export default async function BrandsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tHeader = await getTranslations({ locale, namespace: 'Header.nav' });
  const t = await getTranslations({ locale, namespace: 'BrandsPage' });

  const breadcrumbItems = [
    { label: tHeader('home'), href: '/' },
    { label: t('title'), href: '/brands', isCurrent: true },
  ];

  return (
    <div className="container mx-auto py-10 mt-2 md:mt-10">
      <Breadcrumbs items={breadcrumbItems} />

      {/* Page Header */}
      <div className="my-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-gray-600 text-base md:text-lg">
          {t('description')}
        </p>
      </div>

      {/* Brands Grid */}
      <Suspense fallback={<BrandsSkeleton />}>
        <BrandsContent locale={locale} />
      </Suspense>
    </div>
  );
}
