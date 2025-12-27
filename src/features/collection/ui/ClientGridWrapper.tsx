'use client';
import { useState } from 'react';
import { ClientGrid } from './ClientGrid';
import LoadMore from './LoadMore';
import {
  Filter,
  PageInfo,
  Product,
} from '@shared/lib/shopify/types/storefront.types';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';

import { FilterSheet } from './FilterSheet';

export const ClientGridWrapper = ({
  initialPageInfo,
  initialProducts,
  filters,
}: {
  initialProducts: Product[];
  initialPageInfo: PageInfo;
  filters: Filter[];
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
  const handle = Array.isArray(params.slug)
    ? params.slug.join('/')
    : (params.slug as string);
  return (
    <div className="flex h-full">
      <div className="flex flex-col items-end">
        <div className="flex w-full justify-between md:justify-end">
          <FilterSheet filters={filters} />
        </div>
        <div className="flex flex-col w-full  pt-2 md:pt-0 h-full">
          <ClientGrid products={products as Product[]} />
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
