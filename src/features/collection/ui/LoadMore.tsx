'use client';

import { PageInfo } from '@shared/lib/shopify/types/storefront.types';
import { Button } from '@shared/ui/button';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryState, parseAsInteger } from 'nuqs';
import { useEffect, useTransition } from 'react';
import { useInView } from 'react-intersection-observer';

export default function LoadMore({
  handle,
  initialPageInfo,
}: {
  handle: string;
  initialPageInfo: PageInfo;
  // unused in new logic, kept for type compatibility during refactor
  locale?: string;
  onDataLoadedAction?: any;
  gender?: string;
}) {
  const t = useTranslations('LoadMore');
  const [isPending, startTransition] = useTransition();
  const { ref, inView } = useInView();

  const [limit, setLimit] = useQueryState(
    'limit',
    parseAsInteger.withDefault(20).withOptions({
      shallow: false,
      history: 'replace',
      scroll: false,
    }),
  );

  const handleLoadMore = () => {
    if (isPending || !initialPageInfo?.hasNextPage) return;
    
    startTransition(async () => {
      const newLimit = limit + 20;
      await setLimit(newLimit);
    });
  };

  // useEffect(() => {
  //   if (inView && !isPending && initialPageInfo?.hasNextPage) {
  //     handleLoadMore();
  //   }
  // }, [inView, isPending, initialPageInfo?.hasNextPage]);

  if (!initialPageInfo?.hasNextPage) return null;

  return (
    <div className="mt-10 flex flex-col items-center gap-6 p-4 min-h-[100px]">
      {isPending && (
        <div className="h-4 w-full flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      )}

      <Button
        variant="default"
        onClick={handleLoadMore}
        disabled={isPending}
        className="px-8 rounded"
      >
        {t('showMore')}
      </Button>
    </div>
  );
}
