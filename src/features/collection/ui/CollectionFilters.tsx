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
import { useParams } from 'next/navigation';

type Props = {
  filters: Filter[];
  initialFilters?: Filter[];
};

const FILTER_LABEL_KEYS: Record<string, string> = {
  'filter.p.m.custom.color': 'filters.labels.color',
  'filter.p.m.custom.size': 'filters.labels.size',
  'filter.p.m.custom.gender': 'filters.labels.gender',
  'filter.p.m.custom.category': 'filters.labels.category',
  'filter.p.m.custom.brand': 'filters.labels.brand',
  'filter.p.m.custom.material': 'filters.labels.material',
  'filter.p.m.custom.pidkladka': 'filters.labels.pidkladka',
};

export function CollectionFilters({ filters, initialFilters }: Props) {
  const t = useTranslations('CollectionPage');
  const params = useParams();
  const hasGender = !!params.gender;
  const sortedFilters = useMemo(() => {
    const getOrder = (id: string) => {
      if (id === 'filter.v.price') return 1;
      if (id === 'filter.p.m.custom.size') return 2;
      return Infinity;
    };

    const filteredAndSorted = filters
      .filter((filter) => {
        if (filter.id === 'filter.p.vendor') return false;
        if (filter.id === 'filter.p.m.custom.gender' && hasGender) return false;
        if (filter.type === 'PRICE_RANGE') return true;
        return filter.values.length > 0;
      })
      .sort((a, b) => getOrder(a.id) - getOrder(b.id));

    return filteredAndSorted;
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
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  : FILTER_LABEL_KEYS[filter.id] ? t(FILTER_LABEL_KEYS[filter.id] as any) : filter.label}
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
                  if (filter.id === 'filter.p.m.custom.size' || filter.label === 'Розмір' || filter.label === 'Размер') {
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
