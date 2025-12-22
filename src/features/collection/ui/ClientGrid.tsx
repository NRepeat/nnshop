import { ProductCard } from '@entities/product/ui/ProductCard';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { motion, AnimatePresence, Variants } from 'framer-motion';

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
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

export const ClientGrid = ({ products }: { products: Product[] }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 h-full ">
      <AnimatePresence>
        {products.map((product) => (
          <motion.div
            key={product.id}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="col-span-1"
          >
            <ProductCard product={product} className=" px-0" withCarousel />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
