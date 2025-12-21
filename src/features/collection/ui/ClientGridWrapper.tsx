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
import { FilterSide } from './FilterSide';

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
  return (
    <div className="flex">
      <FilterSide filters={filters} />
      <div className="flex flex-col   max-w-[calc(100vw-300px)] ml-4">
        <div className="flex w-full h-[40px]">
          <div>sort</div>
        </div>
        <ClientGrid products={products as Product[]} />
        <LoadMore
          initialPageInfo={pageInfo}
          onDataLoadedAction={handleDataLoaded}
          locale={locale}
          handle={params.slug as string}
        />
      </div>
    </div>
  );
};
