'use client';

import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs';
import { useTransition, useState, useEffect, useRef, useMemo } from 'react';
import { Filter } from '@shared/lib/shopify/types/storefront.types';
import { toFilterSlug } from '@shared/lib/filterSlug';
import { Slider } from '@/shared/ui/slider';
import { Button } from '@shared/ui/button';
import { Spinner } from '@/shared/ui/Spinner';
import { useTranslations } from 'next-intl';

type Props = {
  filter: Filter;
  initialFilter?: Filter;
  unit?: string;
};

function parseNumeric(label: string): number | null {
  const match = label.match(/[\d]+([.,]\d+)?/);
  if (!match) return null;
  return parseFloat(match[0].replace(',', '.'));
}

export function NuqsRangeListFilter({ filter, initialFilter, unit = 'см' }: Props) {
  const t = useTranslations('CollectionPage.filters');
  const [isPending, startTransition] = useTransition();
  const filterKey = filter.id.split('.').pop() || filter.id;

  const [selectedValues, setSelectedValues] = useQueryState(
    filterKey,
    parseAsArrayOf(parseAsString, ';')
      .withDefault([])
      .withOptions({ shallow: false, history: 'replace', throttleMs: 500 }),
  );

  const sourceValues = initialFilter ?? filter;

  const numericValues = useMemo(() => {
    return sourceValues.values
      .map((v) => ({
        value: v,
        num: parseNumeric(v.label),
        slug: toFilterSlug(v.label),
      }))
      .filter((v): v is typeof v & { num: number } => v.num !== null)
      .sort((a, b) => a.num - b.num);
  }, [sourceValues.values]);

  const minPossible = numericValues[0]?.num ?? 0;
  const maxPossible = numericValues[numericValues.length - 1]?.num ?? 100;
  const step = numericValues.length >= 2
    ? Math.min(...numericValues.slice(1).map((v, i) => v.num - numericValues[i].num))
    : 1;

  // Derive initial range from selected URL values
  const initialRange = useMemo(() => {
    if (selectedValues.length === 0) return [minPossible, maxPossible] as [number, number];
    const selectedNums = selectedValues
      .map((slug) => numericValues.find((v) => v.slug === slug)?.num)
      .filter((n): n is number => n !== null && n !== undefined);
    if (selectedNums.length === 0) return [minPossible, maxPossible] as [number, number];
    return [Math.min(...selectedNums), Math.max(...selectedNums)] as [number, number];
  }, []);

  const [localMin, setLocalMin] = useState(initialRange[0]);
  const [localMax, setLocalMax] = useState(initialRange[1]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasFilter = selectedValues.length > 0;

  const handleSliderChange = (value: number[]) => {
    setLocalMin(value[0]);
    setLocalMax(value[1]);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const inRange = numericValues
        .filter((v) => v.num >= value[0] && v.num <= value[1])
        .map((v) => v.slug);

      const isFullRange = value[0] <= minPossible && value[1] >= maxPossible;
      startTransition(() => {
        setSelectedValues(isFullRange ? null : inRange.length > 0 ? inRange : null);
      });
    }, 600);
  };

  const clearFilter = () => {
    setLocalMin(minPossible);
    setLocalMax(maxPossible);
    setSelectedValues(null);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (numericValues.length < 2) return null;

  return (
    <div className="flex flex-col mt-5 gap-2 px-0.5">
      <Slider
        value={[localMin, localMax]}
        onValueChange={handleSliderChange}
        min={minPossible}
        max={maxPossible}
        step={step}
        disabled={isPending}
      />
      <div className="flex items-center justify-between text-sm">
        <span>{localMin} {unit}</span>
        <span>{localMax} {unit}</span>
      </div>
      {hasFilter && (
        <Button
          variant="secondary"
          onClick={clearFilter}
          className="w-full"
          disabled={isPending}
        >
          {isPending ? <Spinner /> : t('clear')}
        </Button>
      )}
    </div>
  );
}
