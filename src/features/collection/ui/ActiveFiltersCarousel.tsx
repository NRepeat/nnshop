'use client';

import { Carousel, CarouselContent, CarouselItem } from '@shared/ui/carousel';
import { useSearchParams } from 'next/navigation';
import { Filter } from '@shared/lib/shopify/types/storefront.types';
import { ActiveFilterChip } from './ActiveFilterChip';
import { toFilterSlug } from '@shared/lib/filterSlug';

export function ActiveFiltersCarousel({ filters }: { filters: Filter[] }) {
  const searchParams = useSearchParams();

  const activeFilters: {
    key: string;
    value: string;
    filter: Filter | undefined;
  }[] = [];

  searchParams.forEach((value, key) => {
    const isFilterParam = filters.some((f) => f.id.endsWith(`.${key}`));
    const currentFilter = filters.find((f) => f.id.endsWith(`.${key}`));

    if (key !== 'minPrice' && key !== 'maxPrice' && isFilterParam) {
      const values = value.split(';');
      values.forEach((v) => {
        activeFilters.push({ key: key, value: v, filter: currentFilter });
      });
    }
  });
  console.log(activeFilters);
  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <Carousel>
      <CarouselContent className="pl-2 md:max-w-full lg:max-w-full">
        {activeFilters.map((filter, index) => {
          const filterDef = filters.find((f) =>
            f.id.endsWith(`.${filter.key}`),
          );
          const label =
            filterDef?.values.find(
              (v) => toFilterSlug(v.label) === filter.value,
            )?.label ?? decodeURIComponent(filter.value);

          return (
            <CarouselItem
              key={`${filter.key}-${filter.value}-${index}`}
              className="basis-auto ml-2"
            >
              <ActiveFilterChip
                filterKey={filter.key}
                filterValue={filter.value}
                label={label}
                filter={filter.filter}
              />
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
}
