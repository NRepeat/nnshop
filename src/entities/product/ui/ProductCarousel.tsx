import { Card, CardContent } from '@/shared/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/shared/ui/carousel';
import Image from 'next/image';
import Link from 'next/link';
import { Collection, PAGE_QUERYResult } from '@/shared/sanity/types';
import { getLocale, getTranslations } from 'next-intl/server';
import { getCollection } from '@entities/collection/api/getCollection';
import { Button } from '@shared/ui/button';
import { ProductCard } from './ProductCard';
import { Product } from '@shared/lib/shopify/types/storefront.types';

type ProductCarouselProps = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>['content']>[number],
  { _type: 'productCarousel' }
>;

const ProductCarousel = async ({
  title,
  collection,
}: {
  title: ProductCarouselProps['title'];
  collection: Collection;
}) => {
  const tBetterAuth = await getTranslations('productCarousel');
  const collectionHandle = collection?.store?.slug?.current;
  const locale = await getLocale();
  if (!collectionHandle) return null;
  const shopifyCollection = await getCollection({ handle: collectionHandle });
  if (!shopifyCollection) return null;
  const products = shopifyCollection.collection?.products.edges.map(
    (edge) => edge.node,
  );
  console.log(products, 'pr');
  return (
    <div className="w-full container">
      <div className="flex justify-between items-end    pb-4">
        <h2 className="text-2xl md:text-2xl font-medium md:mb-2">
          {title ? title[locale as keyof typeof title] : ''}
        </h2>
        <div className="flex h-full justify-end">
          <Link
            href={`/collection/${collectionHandle}`}
            className="text-md underline"
          >
            {tBetterAuth('VIEW_ALL')}
          </Link>
        </div>
      </div>
      <Carousel className="w-full" opts={{ loop: true, dragFree: true }}>
        <CarouselContent className="ml-2 ">
          {products?.map((product, index) => (
            <CarouselItem
              key={index}
              className=" basis-1/2 md:basis-1/3 lg:basis-1/4 "
            >
              <div className="h-full  px-1 pl-2">
                <ProductCard product={product as Product} />
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

export default ProductCarousel;
