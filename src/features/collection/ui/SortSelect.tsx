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
import { usePostHog } from 'posthog-js/react';

export function SortSelect() {
  const posthog = usePostHog();
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
    posthog?.capture('collection_sort_changed', { sort_type: value });
  };

  return (
    <Select value={sort} onValueChange={handleSortChange}>
      <SelectTrigger aria-label={t('sortBy')} className="min-w-[160px] w-auto rounded border-primary bg-white text-black">
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
