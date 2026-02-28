import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@shared/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { CardCarousel } from '@entities/home/ui/cardCarousel';
import { ProductCard } from '@entities/product/ui/ProductCard';
import { getProductsByHandles } from '../api/get-products-by-handles';
import { Product } from '@shared/lib/shopify/types/storefront.types';

type RecentlyViewedSectionProps = {
  locale: string;
};

export const RecentlyViewedSection = async ({
  locale,
}: RecentlyViewedSectionProps) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;

  const records = await prisma.recentlyViewedProduct.findMany({
    where: { userId: session.user.id },
    orderBy: { viewedAt: 'desc' },
    take: 10,
    select: { productHandle: true },
  });
  if (records.length === 0) return null;

  const handles = records.map((r) => r.productHandle);
  const products = await getProductsByHandles(handles, locale);
  if (products.length === 0) return null;

  const t = await getTranslations({ locale, namespace: 'RecentlyViewed' });

  const items = products.map((product) => (
    <ProductCard
      key={product.id}
      product={product as Product}
      withCarousel={false}
      withQuick={false}
      className="hover:shadow rounded-b rounded-t pt-0 px-0"
    />
  ));

  return (
    <div className="recently-viewed container">
      <div className="py-8 flex flex-col gap-8">
        <p className="text-3xl md:text-3xl text-center font-400">
          {t('title')}
        </p>
        <CardCarousel
          items={items}
          scrollable={false}
          className="basis-1/2 md:basis-1/4"
        />
      </div>
    </div>
  );
};
