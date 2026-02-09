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

export function NuqsListFilter({ filter }: Props) {
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

  const shouldCollapse = filter.values.length > 6;

  return (
    <div
      className={cn({
        'max-h-56 overflow-y-auto custom-scroll pr-2': shouldCollapse,
      })}
    >
      <ul className="space-y-2">
        {[...filter.values]
          // .sort((a, b) => a.label.localeCompare(b.label))
          .map((value) => {
            const isChecked = selectedValues.includes(value.label);
            const isChanging = changingFilter === value.label;

            return (
              <li key={value.label} className="cursor-pointer">
                <label className="flex items-center space-x-2 cursor-pointer">
                  {isPending && isChanging ? (
                    <Spinner />
                  ) : (
                    <Checkbox
                      disabled={false} // value.count will always be > 0 now
                      checked={isChecked}
                      onCheckedChange={() => handleFilterChange(value)}
                    />
                  )}
                  <span
                    className={cn({
                      // 'text-muted-foreground line-through': value.count === 0, // No longer needed
                    })}
                  >
                    {value.label} ({value.count})
                  </span>
                </label>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
