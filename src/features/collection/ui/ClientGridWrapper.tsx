'use client';
import * as React from 'react';
import { useState, useEffect, Suspense } from 'react';
import { ClientGrid } from './ClientGrid';
import LoadMore from './LoadMore';
import { PageInfo, Product } from '@shared/lib/shopify/types/storefront.types';
import { ArrowUp } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { filterProducts } from '../lib/filterProducts';

export const ClientGridWrapper = ({
  initialPageInfo,
  initialProducts,
  handle,
  selectedSizeSlugs = [],
  optionGroups = {},
}: {
  initialProducts: (Product & { isFav: boolean })[];
  initialPageInfo: PageInfo;
  handle: string;
  gender?: string;
  sort?: string;
  selectedSizeSlugs?: string[];
  optionGroups?: Record<string, { name: string; values: string[] }>;
}) => {
  // Convert serializable props back to Set/Map for filterProducts
  const sizeSet = React.useMemo(
    () => new Set(selectedSizeSlugs),
    [selectedSizeSlugs],
  );
  const groupMap = React.useMemo(() => {
    const map = new Map<string, { name: string; values: Set<string> }>();
    Object.entries(optionGroups).forEach(([key, group]) => {
      map.set(key, { name: group.name, values: new Set(group.values) });
    });
    return map;
  }, [optionGroups]);

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="flex h-full w-full justify-between">
      <div className="flex flex-col w-full items-end justify-between">
        <div className="flex flex-col w-full justify-between  pt-0 min-h-screen h-fit">
          <ClientGrid
            products={
              filterProducts(
                initialProducts,
                sizeSet,
                groupMap,
              ) as (Product & { isFav: boolean })[]
            }
          />
          <div className="w-full items-center">
            <Suspense fallback={null}>
              <LoadMore
                initialPageInfo={initialPageInfo}
                handle={handle}
              />
            </Suspense>
          </div>
        </div>
      </div>

      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-24 right-8.5 z-20 w-10 h-10 bg-black text-white rounded-full shadow-lg flex items-center justify-center hover:bg-neutral-800 transition-colors"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};
