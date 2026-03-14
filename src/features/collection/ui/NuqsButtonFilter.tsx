'use client';

import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs';
import { useState, useTransition, useEffect } from 'react';
import {
  Filter,
  FilterValue,
} from '@shared/lib/shopify/types/storefront.types';
import { Button } from '@shared/ui/button';
import { cn } from '@shared/lib/utils';
import { toFilterSlug } from '@shared/lib/filterSlug';
import { Spinner } from '@shared/ui/Spinner';
import he from 'he';
import { usePostHog } from 'posthog-js/react';

type Props = {
  filter: Filter;
  initialFilter?: Filter;
  showCount?: boolean;
  isSizeFilter?: boolean;
};

export function NuqsButtonFilter({
  filter,
  initialFilter,
  showCount = true,
  isSizeFilter = false,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const posthog = usePostHog();
  const filterKey = filter.id.split('.').pop() || filter.id;
  const [changingFilter, setChangingFilter] = useState<string | null>(null);
  const [selectedValues, setSelectedValues] = useQueryState(
    filterKey,
    parseAsArrayOf(parseAsString, ';')
      .withDefault([])
      .withOptions({ shallow: false, history: 'replace', throttleMs: 500 }),
  );

  useEffect(() => {
    if (!isPending) setChangingFilter(null);
  }, [isPending]);

  const handleFilterChange = (value: FilterValue) => {
    const slug = toFilterSlug(value.label);
    const isSelected = selectedValues.includes(slug);
    posthog?.capture('collection_filter_applied', {
      filter_type: isSizeFilter ? 'size' : filterKey,
      filter_name: filterKey,
      filter_value: slug,
      action: isSelected ? 'removed' : 'added',
    });
    setChangingFilter(slug);
    startTransition(() => {
      const newSelection = isSelected
        ? selectedValues.filter((item) => item !== slug)
        : [...selectedValues, slug];
      setSelectedValues(newSelection.length > 0 ? newSelection : null);
    });
  };

  const displayValues = (initialFilter ?? filter).values.map((v) => {
    const live = filter.values.find((fv) => fv.label === v.label);
    if (v.label === 'L/XL') {
      console.log(`[CLIENT DEBUG L/XL] label: ${v.label}, facetedCount: ${live?.count}, baseCount: ${v.count}`);
    }
    return live ?? { ...v, count: 0 };
  });

  const sortedValues = isSizeFilter
    ? displayValues
    : [...displayValues].sort((a, b) => a.label.localeCompare(b.label));
  return (
    <div className="grid grid-cols-4 gap-2 p-1">
      {sortedValues.map((value) => {
        const isSelected = selectedValues.includes(toFilterSlug(value.label));
        const isChanging = changingFilter === toFilterSlug(value.label);
        return (
          <Button
            key={value.label}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange(value)}
            disabled={
              (value.count === 0 && !isSelected) || (isPending && isChanging)
            }
            className={cn(
              'rounded h-9 text-sm font-medium relative border-primary border capitalize',
              {
                'bg-primary text-white ring-2 ring-offset-1 ring-primary':
                  isSelected,
              },
            )}
          >
            {filter.id === 'filter.p.m.custom.rozmir'
              ? he.decode(value.label).toUpperCase()
              : he.decode(value.label)}
            {showCount && (
              <span className="text-muted-foreground">{value.count}</span>
            )}
            {isPending && isChanging && (
              <Spinner className="absolute max-h-3 max-w-3 top-[0.5px] right-[0.5px] " />
            )}
          </Button>
        );
      })}
    </div>
  );
}
