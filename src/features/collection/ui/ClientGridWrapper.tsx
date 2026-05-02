'use client';
import * as React from 'react';
import { useState, useEffect, Suspense } from 'react';
import { ClientGrid } from './ClientGrid';
import LoadMore from './LoadMore';
import { PageInfo, Product } from '@shared/lib/shopify/types/storefront.types';
import { ArrowUp } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { filterProducts } from '../lib/filterProducts';
import { getFavoriteProductIds } from '../api/get-favorite-ids';
import { useSession } from '@features/auth/lib/client';
import { useScrollMemory } from '@shared/lib/scroll/use-scroll-memory';

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
  // Restore scroll position when user navigates back from /product/* to
  // collection. Sets history.scrollRestoration = 'manual' globally and
  // uses rAF retry until DOM is tall enough for the saved position.
  useScrollMemory();

  const session = useSession();
  const [favSet, setFavSet] = useState<Set<string>>(new Set());

  // Stable key — only changes when the actual product IDs change (filters, load more)
  const productIdsKey = initialProducts.map((p) => p.id).join(',');

  useEffect(() => {
    const user = session.data?.user as (NonNullable<typeof session.data>['user'] & { isAnonymous?: boolean }) | undefined;
    if (!user || user.isAnonymous || session.isPending) return;
    getFavoriteProductIds(initialProducts.map((p) => p.id)).then((ids) => {
      setFavSet(new Set(ids));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIdsKey, session.data, session.isPending]);

  const products = React.useMemo(
    () => initialProducts.map((p) => ({ ...p, isFav: favSet.has(p.id) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initialProducts, favSet],
  );

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
                products,
                sizeSet,
                groupMap,
              ) as (Product & { isFav: boolean })[]
            }
            hasNextPage={initialPageInfo?.hasNextPage}
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
