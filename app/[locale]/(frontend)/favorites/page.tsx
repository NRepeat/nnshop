import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';
import { getProductsByIds } from '@entities/product/api/getProductsByIds';
import { ProductCard } from '@entities/product/ui/ProductCard';
import { Breadcrumbs } from '@shared/ui/breadcrumbs';
import { Empty, EmptyHeader, EmptyTitle } from '@shared/ui/empty';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
async function FavoritesPageSession({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('FavoritesPage');
  const tHeader = await getTranslations('Header.nav');
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user) {
    return (
      <div className="container mx-auto py-10 mt-2 md:mt-10">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{t('empty')}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const favoriteProducts = await prisma.favoriteProduct.findMany({
    where: { userId: session.user.id },
  });

  if (favoriteProducts.length === 0) {
    return (
      <div className="container mx-auto py-10 mt-2 md:mt-10">
        <Breadcrumbs
          items={[
            { label: tHeader('home'), href: '/' },
            { label: t('title'), href: '/favorites', isCurrent: true },
          ]}
        />
        <h1 className="text-2xl font-bold my-4">{t('title')}</h1>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{t('empty')}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const productIds = favoriteProducts.map((fav) => fav.productId);
  const products = await getProductsByIds(productIds, locale);

  const breadcrumbItems = [
    { label: tHeader('home'), href: '/' },
    { label: t('title'), href: '/favorites', isCurrent: true },
  ];
  if (products.length === 0) {
    return (
      <div className="container mx-auto py-10 mt-2 md:mt-10">
        <Breadcrumbs
          items={[
            { label: tHeader('home'), href: '/' },
            { label: t('title'), href: '/favorites', isCurrent: true },
          ]}
        />
        <h1 className="text-2xl font-bold my-4">{t('title')}</h1>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{t('empty')}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }
  return (
    <div className="container mx-auto py-10 mt-2 md:mt-10">
      <Breadcrumbs items={breadcrumbItems} />
      <h1 className="text-2xl font-bold my-4">{t('title')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            withCarousel
            isFav={true}
          />
        ))}
      </div>
    </div>
  );
}
export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <Suspense>
      <FavoritesPageSession params={params} />
    </Suspense>
  );
}
