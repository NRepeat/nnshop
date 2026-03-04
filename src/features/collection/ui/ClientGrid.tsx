import { ProductCard } from '@entities/product/ui/ProductCard';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { motion, AnimatePresence } from 'framer-motion';

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
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-6">
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
