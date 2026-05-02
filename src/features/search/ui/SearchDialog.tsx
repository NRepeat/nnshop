'use client';
import { Button } from '@shared/ui/button';
import { Search, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@shared/i18n/navigation';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { usePredictiveSearch } from '../model/use-predictive-search';
import { SearchResultsGrid } from './SearchResultsGrid';
import { SearchSkeleton } from './SearchSkeleton';
import { SearchEmpty } from './SearchEmpty';

type SearchDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const t = useTranslations('Search');
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { query, setQuery, debouncedQuery, results, loading } =
    usePredictiveSearch();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = () => {
    if (query) {
      router.push(`/search?q=${query}`);
      onClose();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        onClose();
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
  }, [isOpen, onClose]);

  // Esc key support
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-[120px] bg-black/50 backdrop-blur-sm z-[100]"
          />

          <motion.div
            ref={searchContainerRef}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed inset-0 top-[0px] h-fit min-h-[50vh] z-[101] bg-white overflow-y-auto"
          >
            <div className="container mx-auto px-4">
              {/* Header row — mobile responsive (text submit hidden < sm) */}
              <div className="h-[80px] flex items-center gap-2 sm:gap-4 border-b px-4">
                <Search className="w-5 h-5 shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                  placeholder={t('placeholder')}
                  className="flex-1 min-w-0 bg-transparent border-none outline-none text-base sm:text-xl"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close search"
                  onClick={onClose}
                  className="shrink-0"
                >
                  <X className="w-6 h-6" />
                </Button>
                <Button
                  onClick={handleSearch}
                  className="hidden sm:inline-flex"
                >
                  {t('searchButton')}
                </Button>
              </div>

              {loading && (
                <div className="py-8">
                  <SearchSkeleton />
                </div>
              )}

              {!loading &&
                results &&
                results.products &&
                results.products.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-8 px-4"
                  >
                    <div className="flex justify-between items-center mb-6 text-sm text-gray-500">
                      <span>
                        {t.rich('results', {
                          count: results.products.length,
                        })}
                      </span>
                      <Link
                        href={`/search?q=${encodeURIComponent(debouncedQuery)}`}
                        className="border-b border-transparent hover:border-current transition-colors"
                        onClick={onClose}
                      >
                        {t('viewAll')}
                      </Link>
                    </div>
                    <SearchResultsGrid
                      products={results.products as Product[]}
                      onProductClick={onClose}
                    />
                  </motion.div>
                )}

              {!loading &&
                results &&
                debouncedQuery &&
                results.products?.length === 0 && <SearchEmpty />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
