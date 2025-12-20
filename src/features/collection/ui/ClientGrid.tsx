'use client';

import { ProductCard } from '@entities/product/ui/ProductCard';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

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
    <>
      {tempProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          className="pl-0 pr-0"
          withCarousel
        />
      ))}
    </>
  );
};
