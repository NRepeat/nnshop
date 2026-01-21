import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/shared/ui/carousel';
import { Collection } from '@/shared/sanity/types';
import { getCollection } from '@entities/collection/api/getCollection';
import { ProductCard } from './ProductCard';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { getLocale } from 'next-intl/server';

const SimilarProducts = async ({ collection }: { collection: Collection }) => {
  const collectionHandle = collection?.store?.slug?.current;
  const locale = await getLocale();
  if (!collectionHandle) return null;
  const shopifyCollection = await getCollection({
    handle: collectionHandle,
    first: 12,
    locale: locale,
  });
  if (!shopifyCollection) return null;
  const products = shopifyCollection.collection?.collection?.products.edges.map(
    (edge) => edge.node,
  );
  return (
    <div className="w-full container">
      <Carousel className="w-full" opts={{ loop: true, dragFree: true }}>
        <CarouselContent className="ml-2 ">
          {products?.map((product, index) => (
            <CarouselItem
              key={index}
              className=" basis-1/2 md:basis-1/3 lg:basis-1/4 "
            >
              <div className="h-full">
                <ProductCard product={product as Product} addToCard={false} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="w-full hidden md:flex justify-center gap-4 mt-2">
          <CarouselPrevious
            className=" rounded-none p-6 hover:bg-card"
            variant={'ghost'}
          />
          <CarouselNext
            className="rounded-none p-6 hover:bg-card"
            variant={'ghost'}
          />
        </div>
      </Carousel>
    </div>
  );
};

export default SimilarProducts;
