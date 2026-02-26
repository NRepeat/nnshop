'use client';
import { useState, useEffect, Suspense } from 'react';
import { ClientGrid } from './ClientGrid';
import LoadMore from './LoadMore';
import { PageInfo, Product } from '@shared/lib/shopify/types/storefront.types';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ArrowUp } from 'lucide-react';

export const ClientGridWrapper = ({
  initialPageInfo,
  initialProducts,
}: {
  initialProducts: (Product & { isFav: boolean })[];
  initialPageInfo: PageInfo;
}) => {
  const locale = useLocale();
  const [products, setProducts] =
    useState<(Product & { isFav: boolean })[]>(initialProducts);
  const [pageInfo, setPageInfo] = useState(initialPageInfo);
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    setPageInfo(initialPageInfo);
  }, [initialPageInfo]);

  const handleDataLoaded = (newProducts: Product[], newPageInfo: any) => {
    setProducts((prev) => {
      const map = new Map();
      prev?.forEach((p) => map.set(p.id, p));
      newProducts.forEach((p) => map.set(p.id, p));
      return Array.from(map.values());
    });
    setPageInfo(newPageInfo);
  };
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const params = useParams();
  const handle = Array.isArray(params.slug)
    ? params.slug.join('/')
    : (params.slug as string);
  return (
    <div className="flex h-full w-full justify-between">
      <div className="flex flex-col w-full items-end justify-between">
        <div className="flex flex-col w-full justify-between  pt-0 min-h-screen h-fit">
          <ClientGrid products={products as (Product & { isFav: boolean })[]} />
          <div className="w-full items-center">
            <Suspense fallback={null}>
              <LoadMore
                initialPageInfo={pageInfo}
                onDataLoadedAction={handleDataLoaded}
                locale={locale}
                handle={handle}
              />
            </Suspense>
          </div>
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-50 w-10 h-10 bg-black text-white rounded-full shadow-lg flex items-center justify-center hover:bg-neutral-800 transition-colors"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
