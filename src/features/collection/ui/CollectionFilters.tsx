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

type Props = {
  filters: Filter[];
};

export function CollectionFilters({ filters }: Props) {
  const sortedFilters = filters;

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
                {filter.id === 'filter.p.m.custom.color' ? (
                  <NuqsColorFilter filter={filter} />
                ) : filter.type === 'LIST' ? (
                  <NuqsListFilter filter={filter} />
                ) : filter.type === 'PRICE_RANGE' ? (
                  <NuqsPriceRangeFilter filter={filter} />
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
