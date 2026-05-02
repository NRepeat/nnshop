'use client';
import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ClientGrid } from '@features/collection/ui/ClientGrid';
import { PageInfo, Product } from '@shared/lib/shopify/types/storefront.types';
import { ArrowUp } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { getFavoriteProductIds } from '@features/collection/api/get-favorite-ids';
import { useSession } from '@features/auth/lib/client';
import { useScrollMemory } from '../lib/use-scroll-memory';
import { loadMoreSearchProducts } from '../api/load-more-search';
import { SearchLoadMore } from './SearchLoadMore';

type Props = {
  initialProducts: (Product & { isFav: boolean })[];
  initialPageInfo: PageInfo;
  query: string;
  locale: string;
};

const CACHE_PREFIX = 'nnshop:search:';

type CachedState = {
  products: (Product & { isFav: boolean })[];
  pageInfo: PageInfo;
  // Saved so we can detect cache invalidation if filters/sort changed
  // out-of-band (e.g. user navigated away then back to a different URL).
  signature: string;
};

function readCache(key: string): CachedState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as CachedState;
  } catch {
    return null;
  }
}

function writeCache(key: string, state: CachedState) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, JSON.stringify(state));
  } catch {
    // sessionStorage quota or disabled — silently drop.
  }
}

export function SearchPageGridWrapper({
  initialProducts,
  initialPageInfo,
  query,
  locale,
}: Props) {
  // Restore scroll position when user navigates back from /product/* to /search.
  useScrollMemory();

  const session = useSession();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const cacheKey = `${CACHE_PREFIX}${search}`;
  const signature = `${query}|${search}|${initialProducts.length}`;

  // Initial state matches server-rendered HTML to avoid hydration mismatch.
  // After hydration, useEffect below swaps to a sessionStorage cache hit if
  // one exists for this URL (e.g. user clicked Load More 3 times then opened
  // a product — back-nav restores all 96 products instantly).
  const [products, setProducts] =
    useState<(Product & { isFav: boolean })[]>(initialProducts);
  const [pageInfo, setPageInfo] = useState<PageInfo>(initialPageInfo);
  const [isLoading, setIsLoading] = useState(false);

  // After mount: check session cache for same URL. If hit, swap state.
  useEffect(() => {
    const cached = readCache(cacheKey);
    if (
      cached &&
      cached.signature === signature &&
      cached.products.length > initialProducts.length
    ) {
      setProducts(cached.products);
      setPageInfo(cached.pageInfo);
    }
    // Run only on mount per cacheKey — re-runs handled by signature reset below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  // If the URL/query changes (filter, sort, q changed) — reset to fresh
  // server-rendered initial page.
  const prevSignatureRef = useRef(signature);
  useEffect(() => {
    if (prevSignatureRef.current !== signature) {
      prevSignatureRef.current = signature;
      setProducts(initialProducts);
      setPageInfo(initialPageInfo);
    }
  }, [signature, initialProducts, initialPageInfo]);

  // Persist accumulated state to sessionStorage on every change so back-nav
  // from /product/* can hydrate without refetching.
  useEffect(() => {
    writeCache(cacheKey, { products, pageInfo, signature });
  }, [cacheKey, products, pageInfo, signature]);

  // Hydrate favorites for the current product set whenever it grows.
  const productIdsKey = products.map((p) => p.id).join(',');
  useEffect(() => {
    const user = session.data?.user as
      | (NonNullable<typeof session.data>['user'] & { isAnonymous?: boolean })
      | undefined;
    if (!user || user.isAnonymous || session.isPending) return;
    getFavoriteProductIds(products.map((p) => p.id)).then((ids) => {
      const favSet = new Set(ids);
      setProducts((prev) =>
        prev.map((p) => ({ ...p, isFav: favSet.has(p.id) })),
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIdsKey, session.data, session.isPending]);

  // Build a plain searchParams object for the server action (cursor pagination
  // must replay the same filters/sort).
  const searchParamsObject = React.useMemo(() => {
    const obj: { [k: string]: string | string[] } = {};
    searchParams.forEach((v, k) => {
      if (obj[k] === undefined) {
        obj[k] = v;
      } else if (Array.isArray(obj[k])) {
        (obj[k] as string[]).push(v);
      } else {
        obj[k] = [obj[k] as string, v];
      }
    });
    return obj;
  }, [searchParams]);

  const handleLoadMore = useCallback(async () => {
    if (isLoading || !pageInfo.hasNextPage || !pageInfo.endCursor) return;
    setIsLoading(true);
    try {
      const next = await loadMoreSearchProducts({
        query,
        locale,
        searchParams: searchParamsObject,
        after: pageInfo.endCursor,
        pageSize: 24,
      });
      const seen = new Set(products.map((p) => p.id));
      const fresh = next.products
        .filter((p) => !seen.has(p.id))
        .map((p) => ({ ...p, isFav: false }));
      setProducts((prev) => [...prev, ...fresh]);
      setPageInfo(next.pageInfo);
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading,
    pageInfo,
    query,
    locale,
    searchParamsObject,
    products,
  ]);

  // Scroll-to-top button.
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
            hasNextPage={pageInfo?.hasNextPage}
          />
          <div className="w-full items-center">
            <SearchLoadMore
              pageInfo={pageInfo}
              isLoading={isLoading}
              onLoadMore={handleLoadMore}
            />
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
}
