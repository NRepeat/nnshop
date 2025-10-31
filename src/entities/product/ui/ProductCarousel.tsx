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
import { Collection, PAGE_QUERYResult, Product } from '@/shared/sanity/types';
import { Locale } from '@/shared/i18n/routing';
import { getLocale, getTranslations } from 'next-intl/server';
import { getCollection } from '@entities/collection/api/getCollection';
import { Button } from '@shared/ui/button';

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
  return (
    <div className="w-full">
      <div className="flex justify-between items-end   container pb-4">
        <h2 className="text-2xl md:text-2xl font-medium md:mb-2">
          {title ? title[locale as keyof typeof title] : ''}
        </h2>
        <div className="flex h-full justify-end">
          <Link href="/products" className="text-md underline">
            {tBetterAuth('VIEW_ALL')}
          </Link>
        </div>
      </div>
      <Carousel className="w-full" opts={{ loop: true, dragFree: true }}>
        <CarouselContent className="ml-1 ">
          {products?.map((product, index) => (
            <CarouselItem
              key={index}
              className="pl-1 basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <div className="p-1 h-full">
                <Card className="h-full rounded-none p-0 border-0 shadow-none bg-[#eeeeee]">
                  <CardContent className="flex flex-col  rounded-none p-0 border-0 shadow-none h-full justify-between">
                    <div className=" flex justify-center items-center overflow-hidden  border-sidebar-ring w-[160px] md:w-full">
                      <Image
                        className="h-auto w-full "
                        src={product.featuredImage?.url || ''}
                        alt={product.featuredImage?.altText || ''}
                        width={product.featuredImage?.width || 300}
                        height={product.featuredImage?.height || 300}
                      />
                    </div>
                    <div className="w-full pt-6  flex flex-col gap-1">
                      <span className="text-md font-bold">
                        {product.vendor}
                      </span>
                      <div>
                        <div className=" w-full flex-col  justify-between flex pb-4">
                          <p className="text-md font-light  text-pretty">
                            {product?.title}
                          </p>
                          <span className="text-md font-light text-pretty">
                            Slize:{' '}
                            {product?.options.find((f) => f.name === 'Size')
                              ?.optionValues[0].name || 'N/A'}
                          </span>
                        </div>
                        <span>
                          {product.priceRange.maxVariantPrice.currencyCode}{' '}
                          {product.priceRange.maxVariantPrice.amount}
                        </span>
                      </div>
                    </div>
                    <div className=" w-full mt-4 flex justify-center">
                      <Button
                        variant={'outline'}
                        className="w-full bg-transparent rounded-none "
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="w-full hidden md:flex justify-center gap-4 mt-6">
          <CarouselPrevious className=" rounded-sm" variant={'ghost'} />
          <CarouselNext className="rounded-sm" variant={'ghost'} />
        </div>
      </Carousel>
    </div>
  );
};

export default ProductCarousel;
