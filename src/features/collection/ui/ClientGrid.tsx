'use client';

import { ProductCard } from '@entities/product/ui/ProductCard';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// Added explicit type here
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

export const ClientGrid = ({ products }: { products: Product[] }) => {
  const [tempProducts, setTempProducts] = useState<Product[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    setTempProducts(products);
  }, [pathname]);

  useEffect(() => {
    setTempProducts((prev) => {
      const productMap = new Map();
      prev.forEach((p) => productMap.set(p.id, p));
      products.forEach((p) => productMap.set(p.id, p));
      return Array.from(productMap.values());
    });
  }, [products]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
      <AnimatePresence mode="popLayout">
        {tempProducts.map((product) => (
          <motion.div
            key={product.id}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            layout
            className="col-span-1"
          >
            <ProductCard product={product} className="pl-0 pr-0" withCarousel />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
