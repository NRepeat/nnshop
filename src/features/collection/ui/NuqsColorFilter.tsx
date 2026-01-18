'use client';

import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs';
import {
  Filter,
  FilterValue,
} from '@shared/lib/shopify/types/storefront.types';
import { cn } from '@shared/lib/utils';

type Props = {
  filter: Filter;
};

import { colorMap } from './colorMap';

export function NuqsColorFilter({ filter }: Props) {
  const filterKey = filter.id.split('.').pop() || filter.id;

  const [selectedValues, setSelectedValues] = useQueryState(
    filterKey,
    parseAsArrayOf(parseAsString)
      .withDefault([])
      .withOptions({ shallow: false, history: 'replace' }),
  );

  const handleFilterChange = (value: FilterValue) => {
    const newSelection = selectedValues.includes(value.label)
      ? selectedValues.filter((item) => item !== value.label)
      : [...selectedValues, value.label];
    setSelectedValues(newSelection.length > 0 ? newSelection : null);
  };

  return (
    <div className="grid grid-cols-2 gap-x-2 gap-y-2.5 p-1">
      {[...filter.values]
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((value) => {
          const isChecked = selectedValues.includes(value.label);
          return (
            <label
              key={value.label}
              className={cn('flex items-center space-x-2 cursor-pointer', {
                'text-muted-foreground line-through': value.count === 0,
              })}
              onClick={() => handleFilterChange(value)}
            >
              <span
                className={cn(
                  'w-6 h-6 border relative',
                  {
                    'border-gray-300': value.count > 0 && !isChecked,
                    'border-muted': value.count === 0,
                    'ring-2 ring-offset-2 ring-primary': isChecked,
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
