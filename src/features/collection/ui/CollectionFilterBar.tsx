'use client';

import { useEffect, useRef, useState } from 'react';
import { Filter } from '@shared/lib/shopify/types/storefront.types';
import { SortSelect } from './SortSelect';
import { FilterSheet } from './FilterSheet';
import { ActiveFiltersCarousel } from './ActiveFiltersCarousel';
import { GridToggle } from './GridToggle';
import { cn } from '@shared/lib/utils';
import { useScrollStore } from '@shared/store/use-scroll-store';

type Props = {
  filters: Filter[];
  initialFilters: Filter[] | undefined;
  hideVendor?: boolean;
};

export function CollectionFilterBar({ filters, initialFilters, hideVendor }: Props) {
  const [isPastHeader, setIsPastHeader] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isHeaderVisible = useScrollStore((s) => s.isHeaderVisible);
  const isScrollHideEnabled = useScrollStore((s) => s.isScrollHideEnabled);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsPastHeader(!entry.isIntersecting),
      { threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // When header is hidden by scroll, bar moves to top-0; otherwise sits below header
  const headerHidden = isScrollHideEnabled && !isHeaderVisible;

  return (
    <>
      {/* Sentinel placed at the top of products grid – when it leaves viewport the bar appears */}
      <div ref={sentinelRef} aria-hidden className="h-px" />

      <div
        className={cn(
          'fixed left-0 right-0 z-20 bg-background border-b border-muted shadow-sm py-4',
          'transition-all duration-300 ease-in-out',
          isPastHeader
            ? 'opacity-100 pointer-events-auto translate-y-0'
            : 'opacity-0 pointer-events-none -translate-y-2',
          'top-[var(--header-height,70px)]',
          headerHidden && 'top-0',
        )}
      >
        <div className="container flex items-center gap-3 py-2">
          <div className="hidden md:flex flex-1 min-w-0 overflow-hidden">
            <ActiveFiltersCarousel filters={filters} />
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <GridToggle />
            <SortSelect />
            <FilterSheet
              filters={filters}
              initialFilters={initialFilters}
              hideVendor={hideVendor}
            />
          </div>
        </div>
      </div>
    </>
  );
}
