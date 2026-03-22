import { getAllBrands } from '@entities/brand/api/getAllBrands';
import { vendorToHandle } from '@shared/lib/utils/vendorToHandle';
import { decodeHtmlEntities } from '@shared/lib/utils/decodeHtmlEntities';
import { Breadcrumbs } from '@shared/ui/breadcrumbs';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';
import { generatePageMetadata } from '@shared/lib/seo/generateMetadata';
import Link from 'next/link';
import { Suspense } from 'react';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'BrandsPage' });
  const isUk = locale === 'uk';
  const seoTitle = isUk
    ? 'Бренди взуття та одягу — каталог | MioMio'
    : 'Бренды обуви и одежды — каталог | MioMio';

  return generatePageMetadata(
    { title: seoTitle, description: t('description') },
    locale,
    '/brands',
  );
}

// Group brands by first letter
function groupBrandsByLetter(brands: string[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};

  brands.forEach((brand) => {
    const firstLetter = brand.charAt(0).toUpperCase();
    if (!grouped[firstLetter]) {
      grouped[firstLetter] = [];
    }
    grouped[firstLetter].push(brand);
  });

  return grouped;
}

const BrandsList = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: 'BrandsPage' });
  const rawBrands = await getAllBrands(locale);
  const brands = Array.from(new Set(rawBrands.map(decodeHtmlEntities)));
  const groupedBrands = groupBrandsByLetter(brands);
  const letters = Object.keys(groupedBrands).sort();

  if (brands.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">{t('empty')}</p>
      </div>
    );
  }

  return (
    <>
      {/* Alphabet Index */}
      <div className="flex flex-wrap gap-2 mb-8 border-b pb-4">
        {letters.map((letter) => (
          <Link
            key={letter}
            href={`#letter-${letter}`}
            className="text-sm font-medium hover:underline transition-colors px-3 py-1"
          >
            {letter}
          </Link>
        ))}
      </div>

      {/* Brands List */}
      <div className="space-y-10">
        {letters.map((letter) => (
          <div
            key={letter}
            id={`letter-${letter}`}
            className="scroll-mt-[125px] scroll-smooth"
          >
            <h2 className="text-2xl font-bold mb-4">{letter}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-2">
              {groupedBrands[letter].map((brand) => (
                <Link
                  key={brand}
                  href={`/brand/${vendorToHandle(brand)}`}
                  className="text-sm hover:text-primary hover:underline transition-colors py-1"
                >
                  {brand}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

const BrandsListSkeleton = () => (
  <div className="space-y-10 animate-pulse">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i}>
        <div className="h-8 w-8 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-2">
          {Array.from({ length: 8 }).map((_, j) => (
            <div key={j} className="h-4 bg-gray-200 rounded py-1" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default async function BrandsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'BrandsPage' });
  const tHeader = await getTranslations({ locale, namespace: 'Header.nav' });

  const breadcrumbItems = [
    { label: tHeader('home'), href: '/' },
    { label: t('title'), href: '/brands', isCurrent: true },
  ];

  return (
    <div className=" mt-8 md:mt-8 h-fit min-h-screen">
      <div className="container">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Page Header */}
        <div className="my-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('title')}</h1>
          <p className="text-gray-500 text-sm">{t('description')}</p>
        </div>

        <Suspense fallback={<BrandsListSkeleton />}>
          <BrandsList locale={locale} />
        </Suspense>
      </div>
    </div>
  );
}
