import { ProductCard } from '@entities/product/ui/ProductCard';
import { Product } from '@shared/lib/shopify/types/storefront.types';

export function RelatedProducts({ products, title }: { products: Product[]; title: string }) {
  return (
    <div className="content-stretch flex flex-col gap-[30px] items-center px-0 py-[30px] relative w-full">
      <p className="text-3xl md:text-3xl text-center font-400">{title}</p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 mx-auto max-w-5xl py-0 w-full">
        {products.slice(0, 3).map((p) => (
          <div key={p.id}>
            <ProductCard product={p} withInnerShadow />
          </div>
        ))}
      </div>
    </div>
  );
}
