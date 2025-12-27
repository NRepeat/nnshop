'use client';

import { Carousel, CarouselContent, CarouselItem } from '@shared/ui/carousel';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useTransition } from 'react';
import { createFilterUrl } from '../actions';
import {
  Filter,
  FilterValue,
} from '@shared/lib/shopify/types/storefront.types';
import { Button } from '@shared/ui/button';

export function ActiveFiltersCarousel({ filters }: { filters: Filter[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const activeFilters: {
    key: string;
    value: string;
    filterId: string;
    filterValue: FilterValue;
  }[] = [];

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

  const removeFilter = async (filterId: string, filterValue: FilterValue) => {
    const newUrl = await createFilterUrl(
      searchParams.toString(),
      pathname,
      filterId,
      filterValue,
    );
    startTransition(() => {
      router.replace(newUrl, { scroll: false });
    });
  };

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <Carousel>
      <CarouselContent className="pl-2 md:max-w-full lg:max-w-full">
        {activeFilters.map((filter, index) => (
          <CarouselItem
            key={`${filter.key}-${filter.value}-${index}`}
            className="flex items-center justify-center gap-1 rounded-full border border-muted-foreground px-4 py-1 basis-auto ml-2"
          >
            <span className="text-sm font-medium">{filter.value}</span>
            <Button
              variant={'link'}
              onClick={() => removeFilter(filter.filterId, filter.filterValue)}
              disabled={isPending}
              className="bg-background hover:bg-background"
            >
              <X className="h-4 w-4" />
            </Button>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
