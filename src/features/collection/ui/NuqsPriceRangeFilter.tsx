'use client';

import { useQueryState, parseAsInteger } from 'nuqs';
import { useTransition, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@shared/ui/button';
import { Spinner } from '@/shared/ui/Spinner';
import { Filter } from '@shared/lib/shopify/types/storefront.types';

type Props = {
  filter: Filter;
};

export function NuqsPriceRangeFilter({ filter }: Props) {
  const t = useTranslations('CollectionPage.filters');
  const [isPending, startTransition] = useTransition();

  const [minPrice, setMinPrice] = useQueryState(
    'minPrice',
    parseAsInteger.withOptions({ shallow: false, startTransition }),
  );
  const [maxPrice, setMaxPrice] = useQueryState(
    'maxPrice',
    parseAsInteger.withOptions({ shallow: false, startTransition }),
  );

  const [min, setMin] = useState(minPrice?.toString() || '');
  const [max, setMax] = useState(maxPrice?.toString() || '');

  useEffect(() => {
    if (minPrice === null) setMin('');
    else setMin(minPrice.toString());
  }, [minPrice]);

  useEffect(() => {
    if (maxPrice === null) setMax('');
    else setMax(maxPrice.toString());
  }, [maxPrice]);

  const applyPriceFilter = () => {
    const newMin = min ? parseInt(min) : null;
    const newMax = max ? parseInt(max) : null;
    setMinPrice(newMin);
    setMaxPrice(newMax);
  };

  const clearPriceFilter = () => {
    setMinPrice(null);
    setMaxPrice(null);
  };

  const minAsNum = min === '' ? null : parseInt(min, 10);
  const maxAsNum = max === '' ? null : parseInt(max, 10);
  const isPristine = minAsNum === minPrice && maxAsNum === maxPrice;
  const hasFilterInUrl = minPrice !== null || maxPrice !== null;

  return (
    <div className="flex flex-col space-y-2">
      <fieldset disabled={isPending}>
        <div className="flex items-center space-x-2 px-0.5 pt-1">
          <input
            type="number"
            placeholder={t('min')}
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="w-full border-gray-300 rounded-none shadow-sm p-2"
          />
          <span>-</span>
          <input
            type="number"
            placeholder={t('max')}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="w-full border-gray-300 rounded-none shadow-sm p-2"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={applyPriceFilter}
            disabled={isPristine || isPending}
            className="w-full"
          >
            {isPending ? <Spinner /> : t('apply')}
          </Button>
          {hasFilterInUrl && (
            <Button
              variant="secondary"
              onClick={clearPriceFilter}
              className="w-full"
              disabled={isPending}
            >
              {isPending ? <Spinner /> : t('clear')}
            </Button>
          )}
        </div>
      </fieldset>
    </div>
  );
}
