import { ProductCard } from '@entities/product/ui/ProductCard';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { motion, AnimatePresence } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const ClientGrid = ({ products }: { products: Product[] }) => {
  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 h-full"
      variants={container}
      initial="hidden"
      animate="show"
      layout
    >
      <AnimatePresence>
        {products.map((product) => (
          <motion.div
            key={product.id}
            variants={item}
            layout
            className="col-span-1"
          >
            <ProductCard product={product} className=" px-0" withCarousel />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};
