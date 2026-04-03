'use client';

import { ProductCard } from '@entities/product/ui/ProductCard';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { AnimatePresence, motion } from 'framer-motion';
import { useGridStore } from '@shared/store/use-grid-store';
import { cn } from '@shared/lib/utils';
import { useRef } from 'react';

export const ClientGrid = ({
  products,
  hasNextPage,
}: {
  products: (Product & { isFav: boolean })[];
  hasNextPage?: boolean;
}) => {
  const cols = useGridStore((s) => s.cols);
  const prevCountRef = useRef(products.length);
  const prevCount = prevCountRef.current;

  // Update ref after render 
  if (prevCountRef.current !== products.length) {
    prevCountRef.current = products.length;
  }
 
  return (
    <div
      className={cn(
        'grid gap-1 md:gap-4 mt-2',
        cols === '3'
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3',
      )}
    >
      <AnimatePresence>
        {products.map((product, index) => {
          const isNew = index >= prevCount;
          return (
            <motion.div
              key={product.id}
              className="col-span-1"
              initial={isNew ? { opacity: 0, y: 15 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={
                isNew
                  ? {
                      duration: 0.3,
                      ease: 'easeOut',
                      delay: (index - prevCount) * 0.04,
                    }
                  : undefined
              }
            >
              <ProductCard
                withQuick
                addToCard
                product={product}
                className="hover:shadow pt-0 px-0 rounded"
                withCarousel
                isFav={product.isFav}
                priority={index < 4}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
