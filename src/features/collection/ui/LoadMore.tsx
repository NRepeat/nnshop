'use client';

import { PageInfo, Product } from '@shared/lib/shopify/types/storefront.types';
import { Button } from '@shared/ui/button';
import { Loader2 } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { useInView } from 'react-intersection-observer';
import { getCollectionProducts } from '../api/getCollectionProducts';

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

  const handleLoadMore = () => {
    if (!initialPageInfo.hasNextPage || isPending) return;

    startTransition(async () => {
      const result = await getCollectionProducts({
        info: pageInfo,
        locale,
        slug: handle,
      });

      if (result) {
        setPageInfo(result.pageInfo as PageInfo);
        onDataLoadedAction(
          result.products as Product[],
          result.pageInfo as PageInfo,
        );
      }
    });
  };

  useEffect(() => {
    if (inView && !isPending && pageInfo?.hasNextPage) {
      handleLoadMore();
    }
  }, [inView]);

  return (
    <div className="mt-10 flex flex-col items-center gap-4 p-4 min-h-[100px]">
      <div ref={ref} className="h-4 w-full flex justify-center">
        {isPending && (
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        )}
      </div>

      <Button
        variant="outline"
        onClick={handleLoadMore}
        disabled={isPending}
        className="px-8"
      >
        Показать больше
      </Button>
    </div>
  );
}
