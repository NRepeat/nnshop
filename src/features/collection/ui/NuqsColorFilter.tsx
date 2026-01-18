'use client';

import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs';
import { useTransition, useState } from 'react';
import {
  Filter,
  FilterValue,
} from '@shared/lib/shopify/types/storefront.types';
import { cn } from '@shared/lib/utils';
import { Checkbox } from '@shared/ui/checkbox';
import { Spinner } from '@/shared/ui/Spinner';

type Props = {
  filter: Filter;
};

import { colorMap } from './colorMap';

export function NuqsColorFilter({ filter }: Props) {
  const [isPending, startTransition] = useTransition();
  const [changingFilter, setChangingFilter] = useState<string | null>(null);
  const filterKey = filter.id.split('.').pop() || filter.id;

  const [selectedValues, setSelectedValues] = useQueryState(
    filterKey,
    parseAsArrayOf(parseAsString)
      .withDefault([])
      .withOptions({ shallow: false, history: 'replace' }),
  );

  const handleFilterChange = (value: FilterValue) => {
    setChangingFilter(value.label);
    startTransition(() => {
      const newSelection = selectedValues.includes(value.label)
        ? selectedValues.filter((item) => item !== value.label)
        : [...selectedValues, value.label];
      setSelectedValues(newSelection.length > 0 ? newSelection : null);
    });
  };

  return (
    <div className="grid grid-cols-2 gap-x-2 gap-y-2">
      {[...filter.values]
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((value) => {
          const isChecked = selectedValues.includes(value.label);
          const isChanging = changingFilter === value.label;
          return (
            <label
              key={value.label}
              className={cn('flex items-center space-x-2 cursor-pointer', {
                'text-muted-foreground line-through': value.count === 0,
              })}
            >
              {isPending && isChanging ? (
                <Spinner />
              ) : (
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => handleFilterChange(value)}
                />
              )}
              <span
                className={cn(
                  'min-w-6 h-6 border',
                  {
                    'border-gray-300': value.count > 0,
                    'border-muted': value.count === 0,
                  },
                  colorMap[value.label] || 'bg-gray-200',
                )}
              ></span>
              <span>
                {value.label} ({value.count})
              </span>
            </label>
          );
        })}
    </div>
  );
}
