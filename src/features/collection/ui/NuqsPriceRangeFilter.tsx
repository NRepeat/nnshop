'use client';

import { useQueryState, parseAsInteger } from 'nuqs';
import { useTransition, useState, useEffect, useRef } from 'react';
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPriceFilter = () => {
    setMinPrice(null);
    setMaxPrice(null);
  };

  const hasFilterInUrl = minPrice !== null || maxPrice !== null;

  const handleSliderChange = (value: number[]) => {
    setMin(value[0]);
    setMax(value[1]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setMinPrice(value[0]);
      setMaxPrice(value[1]);
    }, 600);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col mt-5 gap-2 px-0.5">
      <Slider
        value={[min, max]}
        onValueChange={handleSliderChange}
        min={minPossible}
        max={maxPossible}
        step={1}
        disabled={isPending}
      />
      <div className="flex items-center justify-between">
        <span>{min}</span>
        <span>{max}</span>
      </div>
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
  );
}
