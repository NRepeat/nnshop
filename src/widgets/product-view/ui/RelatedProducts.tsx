import { ProductCard } from '@entities/product/ui/ProductCard';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@shared/ui/carousel';

export function RelatedProducts({ products, title }: { products: Product[]; title: string }) {
  return (
    <div className="content-stretch flex flex-col gap-[30px] items-center px-0 py-[30px] relative w-full">
      <p className="text-3xl md:text-3xl text-center font-400">{title}</p>
      <div className="w-full">
        <Carousel className="w-full" opts={{ loop: true, dragFree: true }}>
          <CarouselContent className="ml-2">
            {products.map((p) => (
              <CarouselItem key={p.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                <ProductCard product={p} withInnerShadow />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="w-full hidden md:flex justify-center gap-4 mt-2">
            <CarouselPrevious className="rounded-full p-6 hover:bg-card" variant="ghost" />
            <CarouselNext className="rounded-full p-6 hover:bg-card" variant="ghost" />
          </div>
        </Carousel>
      </div>
    </div>
  );
}
