'use client';

import { ProductCard } from '@entities/product/ui/ProductCard';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { motion, AnimatePresence } from 'framer-motion';
import { useGridStore } from '@shared/store/use-grid-store';
import { cn } from '@shared/lib/utils';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const ClientGrid = ({
  products,
}: {
  products: (Product & { isFav: boolean })[];
}) => {
  const cols = useGridStore((s) => s.cols);

  return (
    <div
      className={cn(
        'grid gap-1 md:gap-4 mt-2',
        cols === '3'
          ? 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
          : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
      )}
    >
      <AnimatePresence>
        {products.map((product) => (
          <motion.div
            layout
            key={product.id}
            className="col-span-1"
            variants={item}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <ProductCard
              withQuick
              addToCard
              product={product}
              className="hover:shadow pt-0 px-0 rounded"
              withCarousel
              isFav={product.isFav}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
