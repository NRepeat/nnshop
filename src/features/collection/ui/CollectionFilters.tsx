'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/ui/accordion';
import { Filter } from '@shared/lib/shopify/types/storefront.types';
import { NuqsColorFilter } from './NuqsColorFilter';
import { NuqsListFilter } from './NuqsListFilter';
import { NuqsPriceRangeFilter } from './NuqsPriceRangeFilter';
import { NuqsButtonFilter } from './NuqsButtonFilter';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

type Props = {
  filters: Filter[];
  initialFilters?: Filter[];
};

export function CollectionFilters({ filters, initialFilters }: Props) {
  const t = useTranslations('CollectionPage');
  console.log(filters,"filters")
  const sortedFilters = useMemo(() => {
    const getOrder = (label: string) => {
      if (label === 'Цена' || label === 'Ціна' || label === 'Price') return 1;
      if (label === 'Размер' || label === 'Розмір') return 2;
      return Infinity;
    };

    const filteredAndSorted = filters
      .map((filter) => {
        if (filter.type === 'PRICE_RANGE') {
          return filter; // Price range filters don't have values with counts to filter
        }
        return {
          ...filter,
          // values: filter.values.filter((value) => value.count > 0),
        };
      })
      .filter((filter) => {
        if (filter.type === 'PRICE_RANGE') {
          return true; // Always keep price range filter
        }
        return filter.values.length > 0;
      })
      .sort((a, b) => getOrder(a.label) - getOrder(b.label));

    return filteredAndSorted;
  }, [filters]);

  const initialFilterPrice = initialFilters?.find(
    (filter) => filter.id === 'filter.v.price',
  );

  return (
    <div className="w-full relative">
      <Accordion
        type="multiple"
        className="pr-1 w-full max-h-[calc(100vh-130px)] custom-scroll"
        defaultValue={sortedFilters.map((filter) => filter.id)}
      >
        {sortedFilters.map((filter) => {
          return (
            <AccordionItem key={filter.id} value={filter.id}>
              <AccordionTrigger className="font-medium cursor-pointer w-full">
                {filter.type === 'PRICE_RANGE'
                  ? t('filters.priceRange')
                  : filter.label}
              </AccordionTrigger>
              <AccordionContent>
                {(() => {
                  if (filter.type === 'PRICE_RANGE') {
                    return (
                      <NuqsPriceRangeFilter
                        filter={filter}
                        initialFilterPrice={initialFilterPrice}
                      />
                    );
                  }
                  if (filter.id === 'filter.p.m.custom.color') {
                    return <NuqsColorFilter filter={filter} />;
                  }
                  if (filter.label === 'Розмір' || filter.label === 'Размер') {
                    return (
                      <NuqsButtonFilter
                        filter={filter}
                        showCount={false}
                        isSizeFilter={true}
                      />
                    );
                  }
                  if (filter.type === 'LIST') {
                    return <NuqsListFilter filter={filter} />;
                  }

                  return filter.type;
                })()}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
