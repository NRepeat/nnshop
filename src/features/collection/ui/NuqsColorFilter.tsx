'use client';

import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs';
import { useState, useTransition, useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import {
  Filter,
  FilterValue,
} from '@shared/lib/shopify/types/storefront.types';
import { cn } from '@shared/lib/utils';
import { COLOR_MAP } from '@widgets/product-view/ui/collors';
import { toFilterSlug } from '@shared/lib/filterSlug';
import he from 'he';

type Props = {
  filter: Filter;
  initialFilter?: Filter;
};



export function NuqsColorFilter({ filter, initialFilter }: Props) {
  const posthog = usePostHog();
  const filterKey = filter.id.split('.').pop() || filter.id;
  const [isPending, startTransition] = useTransition();
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
      filter_type: 'color',
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
    return live ?? { ...v, count: 0 };
  });

  const shouldScroll = displayValues.length > 8;

  return (
    <div className={cn({ 'relative': shouldScroll })}>
    <div className={cn('pr-1', { 'max-h-56 overflow-y-scroll custom-scroll': shouldScroll })}>
    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 p-1">
      {[...displayValues]
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
                {he.decode(value.label)} ({value.count})
              </span>
            </label>
          );
        })}
    </div>
    </div>
    {shouldScroll && (
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
    )}
    </div>
  );
}
