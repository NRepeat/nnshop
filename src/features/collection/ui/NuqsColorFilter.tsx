'use client';

import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs';
import { useState, useTransition, useEffect } from 'react';
import {
  Filter,
  FilterValue,
} from '@shared/lib/shopify/types/storefront.types';
import { cn } from '@shared/lib/utils';
import { COLOR_MAP } from '@widgets/product-view/ui/collors';
import { toFilterSlug } from '@shared/lib/filterSlug';

type Props = {
  filter: Filter;
};



export function NuqsColorFilter({ filter }: Props) {
  const filterKey = filter.id.split('.').pop() || filter.id;
  const [isPending, startTransition] = useTransition();
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

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 p-1">
      {[...filter.values]
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((value) => {
          const isChecked = selectedValues.includes(toFilterSlug(value.label));
          const isChanging = changingFilter === toFilterSlug(value.label);
          return (
            <label
              key={value.label}
              className={cn('flex items-center space-x-2', {
                'text-muted-foreground': value.count === 0 && !isChecked,
                'cursor-pointer': value.count > 0 || isChecked,
                'pointer-events-none opacity-50': (value.count === 0 && !isChecked) || (isPending && isChanging),
              })}
              onClick={() => (value.count > 0 || isChecked) && handleFilterChange(value)}
            >
              <span
                className={cn(
                  'w-6 h-6 rounded-full border relative',
                  {
                    'border-gray-300': value.count > 0 && !isChecked,
                    'border-muted': value.count === 0,
                    'ring-2 ring-offset-2 ring-primary': isChecked,
                  },
                  COLOR_MAP[value.label] || 'bg-gray-200',
                )}
              >
                {isPending && isChanging && (
                  <span className="absolute -inset-1 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                )}
              </span>
              <span className="capitalize">
                {value.label} ({value.count})
              </span>
            </label>
          );
        })}
    </div>
  );
}
