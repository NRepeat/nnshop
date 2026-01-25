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
import { notFound } from 'next/navigation';
import { isProductFavorite } from '@features/product/api/isProductFavorite';
import { headers } from 'next/headers';
import { auth } from '@features/auth/lib/auth';

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
  const rawProducts =
    shopifyCollection.collection?.collection?.products.edges.map(
      (edge) => edge.node,
    );
  if (!rawProducts) {
    return notFound();
  }
  const session = await auth.api.getSession({ headers: await headers() });
  const productsWithFavStatus = await Promise.all(
    rawProducts.map(async (product) => {
      const isFav = await isProductFavorite(product.id, session);
      console.log('🚀 ~ ProductCarousel ~ product:', product, isFav);

      return {
        ...product,
        isFav,
      };
    }),
  );
  return (
    <div className="w-full container">
      <Carousel className="w-full" opts={{ loop: true, dragFree: true }}>
        <CarouselContent className="ml-2 ">
          {productsWithFavStatus?.map((product, index) => (
            <CarouselItem
              key={index}
              className=" basis-1/2 md:basis-1/3 lg:basis-1/4 "
            >
              <div className="h-full">
                {/* @ts-ignore */}
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
