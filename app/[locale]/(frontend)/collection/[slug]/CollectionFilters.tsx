'use client';

import { usePathname, useRouter } from '@shared/i18n/navigation';

import { Button } from '@shared/ui/button';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Filter,
  ProductFilter,
} from '@shared/lib/shopify/types/storefront.types';
import { useSearchParams } from 'next/navigation';

type Props = {
  filters: Filter[];
};

export function CollectionFilters({ filters }: Props) {
  const t = useTranslations('CollectionPage.filters');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeFilters, setActiveFilters] = useState<ProductFilter[]>([]);

  useEffect(() => {
    const filtersFromUrl = searchParams.get('filters');
    if (filtersFromUrl) {
      try {
        setActiveFilters(JSON.parse(filtersFromUrl));
      } catch {
        setActiveFilters([]);
      }
    } else {
      setActiveFilters([]);
    }
  }, [searchParams]);

  const handleFilterChange = (filterInput: string, type: string) => {
    let newFilters = [...activeFilters];
    const filter = JSON.parse(filterInput);

    if (type === 'LIST') {
      const existingFilterIndex = newFilters.findIndex(
        (f) => JSON.stringify(f) === filterInput,
      );

      if (existingFilterIndex > -1) {
        newFilters.splice(existingFilterIndex, 1);
      } else {
        newFilters.push(filter);
      }
    }

    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (newFilters.length > 0) {
      newSearchParams.set('filters', JSON.stringify(newFilters));
    } else {
      newSearchParams.delete('filters');
    }
    router.replace(`${pathname}?${newSearchParams.toString()}`, {
      scroll: false,
    });
  };

  const handlePriceChange = (min: string, max: string) => {
    let newFilters = activeFilters.filter((f) => !f.price);
    if (min || max) {
      const priceFilter: ProductFilter = {
        price: {
          min: min ? parseFloat(min) : undefined,
          max: max ? parseFloat(max) : undefined,
        },
      };
      newFilters.push(priceFilter);
    }

    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (newFilters.length > 0) {
      newSearchParams.set('filters', JSON.stringify(newFilters));
    } else {
      newSearchParams.delete('filters');
    }
    router.replace(`${pathname}?${newSearchParams.toString()}`, {
      scroll: false,
    });
  };

  // const sortedFilters = [...filters].sort((a, b) => a.id.localeCompare(b.id));
  const sortedFilters = filters;
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">{t('title')}</h3>
      {sortedFilters.map((filter) => (
        <div key={filter.id} className="py-6 border-b border-gray-200">
          <h4 className="font-medium mb-3">{filter.label}</h4>
          {filter.type === 'LIST' && (
            <ul className="space-y-2">
              {[...filter.values]
                .sort((a, b) => a.label.localeCompare(b.label))
                .map((value) => (
                  <li key={value.label}>
                    <label className="flex items-center space-x-2 text-gray-600 hover:text-black cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={activeFilters.some(
                          (f) => JSON.stringify(f) === value.input,
                        )}
                        onChange={() =>
                          handleFilterChange(value.input as string, filter.type)
                        }
                      />
                      <span>
                        {value.label} ({value.count})
                      </span>
                    </label>
                  </li>
                ))}
            </ul>
          )}
          {filter.type === 'PRICE_RANGE' && (
            <PriceRangeFilter
              filter={filter}
              onPriceChange={handlePriceChange}
            />
          )}
        </div>
      ))}
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
    const filtersFromUrl = searchParams.get('filters');
    let minFromUrl = '';
    let maxFromUrl = '';
    if (filtersFromUrl) {
      try {
        const parsed = JSON.parse(filtersFromUrl) as ProductFilter[];
        const priceFilter = parsed.find((f) => f.price);
        if (priceFilter?.price) {
          minFromUrl = priceFilter.price.min?.toString() || '';
          maxFromUrl = priceFilter.price.max?.toString() || '';
        }
      } catch {
        /* ignore */
      }
    }
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
      <div className="flex items-center space-x-2">
        <input
          type="number"
          placeholder={t('min')}
          value={min}
          onChange={(e) => setMin(e.target.value)}
          className="w-full border-gray-300 rounded-md shadow-sm p-2"
        />
        <span>-</span>
        <input
          type="number"
          placeholder={t('max')}
          value={max}
          onChange={(e) => setMax(e.target.value)}
          className="w-full border-gray-300 rounded-md shadow-sm p-2"
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
