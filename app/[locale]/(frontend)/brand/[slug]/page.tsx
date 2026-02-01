import { getCollection } from '@entities/collection/api/getCollection';
import { ProductCard } from '@entities/product/ui/ProductCard';
import { Breadcrumbs } from '@shared/ui/breadcrumbs';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Product } from '@shared/lib/shopify/types/storefront.types';

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const decodedSlug = decodeURIComponent(slug);

  try {
    const { collection } = await getCollection({
      handle: decodedSlug,
      first: 1,
      locale,
    });

    if (!collection) {
      return { title: 'Brand Not Found' };
    }

    return {
      title: `${collection.collection?.title}`,
      description: collection.collection?.description,
    };
  } catch {
    return { title: 'Brand Not Found' };
  }
}

export default async function BrandPage({ params }: Props) {
  const { slug, locale } = await params;
  const decodedSlug = decodeURIComponent(slug);
  setRequestLocale(locale);

  const tHeader = await getTranslations({ locale, namespace: 'Header.nav' });
  const t = await getTranslations({ locale, namespace: 'CollectionPage' });
  const tBrands = await getTranslations({ locale, namespace: 'BrandsPage' });

  const { collection } = await getCollection({
    handle: decodedSlug,
    first: 50,
    locale,
  });

  if (!collection || !collection.collection?.products) {
    return notFound();
  }

  const breadcrumbItems = [
    { label: tHeader('home'), href: '/' },
    { label: tBrands('title'), href: '/brands' },
    {
      label: collection.collection.title,
      href: `/brand/${slug}`,
      isCurrent: true,
    },
  ];

  const productCount = collection.collection.products.edges.length;

  return (
    <div className="container mx-auto py-10 mt-2 md:mt-10">
      <Breadcrumbs items={breadcrumbItems} />

      {/* Brand Header */}
      <div className="my-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {collection.collection.title}
        </h1>

        {/* Brand Description */}
        {collection.collection.description && (
          <div className="max-w-full">
            <p className="text-gray-600 text-base md:text-base leading-relaxed">
              {collection.collection.description}
            </p>
          </div>
        )}

        {/* Product Count */}
        <p className="text-sm text-gray-500 mt-4">
          {productCount}{' '}
          {productCount === 1 ? tBrands('product') : tBrands('products')}
        </p>
      </div>

      {/* Products Grid */}
      {productCount === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">{t('noProducts')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {collection.collection.products.edges.map((edge) => (
            <ProductCard
              key={edge.node.id}
              product={edge.node as Product}
              withCarousel={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
