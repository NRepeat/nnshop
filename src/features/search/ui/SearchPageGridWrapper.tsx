'use client';
import * as React from 'react';
import { useState, useEffect, Suspense } from 'react';
import { ClientGrid } from '@features/collection/ui/ClientGrid';
import LoadMore from '@features/collection/ui/LoadMore';
import { PageInfo, Product } from '@shared/lib/shopify/types/storefront.types';
import { ArrowUp } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { getFavoriteProductIds } from '@features/collection/api/get-favorite-ids';
import { useSession } from '@features/auth/lib/client';

type Props = {
  initialProducts: (Product & { isFav: boolean })[];
  initialPageInfo: PageInfo;
  query: string;
};

export const SearchPageGridWrapper = ({
  initialProducts,
  initialPageInfo,
  query,
}: Props) => {
  const session = useSession();
  const [favSet, setFavSet] = useState<Set<string>>(new Set());

  const productIdsKey = initialProducts.map((p) => p.id).join(',');

  useEffect(() => {
    const user = session.data?.user as
      | (NonNullable<typeof session.data>['user'] & { isAnonymous?: boolean })
      | undefined;
    if (!user || user.isAnonymous || session.isPending) return;
    getFavoriteProductIds(initialProducts.map((p) => p.id)).then((ids) => {
      setFavSet(new Set(ids));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIdsKey, session.data, session.isPending]);

  const products = React.useMemo(
    () => initialProducts.map((p) => ({ ...p, isFav: favSet.has(p.id) })),
    [initialProducts, favSet],
  );

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
        <div className="flex flex-col w-full justify-between pt-0 min-h-screen h-fit">
          <ClientGrid
            products={products}
            hasNextPage={initialPageInfo?.hasNextPage}
          />
          <div className="w-full items-center">
            <Suspense fallback={null}>
              {/* LoadMore's `handle` prop is unused per its current implementation
                  (see LoadMore.tsx lines 11-20). We pass `query` to satisfy the type. */}
              <LoadMore initialPageInfo={initialPageInfo} handle={query} />
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
