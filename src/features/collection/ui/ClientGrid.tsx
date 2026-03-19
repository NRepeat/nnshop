'use client';

import { ProductCard } from '@entities/product/ui/ProductCard';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { motion, AnimatePresence } from 'framer-motion';
import { useGridStore } from '@shared/store/use-grid-store';
import { cn } from '@shared/lib/utils';

const container = {
  show: { transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const ClientGrid = ({
  products,
}: {
  products: (Product & { isFav: boolean })[];
}) => {
  const cols = useGridStore((s) => s.cols);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={cn(
        'grid gap-1 md:gap-4 mt-2',
        cols === '3'
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5'
          : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
      )}
    >
      <AnimatePresence>
        {products.map((product) => (
          <motion.div
            key={product.id}
            className="col-span-1"
            variants={item}
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
    </motion.div>
  );
};
