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
import { useQueryState, parseAsString } from 'nuqs';
import { useTranslations } from 'next-intl';

export function SortSelect() {
  const t = useTranslations('CollectionPage.sort');

  const [sort, setSort] = useQueryState(
    'sort',
    parseAsString.withDefault('trending').withOptions({
      shallow: false,
      history: 'replace',
      scroll: false,
      throttleMs: 500,
    }),
  );

  const handleSortChange = (value: string) => {
    setSort(value === 'trending' ? null : value);
  };

  return (
    <Select value={sort} onValueChange={handleSortChange}>
      <SelectTrigger aria-label={t('sortBy')} className="w-[160px] md:w-[160px] min-w-fit rounded border-primary bg-white text-black ">
        <SelectValue placeholder={t('sortBy')} />
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
