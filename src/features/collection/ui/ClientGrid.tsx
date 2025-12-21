'use client';

import { ProductCard } from '@entities/product/ui/ProductCard';
import { Product } from '@shared/lib/shopify/types/storefront.types';

export const ClientGrid = ({ products }: { products: Product[] }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 h-full ">
      {products.map((product) => (
        <div key={product.id} className="col-span-1">
          <ProductCard product={product} className=" px-0" withCarousel />
        </div>
      ))}
    </div>
  );
};
