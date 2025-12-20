'use client';
import { PageInfo } from '@shared/lib/shopify/types/storefront.types';
import { Button } from '@shared/ui/button';
import { Loader2 } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { useInView } from 'react-intersection-observer';

export default function LoadMore({ pageInfo }: { pageInfo: PageInfo }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { ref, inView } = useInView();

  const [lastRequestedCursor, setLastRequestedCursor] = useState<string | null>(
    null,
  );

  const handleLoadMore = () => {
    const nextCursor = pageInfo.endCursor;

    if (
      !pageInfo.hasNextPage ||
      !nextCursor ||
      nextCursor === lastRequestedCursor ||
      isPending
    ) {
      return;
    }

    setLastRequestedCursor(nextCursor);

    setTimeout(() => {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('after', nextCursor);
      newSearchParams.delete('before');

      startTransition(() => {
        router.push(`${pathname}?${newSearchParams.toString()}`, {
          scroll: false,
        });
      });
    }, 500);
  };
  useEffect(() => {
    if (inView) {
      handleLoadMore();
    }
  }, [inView, pageInfo.endCursor]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div ref={ref} className="h-10">
        {isPending ? <Loader2 className="animate-spin" /> : null}
      </div>

      <Button onClick={handleLoadMore} disabled={isPending}>
        Load More
      </Button>
    </div>
  );
}
