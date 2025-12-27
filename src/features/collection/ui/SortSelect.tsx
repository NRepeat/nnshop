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
import { useTransition, useState, useEffect } from 'react';
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

  useEffect(() => {
    const sortFromUrl = searchParams.get('sort') || 'trending';
    setCurrentSort(sortFromUrl);
  }, [searchParams]);

  const handleSortChange = (value: string) => {
    setCurrentSort(value);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (value && value !== 'trending') {
      // "trending" could be the default, so no need to put it in URL
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
      <SelectTrigger className="w-[160px]  md:w-[210px] rounded-none">
        <SelectValue placeholder={t('sortBy')} />
      </SelectTrigger>
      <SelectContent className="rounded-none">
        <SelectGroup>
          <SelectLabel>{t('sortBy')}</SelectLabel>
          <SelectItem className="rounded-none" value="trending">
            {t('trending')}
          </SelectItem>
          <SelectItem className="rounded-none" value="price-asc">
            {t('priceLowToHigh')}
          </SelectItem>
          <SelectItem className="rounded-none" value="price-desc">
            {t('priceHighToLow')}
          </SelectItem>
          <SelectItem className="rounded-none" value="created-desc">
            {t('newest')}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
