'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/ui/accordion';
import { Button } from '@shared/ui/button';
import { useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import {
  Filter,
  FilterValue,
} from '@shared/lib/shopify/types/storefront.types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ColorFilter } from './ColorFilter';
import { createFilterUrl, createPriceUrl } from '../actions';
import { Spinner } from '@/shared/ui/Spinner';
import { cn } from '@shared/lib/utils';

type Props = {
  filters: Filter[];
};

type ActiveFiltersState = {
  key: string;
  value: string;
  filterId: string;
  filterValue: FilterValue;
}[];

export function CollectionFilters({ filters }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [changingFilter, setChangingFilter] = useState<string | null>(null);

  const activeFilters: ActiveFiltersState = [];
  searchParams.forEach((value, key) => {
    if (key !== 'minPrice' && key !== 'maxPrice') {
      const values = value.split(',');
      const filterDefinition = filters.find((f) => f.id.endsWith(`.${key}`));
      if (filterDefinition) {
        values.forEach((v) => {
          const filterValue = filterDefinition.values.find(
            (fv) => fv.label === v,
          );
          if (filterValue) {
            activeFilters.push({
              key: key,
              value: v,
              filterId: filterDefinition.id,
              filterValue: filterValue,
            });
          }
        });
      }
    }
  });

  const handleFilterChange = async (
    filterId: string,
    filterValue: FilterValue,
  ) => {
    setChangingFilter(filterValue.label);
    const currentSearchParams = searchParams.toString();
    const newUrl = await createFilterUrl(
      currentSearchParams,
      pathname,
      filterId,
      filterValue,
    );
    startTransition(() => {
      router.replace(newUrl, { scroll: false });
    });
  };

  const handlePriceChange = async (min: string, max: string) => {
    setChangingFilter('price');
    const currentSearchParams = searchParams.toString();
    const newUrl = await createPriceUrl(
      currentSearchParams,
      pathname,
      min,
      max,
    );
    startTransition(() => {
      router.replace(newUrl, { scroll: false });
    });
  };

  const sortedFilters = filters;

  return (
    <div className="w-full relative">
      <Accordion
        type="multiple"
        className="pr-1 w-full  max-h-[calc(100vh-130px)] custom-scroll"
        defaultValue={filters.map((filter) => filter.id)}
      >
        {sortedFilters.map((filter) => {
          return (
            <AccordionItem key={filter.id} value={filter.id}>
              <AccordionTrigger className="font-medium cursor-pointer w-full">
                {filter.label}
              </AccordionTrigger>
              <AccordionContent>
                {filter.id === 'filter.p.m.custom.color' ? (
                  <ColorFilter
                    values={filter.values}
                    activeFilters={activeFilters}
                    onFilterChange={(value) =>
                      handleFilterChange(filter.id, value)
                    }
                    isPending={isPending}
                    changingFilter={changingFilter}
                  />
                ) : filter.type === 'LIST' ? (
                  <ul className="space-y-2">
                    {[...filter.values]
                      .sort((a, b) => a.label.localeCompare(b.label))
                      .map((value) => {
                        const isChecked = activeFilters.some(
                          (af) =>
                            af.filterId === filter.id &&
                            af.value === value.label,
                        );
                        const isChanging = changingFilter === value.label;
                        const isDisabled = isPending || value.count === 0;
                        return (
                          <li key={value.label} className="cursor-pointer">
                            <label className="flex items-center space-x-2  cursor-pointer">
                              {isPending && isChanging ? (
                                <Spinner />
                              ) : (
                                <input
                                  type="checkbox"
                                  className="rounded"
                                  checked={!!isChecked}
                                  onChange={() =>
                                    handleFilterChange(filter.id, value)
                                  }
                                  disabled={isDisabled}
                                />
                              )}
                              <span
                                className={cn({
                                  'text-muted-foreground line-through':
                                    value.count === 0,
                                })}
                              >
                                {value.label} ({value.count})
                              </span>
                            </label>
                          </li>
                        );
                      })}
                  </ul>
                ) : filter.type === 'PRICE_RANGE' ? (
                  <PriceRangeFilter
                    filter={filter}
                    onPriceChange={handlePriceChange}
                    isPending={isPending}
                    changingFilter={changingFilter}
                  />
                ) : (
                  filter.type
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

function PriceRangeFilter({
  onPriceChange,
  isPending,
  changingFilter,
}: {
  filter: Filter;
  onPriceChange: (min: string, max: string) => void;
  isPending: boolean;
  changingFilter: string | null;
}) {
  const t = useTranslations('CollectionPage.filters');
  const searchParams = useSearchParams();

  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [appliedMin, setAppliedMin] = useState('');
  const [appliedMax, setAppliedMax] = useState('');

  useEffect(() => {
    const minFromUrl = searchParams.get('minPrice') || '';
    const maxFromUrl = searchParams.get('maxPrice') || '';

    setAppliedMin(minFromUrl);
    setAppliedMax(maxFromUrl);
    setMin(minFromUrl);
    setMax(maxFromUrl);
  }, [searchParams]);

  const applyPriceFilter = () => {
    onPriceChange(min, max);
  };

  const clearPriceFilter = () => {
    onPriceChange('', '');
  };

  const isApplied = min === appliedMin && max === appliedMax;
  const hasFilterInUrl = !!(appliedMin || appliedMax);
  const isChanging = changingFilter === 'price';

  return (
    <div className="flex flex-col space-y-2">
      <fieldset disabled={isPending}>
        <div className="flex items-center space-x-2 px-0.5 pt-1">
          <input
            type="number"
            placeholder={t('min')}
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="w-full border-gray-300 rounded-none shadow-sm p-2"
          />
          <span>-</span>
          <input
            type="number"
            placeholder={t('max')}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="w-full border-gray-300 rounded-none shadow-sm p-2"
          />
        </div>
        <div className="flex items-center space-x-2">
          {isApplied && hasFilterInUrl ? (
            <Button
              variant="secondary"
              onClick={clearPriceFilter}
              className="w-full"
              disabled={isPending}
            >
              {isPending && isChanging ? <Spinner /> : t('clear')}
            </Button>
          ) : (
            <Button
              onClick={applyPriceFilter}
              disabled={isApplied || isPending}
              className="w-full"
            >
              {isPending && isChanging ? <Spinner /> : t('apply')}
            </Button>
          )}
        </div>
      </fieldset>
    </div>
  );
}
