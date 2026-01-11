'use client';
import { Button } from '@shared/ui/button';
import { Search, X, PlusIcon, SearchIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useDebounce } from 'use-debounce';
import { PredictiveSearchQuery } from '@shared/lib/shopify/types/storefront.generated';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@shared/ui/empty';
import { Skeleton } from '@shared/ui/skeleton';

type PredictiveSearchResult = NonNullable<
  PredictiveSearchQuery['predictiveSearch']
>;

export const SearchClient = ({ className }: { className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 500);
  const [results, setResults] = useState<PredictiveSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    if (query) {
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
    if (debouncedQuery.length > 1) {
      setLoading(true);
      fetch('/api/predictive-search', {
        method: 'POST',
        body: JSON.stringify({ query: debouncedQuery }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setResults(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
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
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Search className="w-5 h-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-[120px] bg-black/50 backdrop-blur-sm z-[10]"
            />

            {/* Main Search Container */}
            <motion.div
              ref={searchContainerRef}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="fixed inset-0 top-[0px] h-fit min-h-[50vh] z-[101] bg-white overflow-y-auto"
            >
              {/* Header with Input */}
              <div className="container mx-auto px-4">
                <div className="h-[80px] flex items-center gap-4 border-b">
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
                    placeholder="Search..."
                    className="flex-1 bg-transparent border-none outline-none text-xl"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen((prev) => !prev)}
                  >
                    <X className="w-6 h-6" />
                  </Button>
                  <Button onClick={handleSearch}>Search</Button>
                </div>

                {/* Results Section */}
                {loading && (
                  <div className="py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex flex-col gap-2">
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
                    className="py-8"
                  >
                    <div className="flex justify-between items-center mb-6 text-sm text-gray-500">
                      <span>{results.products?.length} results</span>
                      <Link
                        href="/search"
                        className="underline"
                        onClick={() => setIsOpen(false)}
                      >
                        View all
                      </Link>
                    </div>

                    {/* Product Grid - matching your screenshot */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 overflow-y-auto max-h-[calc(100vh-200px)] pb-8">
                      {results.products?.map((product) => (
                        <Link
                          href={`/products/${product.handle}`}
                          key={product.id}
                          scroll
                          className="group flex flex-col gap-2"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="relative aspect-[3/4] bg-background overflow-hidden">
                            {product.featuredImage?.url && (
                              <Image
                                src={product.featuredImage.url}
                                alt={product.title}
                                fill
                                className="object-contain"
                              />
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <PlusIcon className="w-5 h-5" />
                            </Button>
                          </div>
                          <div className="flex flex-col">
                            <h3 className="text-sm font-medium">
                              {product.title}
                            </h3>
                            <p className="text-sm text-gray-600">{`${product.variants.edges[0]?.node.price.amount} ${product.variants.edges[0]?.node.price.currencyCode}`}</p>
                          </div>
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
                        <EmptyTitle>No results found</EmptyTitle>
                        <EmptyDescription>
                          Try searching for something else.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
