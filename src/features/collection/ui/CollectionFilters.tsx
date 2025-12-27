'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/ui/accordion';
import { Button } from '@shared/ui/button';
import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Filter,
  FilterValue,
} from '@shared/lib/shopify/types/storefront.types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ColorFilter } from './ColorFilter';

type Props = {
  filters: Filter[];
};

type ActiveFiltersState = {
  [key: string]: string[] | string; // For list filters like vendor, metafields, minPrice, maxPrice
};

const getFilterParamName = (filterId: string) => {
  if (filterId.startsWith('filter.p.vendor')) {
    return 'vendor';
  }
  if (filterId.startsWith('filter.p.m.custom')) {
    return filterId.split('.').pop() || '';
  }
  return '';
};

export function CollectionFilters({ filters }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeFilters, setActiveFilters] = useState<ActiveFiltersState>({});

  useEffect(() => {
    const newActiveFilters: ActiveFiltersState = {};
    searchParams.forEach((value, key) => {
      newActiveFilters[key] = value.includes(',') ? value.split(',') : [value];
    });
    setActiveFilters(newActiveFilters);
  }, [searchParams]);

  const handleFilterChange = useCallback(
    (filterId: string, filterValue: FilterValue) => {
      const filterParamName = getFilterParamName(filterId);
      if (!filterParamName) return;

      const valueToPutInUrl = filterValue.label;

      const newSearchParams = new URLSearchParams(searchParams.toString());
      const currentParam = newSearchParams.get(filterParamName);
      let newValues: string[] = [];

      if (currentParam) {
        newValues = currentParam.split(',');
      }

      const existingIndex = newValues.indexOf(valueToPutInUrl);

      if (existingIndex > -1) {
        newValues.splice(existingIndex, 1);
      } else {
        newValues.push(valueToPutInUrl);
      }

      if (newValues.length > 0) {
        newSearchParams.set(filterParamName, newValues.join(','));
      } else {
        newSearchParams.delete(filterParamName);
      }
      router.replace(`${pathname}?${newSearchParams.toString()}`, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const handlePriceChange = useCallback(
    (min: string, max: string) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      if (min) {
        newSearchParams.set('minPrice', min);
      } else {
        newSearchParams.delete('minPrice');
      }
      if (max) {
        newSearchParams.set('maxPrice', max);
      } else {
        newSearchParams.delete('maxPrice');
      }
      router.replace(`${pathname}?${newSearchParams.toString()}`, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const sortedFilters = filters;

  return (
    <div className="w-full  ">
      <Accordion
        type="multiple"
        className="pr-1 w-full  max-h-[calc(100vh-130px)] custom-scroll"
        defaultValue={filters.map((filter) => filter.id)}
      >
        {sortedFilters.map((filter) => {
          const filterParamName = getFilterParamName(filter.id);
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
