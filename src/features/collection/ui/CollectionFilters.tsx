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

type Props = {
  filters: Filter[];
};

type ActiveFiltersState = {
  [key: string]: string[] | string;
};

export function CollectionFilters({ filters }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeFilters, setActiveFilters] = useState<ActiveFiltersState>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const newActiveFilters: ActiveFiltersState = {};
    searchParams.forEach((value, key) => {
      newActiveFilters[key] = value.includes(',') ? value.split(',') : [value];
    });
    setActiveFilters(newActiveFilters);
  }, [searchParams]);

  const handleFilterChange = async (
    filterId: string,
    filterValue: FilterValue,
  ) => {
    const currentSearchParams = searchParams.toString();
    const newUrl = await createFilterUrl(
      currentSearchParams,
      pathname,
      filterId,
      filterValue,
    );
    // startTransition(() => {
    //   router.replace(newUrl, { scroll: false });
    // });
  };

  const handlePriceChange = async (min: string, max: string) => {
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
    <div className="w-full  ">
      <Accordion
        type="multiple"
        className="pr-1 w-full  max-h-[calc(100vh-130px)] custom-scroll"
        defaultValue={filters.map((filter) => filter.id)}
      >
        {sortedFilters.map((filter) => {
          const filterParamName = filter.id.startsWith('filter.p.vendor')
            ? 'vendor'
            : filter.id.split('.').pop() || '';
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
                  />
                ) : filter.type === 'LIST' ? (
                  <ul className="space-y-2">
                    {[...filter.values]
                      .sort((a, b) => a.label.localeCompare(b.label))
                      .map((value) => {
                        const isChecked = (
                          activeFilters[filterParamName] as string[]
                        )?.includes(value.label);
                        return (
                          <li key={value.label} className="cursor-pointer">
                            <label className="flex items-center space-x-2  cursor-pointer">
                              <input
                                type="checkbox"
                                className="rounded"
                                checked={!!isChecked}
                                onChange={() =>
                                  handleFilterChange(filter.id, value)
                                }
                              />
                              <span>
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
}: {
  filter: Filter;
  onPriceChange: (min: string, max: string) => void;
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

  return (
    <div className="flex flex-col space-y-2">
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
          >
            {t('clear')}
          </Button>
        ) : (
          <Button
            onClick={applyPriceFilter}
            disabled={isApplied}
            className="w-full"
          >
            {t('apply')}
          </Button>
        )}
      </div>
    </div>
  );
}
