import { getAllBrands } from '@entities/brand/api/getAllBrands';
import { vendorToHandle } from '@shared/lib/utils/vendorToHandle';
import { Breadcrumbs } from '@shared/ui/breadcrumbs';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';
import Link from 'next/link';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'BrandsPage' });

  return {
    title: t('title'),
    description: t('description'),
  };
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

export default async function BrandsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'BrandsPage' });
  const tHeader = await getTranslations({ locale, namespace: 'Header.nav' });

  const brands = await getAllBrands(locale);
  const groupedBrands = groupBrandsByLetter(brands);
  const letters = Object.keys(groupedBrands).sort();

  const breadcrumbItems = [
    { label: tHeader('home'), href: '/' },
    { label: t('title'), href: '/brands', isCurrent: true },
  ];

  return (
    <div className="container py-10 mt-2 md:mt-10 min-h-screen">
      <Breadcrumbs items={breadcrumbItems} />

      {/* Page Header */}
      <div className="my-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('title')}</h1>
        <p className="text-gray-500 text-sm">{t('description')}</p>
      </div>

      {/* Alphabet Index */}
      <div className="flex flex-wrap gap-2 mb-8 border-b pb-4">
        {letters.map((letter) => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="text-sm font-medium hover:text-primary transition-colors px-2 py-1"
          >
            {letter}
          </a>
        ))}
      </div>

      {/* Brands List */}
      {brands.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">{t('empty')}</p>
        </div>
      ) : (
        <div className="space-y-10">
          {letters.map((letter) => (
            <div key={letter} id={`letter-${letter}`}>
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
      )}
    </div>
  );
}
