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

type Props = {
  filter: Filter;
  showCount?: boolean;
  isSizeFilter?: boolean;
};

export function NuqsButtonFilter({
  filter,
  showCount = true,
  isSizeFilter = false,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const filterKey = filter.id.split('.').pop() || filter.id;
  const [changingFilter, setChangingFilter] = useState<string | null>(null);
  const [selectedValues, setSelectedValues] = useQueryState(
    filterKey,
    parseAsArrayOf(parseAsString, ';')
      .withDefault([])
      .withOptions({ shallow: false, history: 'replace' }),
  );

  useEffect(() => {
    if (!isPending) setChangingFilter(null);
  }, [isPending]);

  const handleFilterChange = (value: FilterValue) => {
    const slug = toFilterSlug(value.label);
    setChangingFilter(slug);
    startTransition(() => {
      const newSelection = selectedValues.includes(slug)
        ? selectedValues.filter((item) => item !== slug)
        : [...selectedValues, slug];
      setSelectedValues(newSelection.length > 0 ? newSelection : null);
    });
  };

  const sortedValues = isSizeFilter
    ? [...filter.values]
    : [...filter.values].sort((a, b) => a.label.localeCompare(b.label));
  return (
    <div className="grid grid-cols-4 gap-2 px-1">
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
              ? value.label.toUpperCase()
              : value.label}
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
