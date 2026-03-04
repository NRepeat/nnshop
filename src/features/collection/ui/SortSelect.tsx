'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@shared/ui/button';

type SortSelectProps = {
  defaultValue?: string;
};

export function SortSelect({ defaultValue }: SortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('CollectionPage.sort');

  const [currentSort, setCurrentSort] = useState(defaultValue || 'trending');

  const handleSortChange = (value: string) => {
    setCurrentSort(value);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (value && value !== 'trending') {
      newSearchParams.set('sort', value);
    } else {
      newSearchParams.delete('sort');
    }

    startTransition(() => {
      router.replace(`${pathname}?${newSearchParams.toString()}`, {
        scroll: false,
      });
    });
  };

  return (
    <Select
      value={currentSort}
      onValueChange={handleSortChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-[160px]  md:w-[160px] min-w-fit rounded">
        <Button asChild variant={'outline'} className="flex items-center gap-x-2 border bg-primary">
          <SelectValue placeholder={t('sortBy')} />
        </Button>
      </SelectTrigger>
      <SelectContent className="rounded">
        <SelectGroup>
          <SelectLabel>{t('sortBy')}</SelectLabel>
          <SelectItem className="rounded" value="trending">
            {t('trending')}
          </SelectItem>
          <SelectItem className="rounded" value="price-asc">
            {t('priceLowToHigh')}
          </SelectItem>
          <SelectItem className="rounded" value="price-desc">
            {t('priceHighToLow')}
          </SelectItem>
          <SelectItem className="rounded" value="created-desc">
            {t('newest')}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
