'use client';
import { useState } from 'react';
import { ClientGrid } from './ClientGrid';
import LoadMore from './LoadMore';
import { PageInfo, Product } from '@shared/lib/shopify/types/storefront.types';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';

export const ClientGridWrapper = ({
  initialPageInfo,
  initialProducts,
}: {
  initialProducts: Product[];
  initialPageInfo: PageInfo;
}) => {
  const locale = useLocale();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [pageInfo, setPageInfo] = useState(initialPageInfo);
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
  return (
    <div className="flex flex-col">
      <ClientGrid products={products as Product[]} />
      <LoadMore
        initialPageInfo={pageInfo}
        onDataLoadedAction={handleDataLoaded}
        locale={locale}
        handle={params.slug as string}
      />
    </div>
  );
};
