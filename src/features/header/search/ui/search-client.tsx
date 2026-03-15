'use client';
import { Button } from '@shared/ui/button';
import { Search, X, SearchIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useDebounce } from 'use-debounce';
import { PredictiveSearchQuery } from '@shared/lib/shopify/types/storefront.generated';
import { usePostHog } from 'posthog-js/react';
import { Link, useRouter } from '@shared/i18n/navigation';
import { useLocale } from 'next-intl';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@shared/ui/empty';
import { Skeleton } from '@shared/ui/skeleton';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { ProductCard } from '@entities/product/ui/ProductCard';

type PredictiveSearchResult = NonNullable<
  PredictiveSearchQuery['predictiveSearch']
>;

export const SearchClient = ({ className }: { className?: string }) => {
  const t = useTranslations('Search');
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 500);
  const [results, setResults] = useState<PredictiveSearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const posthog = usePostHog();

  const handleSearch = () => {
    if (query) {
      posthog?.capture('search_submitted', {
        query,
        results_count: results?.products?.length ?? null,
      });
      router.push(`/search?q=${query}`);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!loading && results && debouncedQuery && results.products?.length === 0) {
      posthog?.capture('search_no_results', { query: debouncedQuery });
    }
  }, [loading, results, debouncedQuery, posthog]);

  useEffect(() => {
    if (debouncedQuery.length >= 1) {
      setLoading(true);
      const controller = new AbortController();
      fetch('/api/predictive-search', {
        method: 'POST',
        body: JSON.stringify({ query: debouncedQuery, locale }),
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data) => {
          setResults(data);
          setLoading(false);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') setLoading(false);
        });
      return () => controller.abort();
    } else {
      setResults(null);
    }
  }, [debouncedQuery]);

  return (
    <>
      <Button
        className={className}
        variant="ghost"
        size="icon"
        aria-label={t('title')}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Search className="w-5 h-5" />
      </Button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 top-[120px] bg-black/50 backdrop-blur-sm z-[100]"
                />

                {/* Main Search Container */}
                <motion.div
                  ref={searchContainerRef}
                  initial={{ y: -20, opacity: 0, animationDuration: 100 }}
                  animate={{ y: 0, opacity: 1, animationDuration: 100 }}
                  exit={{ y: -20, opacity: 0, animationDuration: 100 }}
                  className="fixed inset-0 top-[0px] h-fit min-h-[50vh] z-[101] bg-white overflow-y-auto"
                >
                  {/* Header with Input */}
                  <div className="container mx-auto px-4">
                    <div className="h-[80px] flex items-center gap-4 border-b px-4">
                      <Search className="w-5 h-5" />
                      <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSearch();
                          }
                        }}
                        placeholder={t('placeholder')}
                        className="flex-1 bg-transparent border-none outline-none text-xl"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Close search"
                        onClick={() => setIsOpen((prev) => !prev)}
                      >
                        <X className="w-6 h-6" />
                      </Button>
                      <Button onClick={handleSearch}>
                        {t('searchButton')}
                      </Button>
                    </div>

                    {/* Results Section */}
                    {loading && (
                      <div className="py-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <div
                              key={i}
                              className="flex flex-col gap-2 max-h-[]"
                            >
                              <Skeleton className="relative aspect-[3/4]" />
                              <div className="flex flex-col gap-2 mt-2">
                                <Skeleton className="h-4 w-4/5" />
                                <Skeleton className="h-4 w-2/5" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {!loading && results && results.products?.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-8 px-4"
                      >
                        <div className="flex justify-between items-center mb-6 text-sm text-gray-500">
                          <span>
                            {t.rich('results', {
                              count: results.products?.length,
                            })}
                          </span>
                          <Link
                            href={`/search?q=${encodeURIComponent(debouncedQuery)}`}
                            className="border-b border-transparent hover:border-current transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            {t('viewAll')}
                          </Link>
                        </div>

                        {/* Product Grid - matching your screenshot */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 overflow-y-auto max-h-[calc(100vh-200px)] pb-8">
                          {results.products?.map((product) => (
                            <Link
                              href={`/product/${product.handle}`}
                              key={product.id}
                              scroll
                              className="group flex flex-col gap-2"
                              onClick={() => setIsOpen(false)}
                            >
                              <ProductCard
                                product={product as Product}
                                withCarousel={false}
                              />
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {!loading &&
                      results &&
                      debouncedQuery &&
                      results.products?.length === 0 && (
                        <Empty>
                          <EmptyHeader>
                            <EmptyMedia variant="icon">
                              <SearchIcon />
                            </EmptyMedia>
                            <EmptyTitle>{t('noResults')}</EmptyTitle>
                            <EmptyDescription>{t('tryAgain')}</EmptyDescription>
                          </EmptyHeader>
                        </Empty>
                      )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
};
