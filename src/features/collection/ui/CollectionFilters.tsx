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
import { useMemo } from 'react';

type Props = {
  filters: Filter[];
  initialFilters?: Filter[];
};

export function CollectionFilters({ filters, initialFilters }: Props) {
  const sortedFilters = useMemo(() => {
    const getOrder = (label: string) => {
      console.log('label', label);
      if (label === 'Цена' || label === 'Ціна' || label === 'Price') return 1;
      if (label === 'Размер' || label === 'Розмір') return 2;
      return Infinity;
    };
    return [...filters].sort((a, b) => getOrder(a.label) - getOrder(b.label));
  }, [filters]);

  const initialFilterPrice = initialFilters?.find(
    (filter) => filter.id === 'filter.v.price',
  );

  return (
    <div className="w-full relative">
      <Accordion
        type="multiple"
        className="pr-1 w-full max-h-[calc(100vh-130px)] custom-scroll"
        defaultValue={filters.map((filter) => filter.id)}
      >
        {sortedFilters.map((filter) => {
          return (
            <AccordionItem key={filter.id} value={filter.id}>
              <AccordionTrigger className="font-medium cursor-pointer w-full">
                {filter.label}
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
                    return <NuqsButtonFilter filter={filter} />;
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
