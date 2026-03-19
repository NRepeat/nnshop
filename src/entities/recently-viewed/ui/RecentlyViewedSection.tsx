'use client';

import { useEffect, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { CardCarousel } from '@entities/home/ui/cardCarousel';
import { ProductCard } from '@entities/product/ui/ProductCard';
import { ProductCardSkeleton } from '@entities/product/ui/ProductCardSkeleton';
import { Skeleton } from '@shared/ui/skeleton';
import { Product } from '@shared/lib/shopify/types/storefront.types';

export const RecentlyViewedSection = () => {
  const locale = useLocale();
  const t = useTranslations('RecentlyViewed');
  const [products, setProducts] = useState<Product[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/recently-viewed?locale=${locale}`, { cache: 'no-store' });
        const data: Product[] = await res.json();
        if (Array.isArray(data) && data.length > 0) setProducts(data);
      } catch {}
    });
  }, [locale]);

  if (!isPending && products.length === 0) return null;

  if (isPending) {
    return (
      <div className="recently-viewed container">
        <div className="py-8 flex flex-col gap-8">
          <Skeleton className="h-8 w-56 mx-auto" />
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="basis-1/2 md:basis-1/4 shrink-0">
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const items = products.map((product) => (
    <ProductCard
      key={product.id}
      product={product}
      withCarousel={false}
      withQuick={false}
      className="hover:shadow rounded-b rounded-t pt-0 px-0"
      source="recently_viewed"
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
