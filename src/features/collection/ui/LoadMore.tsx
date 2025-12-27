'use client';

import {
  PageInfo,
  Product,
  ProductFilter,
} from '@shared/lib/shopify/types/storefront.types';
import { Button } from '@shared/ui/button';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { useInView } from 'react-intersection-observer';
import { getCollectionProducts } from '../api/getCollectionProducts';
import { useSearchParams } from 'next/navigation';

export default function LoadMore({
  handle,
  locale,
  onDataLoadedAction,
  initialPageInfo,
}: {
  locale: string;
  handle: string;
  initialPageInfo: PageInfo;
  onDataLoadedAction: (products: Product[], pageInfo: PageInfo) => void;
}) {
  const [pageInfo, setPageInfo] = useState<PageInfo>(initialPageInfo);
  const [isPending, startTransition] = useTransition();
  const { ref, inView } = useInView();
  const searchParams = useSearchParams();

  const handleLoadMore = useCallback(() => {
    if (!pageInfo.hasNextPage || isPending) return;

    startTransition(async () => {
      const filtersFromUrl = searchParams.get('filters');
      let filters: ProductFilter[] = [];
      if (filtersFromUrl) {
        try {
          filters = JSON.parse(filtersFromUrl);
        } catch {
          filters = [];
        }
      }
      const result = await getCollectionProducts({
        info: pageInfo,
        locale,
        slug: handle,
        filters,
      });

      if (result) {
        setPageInfo(result.pageInfo as PageInfo);
        onDataLoadedAction(
          result.products as Product[],
          result.pageInfo as PageInfo,
        );
      }
    });
  }, [pageInfo, isPending, searchParams, locale, handle, onDataLoadedAction]);

  useEffect(() => {
    if (inView && !isPending && pageInfo?.hasNextPage) {
      handleLoadMore();
    }
  }, [inView]);

  return (
    <div className="mt-10 flex flex-col items-center gap-6 p-4 min-h-[100px]">
      <div ref={ref} className="h-4 w-full flex justify-center">
        {isPending && (
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        )}
      </div>

      <Button
        variant="outline"
        onClick={handleLoadMore}
        disabled={isPending || !pageInfo.hasNextPage}
        className="px-8"
      >
        Показать больше
      </Button>
    </div>
  );
}
