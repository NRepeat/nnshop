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
  hasNextPage,
}: {
  products: (Product & { isFav: boolean })[];
  hasNextPage?: boolean;
}) => {
  const cols = useGridStore((s) => s.cols);
  const lgCols = cols === '3' ? 5 : 4;

  const trimmedLength = Math.floor(products.length / lgCols) * lgCols;
  const displayProducts =
    !hasNextPage && trimmedLength > 0 && trimmedLength < products.length
      ? products.slice(0, trimmedLength)
      : products;

  return (
    <motion.div
      variants={container}
      initial={false}
      animate="show"
      className={cn(
        'grid gap-1 md:gap-4 mt-2',
        cols === '3'
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5'
          : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
      )}
    >
      <AnimatePresence>
        {displayProducts.map((product, index) => (
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
              priority={index < 4}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};
