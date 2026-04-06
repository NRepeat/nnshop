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
import { NuqsRangeListFilter } from './NuqsRangeListFilter';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';

type Props = {
  filters: Filter[];
  initialFilters?: Filter[];
  hideVendor?: boolean;
};

const FILTER_LABEL_KEYS: Record<string, string> = {
  'filter.p.m.custom.color': 'filters.labels.color',
  'filter.p.m.custom.size': 'filters.labels.size',
  'filter.p.m.custom.gender': 'filters.labels.gender',
  'filter.p.m.custom.category': 'filters.labels.category',
  'filter.p.m.custom.brand': 'filters.labels.brand',
  'filter.p.m.custom.material': 'filters.labels.material',
  'filter.p.m.custom.pidkladka': 'filters.labels.pidkladka',
  'filter.p.m.custom.kabluk': 'filters.labels.kabluk',
  'filter.p.vendor': 'filters.labels.brand',
};

const RANGE_SLIDER_FILTERS = new Set([
  'filter.p.m.custom.kabluk',
]);

export function CollectionFilters({ filters, initialFilters, hideVendor }: Props) {
  const t = useTranslations('CollectionPage');
  const params = useParams();
  const hasGender = !!params.gender;
  const sortedFilters = useMemo(() => {
    return filters.filter((filter) => {
      if (filter.id === 'filter.p.vendor' && hideVendor) return false;
      if (filter.id === 'filter.p.m.custom.gender' && hasGender) return false;
      if (filter.type === 'PRICE_RANGE') return true;
      return filter.values.length > 0;
    });
  }, [filters, hasGender]);

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
                  : FILTER_LABEL_KEYS[filter.id] ? t(FILTER_LABEL_KEYS[filter.id] as any) : filter.label}
              </AccordionTrigger>
              <AccordionContent>
                {(() => {
                  const initialFilter = initialFilters?.find(
                    (f) => f.id === filter.id,
                  );
                  if (filter.type === 'PRICE_RANGE') {
                    return (
                      <NuqsPriceRangeFilter
                        filter={filter}
                        initialFilterPrice={initialFilterPrice}
                      />
                    );
                  }
                  if (filter.id === 'filter.p.m.custom.color') {
                    return (
                      <NuqsColorFilter
                        filter={filter}
                        initialFilter={initialFilter}
                      />
                    );
                  }
                  if (filter.id === 'filter.p.m.custom.rozmir' || filter.label === 'Розмір' || filter.label === 'Размер') {
                    return (
                      <NuqsButtonFilter
                        filter={filter}
                        showCount={false}
                        isSizeFilter={true}
                        initialFilter={initialFilter}
                      />
                    );
                  }
                  if (RANGE_SLIDER_FILTERS.has(filter.id)) {
                    return (
                      <NuqsRangeListFilter
                        filter={filter}
                        initialFilter={initialFilter}
                      />
                    );
                  }
                  if (filter.type === 'LIST') {
                    return (
                      <NuqsListFilter
                        filter={filter}
                        initialFilter={initialFilter}
                      />
                    );
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
