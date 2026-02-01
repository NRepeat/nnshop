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
      <SelectTrigger className="w-[160px]  md:w-[160px] min-w-fit rounded-md">
        <div className="flex items-center gap-x-2">
          <SelectValue placeholder={t('sortBy')} />
          {/*{currentSort === 'price-asc' && <ChevronUpIcon className="size-4" />}
          {currentSort === 'price-desc' && (
            <ChevronDownIcon className="size-4" />
          )}
          {currentSort === 'created-desc' && (
            <ChevronDownIcon className="size-4" />
          )}*/}
        </div>
      </SelectTrigger>
      <SelectContent className="rounded-md">
        <SelectGroup>
          <SelectLabel>{t('sortBy')}</SelectLabel>
          <SelectItem className="rounded-md" value="trending">
            {t('trending')}
          </SelectItem>
          <SelectItem className="rounded-md" value="price-asc">
            {t('priceLowToHigh')}
          </SelectItem>
          <SelectItem className="rounded-md" value="price-desc">
            {t('priceHighToLow')}
          </SelectItem>
          <SelectItem className="rounded-md" value="created-desc">
            {t('newest')}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
