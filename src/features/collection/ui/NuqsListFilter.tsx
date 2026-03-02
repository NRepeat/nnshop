'use client';

import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs';
import { useTransition, useState } from 'react';
import {
  Filter,
  FilterValue,
} from '@shared/lib/shopify/types/storefront.types';
import { cn } from '@shared/lib/utils';
import { toFilterSlug } from '@shared/lib/filterSlug';
import { Checkbox } from '@shared/ui/checkbox';
import { Spinner } from '@/shared/ui/Spinner';

type Props = {
  filter: Filter;
  initialFilter?: Filter;
};

export function NuqsListFilter({ filter, initialFilter }: Props) {
  const [isPending, startTransition] = useTransition();
  const [changingFilter, setChangingFilter] = useState<string | null>(null);
  const filterKey = filter.id.split('.').pop() || filter.id;

  const [selectedValues, setSelectedValues] = useQueryState(
    filterKey,
    parseAsArrayOf(parseAsString, ';')
      .withDefault([])
      .withOptions({ shallow: false, history: 'replace' }),
  );

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

  const displayValues = (initialFilter ?? filter).values.map((v) => {
    const live = filter.values.find((fv) => fv.label === v.label);
    return live ?? { ...v, count: 0 };
  });

  const shouldCollapse = displayValues.length > 6;

  return (
    <div
      className={cn({
        'max-h-56 overflow-y-auto custom-scroll pr-2': shouldCollapse,
      })}
    >
      <ul className="space-y-2">
        {displayValues.map((value) => {
            const isChecked = selectedValues.includes(toFilterSlug(value.label));
            const isChanging = changingFilter === toFilterSlug(value.label);

            return (
              <li key={value.label} className="cursor-pointer">
                <label className="flex items-center space-x-2 cursor-pointer">
                  {isPending && isChanging ? (
                    <Spinner />
                  ) : (
                    <Checkbox
                      disabled={value.count === 0 && !isChecked}
                      checked={isChecked}
                      onCheckedChange={() => handleFilterChange(value)}
                      className='h-6 w-6 cursor-pointer'
                    />
                  )}
                  <span
                    className={cn('text-md', {
                      'text-muted-foreground': value.count === 0 && !isChecked,
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
