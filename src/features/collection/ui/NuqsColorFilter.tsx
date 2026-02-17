'use client';

import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs';
import {
  Filter,
  FilterValue,
} from '@shared/lib/shopify/types/storefront.types';
import { cn } from '@shared/lib/utils';
import { COLOR_MAP } from '@widgets/product-view/ui/collors';

type Props = {
  filter: Filter;
};



export function NuqsColorFilter({ filter }: Props) {
  const filterKey = filter.id.split('.').pop() || filter.id;

  const [selectedValues, setSelectedValues] = useQueryState(
    filterKey,
    parseAsArrayOf(parseAsString, ';')
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
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-1">
      {[...filter.values]
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((value) => {
          const isChecked = selectedValues.includes(value.label);
          return (
            <label
              key={value.label}
              className={cn('flex items-center space-x-2', {
                'text-muted-foreground': value.count === 0 && !isChecked,
                'cursor-pointer': value.count > 0 || isChecked,
                'pointer-events-none opacity-50': value.count === 0 && !isChecked,
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
