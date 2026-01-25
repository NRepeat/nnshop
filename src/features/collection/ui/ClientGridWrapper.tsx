'use client';
import { useState, useEffect } from 'react';
import { ClientGrid } from './ClientGrid';
import LoadMore from './LoadMore';
import { PageInfo, Product } from '@shared/lib/shopify/types/storefront.types';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';

export const ClientGridWrapper = ({
  initialPageInfo,
  initialProducts,
}: {
  initialProducts: (Product & { isFav: boolean })[];
  initialPageInfo: PageInfo;
}) => {
  const locale = useLocale();
  const [products, setProducts] = useState<(Product & { isFav: boolean })[]>(initialProducts);
  const [pageInfo, setPageInfo] = useState(initialPageInfo);
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    setPageInfo(initialPageInfo);
  }, [initialPageInfo]);

  const handleDataLoaded = (newProducts: Product[], newPageInfo: any) => {
    setProducts((prev) => {
      const map = new Map();
      prev?.forEach((p) => map.set(p.id, p));
      newProducts.forEach((p) => map.set(p.id, p));
      return Array.from(map.values());
    });
    setPageInfo(newPageInfo);
  };
  const params = useParams();
  const handle = Array.isArray(params.slug)
    ? params.slug.join('/')
    : (params.slug as string);
  return (
    <div className="flex h-full w-full justify-between">
      <div className="flex flex-col w-full items-end justify-between">
        <div className="flex flex-col w-full justify-between  pt-0 h-full">
          <ClientGrid products={products as (Product & { isFav: boolean })[]} />
          <div className="w-full items-center">
            <LoadMore
              initialPageInfo={pageInfo}
              onDataLoadedAction={handleDataLoaded}
              locale={locale}
              handle={handle}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
