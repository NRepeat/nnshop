'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { ClientGrid } from './ClientGrid';
import LoadMore from './LoadMore';
import { PageInfo, Product } from '@shared/lib/shopify/types/storefront.types';
import { useLocale } from 'next-intl';
import { ArrowUp } from 'lucide-react';
import { Button } from '@shared/ui/button';

export const ClientGridWrapper = ({
  initialPageInfo,
  initialProducts,
  handle,
  gender,
}: {
  initialProducts: (Product & { isFav: boolean })[];
  initialPageInfo: PageInfo;
  handle: string;
  gender?: string;
}) => {
  const locale = useLocale();
  const [extraProducts, setExtraProducts] = useState<(Product & { isFav: boolean })[]>([]);

  // key prop on this component handles reset when handle/filters change — no useEffect needed

  const handleDataLoaded = useCallback((newProducts: Product[], _newPageInfo: any) => {
    setExtraProducts((prev) => {
      const map = new Map();
      prev.forEach((p) => map.set(p.id, p));
      newProducts.forEach((p) => map.set(p.id, p));
      return Array.from(map.values());
    });
  }, []);

  const products = [...initialProducts, ...extraProducts];
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
          <ClientGrid products={products as (Product & { isFav: boolean })[]} />
          <div className="w-full items-center">
            <Suspense fallback={null}>
              <LoadMore
                initialPageInfo={initialPageInfo}
                onDataLoadedAction={handleDataLoaded}
                locale={locale}
                handle={handle}
                gender={gender}
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
