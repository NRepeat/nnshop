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
};

export function NuqsButtonFilter({ filter }: Props) {
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
    <div className="flex flex-wrap gap-2">
      {[...filter.values]
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((value) => {
          const isSelected = selectedValues.includes(value.label);
          console.log('value', value, selectedValues, isSelected);
          return (
            <Button
              key={value.label}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange(value)}
              disabled={value.count === 0}
              className={cn('flex gap-x-2', {
                'bg-black text-white': isSelected,
              })}
            >
              {value.label}
              <span className="text-muted-foreground">{value.count}</span>
            </Button>
          );
        })}
    </div>
  );
}
