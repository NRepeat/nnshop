'use client';

import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs';
import { useTransition } from 'react';
import {
  Filter,
  FilterValue,
} from '@shared/lib/shopify/types/storefront.types';
import { Button } from '@shared/ui/button';
import { cn } from '@shared/lib/utils';

type Props = {
  filter: Filter;
  showCount?: boolean;
};

export function NuqsButtonFilter({ filter, showCount = true }: Props) {
  const [, startTransition] = useTransition();
  const filterKey = filter.id.split('.').pop() || filter.id;

  const [selectedValues, setSelectedValues] = useQueryState(
    filterKey,
    parseAsArrayOf(parseAsString)
      .withDefault([])
      .withOptions({ shallow: false, history: 'replace' }),
  );

  const handleFilterChange = (value: FilterValue) => {
    startTransition(() => {
      const newSelection = selectedValues.includes(value.label)
        ? selectedValues.filter((item) => item !== value.label)
        : [...selectedValues, value.label];
      setSelectedValues(newSelection.length > 0 ? newSelection : null);
    });
  };

  return (
    <div className="grid grid-cols-3 gap-2 ">
      {[...filter.values]
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((value) => {
          const isSelected = selectedValues.includes(value.label);
          return (
            <Button
              key={value.label}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange(value)}
              disabled={false} // value.count will always be > 0 now
              className={cn('flex gap-x-2 w-full', {
                'bg-black text-white': isSelected,
              })}
            >
              {value.label}
              {showCount && (
                <span className="text-muted-foreground">{value.count}</span>
              )}
            </Button>
          );
        })}
    </div>
  );
}
