import { ProductCard } from '@entities/product/ui/ProductCard';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { motion, AnimatePresence } from 'framer-motion';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const ClientGrid = ({ products }: { products: Product[] }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
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
            <ProductCard product={product} className=" px-0" withCarousel />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
