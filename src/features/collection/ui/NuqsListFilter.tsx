'use client';

import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs';
import { useTransition, useState, useRef, useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import { ChevronDown } from 'lucide-react';
import {
  Filter,
  FilterValue,
} from '@shared/lib/shopify/types/storefront.types';
import { cn } from '@shared/lib/utils';
import { toFilterSlug } from '@shared/lib/filterSlug';
import { Checkbox } from '@shared/ui/checkbox';
import { Spinner } from '@/shared/ui/Spinner';
import he from 'he';

type Props = {
  filter: Filter;
  initialFilter?: Filter;
};

export function NuqsListFilter({ filter, initialFilter }: Props) {
  const posthog = usePostHog();
  const [isPending, startTransition] = useTransition();
  const [changingFilter, setChangingFilter] = useState<string | null>(null);
  const filterKey = filter.id.split('.').pop() || filter.id;

  const [selectedValues, setSelectedValues] = useQueryState(
    filterKey,
    parseAsArrayOf(parseAsString, ';')
      .withDefault([])
      .withOptions({ shallow: false, history: 'replace', throttleMs: 500 }),
  );

  const handleFilterChange = (value: FilterValue) => {
    const slug = toFilterSlug(value.label);
    const isSelected = selectedValues.includes(slug);
    posthog?.capture('collection_filter_applied', {
      filter_type: 'list',
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

  const shouldCollapse = displayValues.length > 6;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    if (!shouldCollapse) return;
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setIsAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 4);
    check();
    el.addEventListener('scroll', check);
    return () => el.removeEventListener('scroll', check);
  }, [shouldCollapse, displayValues.length]);

  return (
    <div className={cn({ 'relative': shouldCollapse })}>
      <div
        ref={scrollRef}
        className={cn({
          'max-h-56 overflow-y-scroll custom-scroll pr-2': shouldCollapse,
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
                    {he.decode(value.label)} ({value.count})
                  </span>
                </label>
              </li>
            );
          })}
      </ul>
      </div>
      {shouldCollapse && !isAtBottom && (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent flex items-end justify-center pb-0.5">
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
