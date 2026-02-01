import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';
import { getProductsByIds } from '@entities/product/api/getProductsByIds';
import { FavoriteProductCard } from '@features/favorites/ui/FavoriteProductCard';
import { Breadcrumbs } from '@shared/ui/breadcrumbs';
import { Empty, EmptyHeader, EmptyTitle } from '@shared/ui/empty';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { locales } from '@shared/i18n/routing';
import { FavoriteGridSkeleton } from '@features/favorites/ui/FavoriteProductCardSkeleton';
export async function generateStaticParams() {
  const params = [];
  for (const locale of locales) {
    params.push({ locale: locale });
  }
  return params;
}

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <div className="container mx-auto py-10 mt-2 md:mt-10">
      <Suspense fallback={<FavoriteGridSkeleton />}>
        <FavoritesPageSession params={params} />
      </Suspense>
    </div>
  );
}
const FavoritesPageSession = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const tHeader = await getTranslations({ locale, namespace: 'Header.nav' });
  const t = await getTranslations({ locale, namespace: 'FavoritesPage' });
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
      <div className="container mx-auto py-10 mt-2 md:mt-10 min-h-[60vh]">
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
        <h1 className="text-2xl font-bold my-4 h-svh">{t('title')}</h1>
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
      <h1 className="text-2xl font-bold my-6">{t('title')}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {products.map((product) => (
          <FavoriteProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
