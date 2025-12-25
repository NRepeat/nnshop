'use client';
import { Button } from '@shared/ui/button';
import { Search, X, PlusIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@shared/i18n/navigation';
const LeftImage = `https://qipmjw4uaan1zz27.public.blob.vercel-storage.com/assests/home/image/home-banner/hero-banner-left.png`;
export const SearchClient = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const [results, setResults] = useState<any[]>([]);
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
    if (query.length > 1) {
      setResults([
        { id: 1, title: 'Silk Wide-Leg Pant', price: '$248', image: LeftImage },
        { id: 2, title: 'Silk Paperbag Pant', price: '$268', image: LeftImage },
        { id: 3, title: 'Ponte Legging Pant', price: '$148', image: LeftImage },
        {
          id: 4,
          title: 'Organic Pima Classic Pant',
          price: '$58',
          image: LeftImage,
        },
      ]);
    } else {
      setResults([]);
    }
  }, [query]);

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
                {results.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-8"
                  >
                    <div className="flex justify-between items-center mb-6 text-sm text-gray-500">
                      <span>{results.length} results</span>
                      <Link href="/search" className="underline">
                        View all
                      </Link>
                    </div>

                    {/* Product Grid - matching your screenshot */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                      {results.map((product) => (
                        <div
                          key={product.id}
                          className="group flex flex-col gap-2"
                        >
                          <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
                            {/* Placeholder for images from your screenshot */}
                            <Image
                              src={product.image}
                              alt={product.title}
                              fill
                              className="object-cover"
                            />
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
                            <p className="text-sm text-gray-600">
                              {product.price}
                            </p>
                          </div>
                        </div>
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
