'use client';
import { Button } from '@shared/ui/button';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { PageInfo } from '@shared/lib/shopify/types/storefront.types';

type Props = {
  pageInfo: PageInfo;
  isLoading: boolean;
  onLoadMore: () => void;
};

export function SearchLoadMore({ pageInfo, isLoading, onLoadMore }: Props) {
  const t = useTranslations('LoadMore');
  const [, startTransition] = useTransition();

  if (!pageInfo?.hasNextPage) return null;

  const handleClick = () => {
    if (isLoading) return;
    startTransition(() => onLoadMore());
  };

  return (
    <div className="mt-10 flex flex-col items-center gap-6 p-4 min-h-[100px]">
      {isLoading && (
        <div className="h-4 w-full flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      )}

      <Button
        variant="default"
        onClick={handleClick}
        disabled={isLoading}
        className="px-8 rounded"
      >
        {t('showMore')}
      </Button>
    </div>
  );
}
