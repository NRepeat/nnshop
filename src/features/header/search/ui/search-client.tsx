'use client';
import { Button } from '@shared/ui/button';
import { Search, X, PlusIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useDebounce } from 'use-debounce';
import { PredictiveSearchQuery } from '@shared/lib/shopify/types/storefront.generated';
import Link from 'next/link';

type PredictiveSearchResult = NonNullable<
  PredictiveSearchQuery['predictiveSearch']
>;
type Product = PredictiveSearchResult['products'][0];

export const SearchClient = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 500);
  const [results, setResults] = useState<PredictiveSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  console.log(results);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
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
        className="h-full"
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
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="fixed inset-0 top-[60px] h-fit min-h-[50vh] z-[101] bg-white overflow-y-auto"
            >
              {/* Header with Input */}
              <div className="container mx-auto px-4">
                <div className="h-[80px] flex items-center gap-4 border-b">
                  <Search className="w-5 h-5" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
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
                </div>

                {/* Results Section */}
                {loading && <div className="py-8">Loading...</div>}
                {!loading && results && results.products.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-8"
                  >
                    <div className="flex justify-between items-center mb-6 text-sm text-gray-500">
                      <span>{results.products.length} results</span>
                      <Link href="/search" className="underline">
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
                        >
                          <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
                            {/* Placeholder for images from your screenshot */}
                            {product.featuredImage?.url && (
                              <Image
                                src={product.featuredImage.url}
                                alt={product.title}
                                fill
                                className="object-cover"
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
