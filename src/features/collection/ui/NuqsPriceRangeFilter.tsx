'use client';

import { useQueryState, parseAsInteger } from 'nuqs';
import { useTransition, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@shared/ui/button';
import { Spinner } from '@/shared/ui/Spinner';
import { Filter } from '@shared/lib/shopify/types/storefront.types';
import { Slider } from '@/shared/ui/slider';

type Props = {
  filter: Filter;
  initialFilterPrice: Filter | undefined;
};

export function NuqsPriceRangeFilter({ filter, initialFilterPrice }: Props) {
  const t = useTranslations('CollectionPage.filters');
  const [isPending] = useTransition();
  const [minPrice, setMinPrice] = useQueryState(
    'minPrice',
    parseAsInteger.withOptions({ shallow: false }),
  );
  const [maxPrice, setMaxPrice] = useQueryState(
    'maxPrice',
    parseAsInteger.withOptions({ shallow: false }),
  );

  const price = initialFilterPrice
    ? JSON.parse(initialFilterPrice.values[0].input)
    : null;
  const minPossible = Math.floor(price.price.min);
  const maxPossible = Math.ceil(price.price.max);

  const [min, setMin] = useState(minPrice ?? minPossible);
  const [max, setMax] = useState(maxPrice ?? maxPossible);

  // useEffect(() => {
  //   if (minPrice === null) setMin(minPossible);
  //   else setMin(minPrice);
  // }, [minPrice, minPossible]);

  // useEffect(() => {
  //   if (maxPrice === null) setMax(maxPossible);
  //   else setMax(maxPrice);
  // }, [maxPrice, maxPossible]);

  const applyPriceFilter = () => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const clearPriceFilter = () => {
    setMinPrice(null);
    setMaxPrice(null);
  };
  const isPristine = min === minPrice && max === maxPrice;
  const hasFilterInUrl = minPrice !== null || maxPrice !== null;
  return (
    <div className="flex flex-col mt-5 gap-2 px-0.5">
      <Slider
        value={[min, max]}
        onValueChange={(value) => {
          setMin(value[0]);
          setMax(value[1]);
        }}
        min={minPossible}
        max={maxPossible}
        step={1}
        disabled={isPending}
      />
      <div className="flex items-center justify-between">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          onClick={applyPriceFilter}
          variant={'outline'}
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
    </div>
  );
}
