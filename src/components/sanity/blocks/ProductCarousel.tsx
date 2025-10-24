import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Image from 'next/image';
import { useRef } from 'react';
import AutoHeight from 'embla-carousel-auto-height';
import Link from 'next/link';
import { PAGE_QUERYResult, Product } from '@/sanity/types';
import { getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';

type ProductCarouselProps = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>['content']>[number],
  { _type: 'productCarousel' }
>;

const ProductCarousel = ({
  products,
  title,
  locale,
}: {
  title: ProductCarouselProps['title'];
  products: Product[];
  locale: string;
}) => {
  const plugin = useRef(AutoHeight({ active: true }));
  const tBetterAuth = useTranslations('productCarousel');
  console.log('ProductCarousel', tBetterAuth('VIEW_ALL'));
  return (
    <div className="w-full">
      <div className="flex justify-between items-end   container pb-4">
        <h2 className="text-5xl font-bold mb-8">{title[locale]}</h2>
        <div className="flex h-full justify-end">
          <Link href="/products" className="text-md underline">
            {tBetterAuth('VIEW_ALL')}
          </Link>
        </div>
      </div>
      <Carousel
        className="w-full"
        plugins={[plugin.current]}
        opts={{ loop: true, dragFree: true }}
      >
        <CarouselContent className="-ml-1 ">
          {products?.map((product, index) => (
            <CarouselItem
              key={index}
              className="pl-1 basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <div className="p-1 h-full">
                <Card className="h-full rounded-none p-0 border-0 shadow-none">
                  <CardContent className="flex flex-col  rounded-none p-0 border-0 shadow-none h-full justify-between">
                    <div className="w-full flex justify-center items-center overflow-hidden  border-sidebar-ring">
                      <Image
                        className="h-auto w-full "
                        src={product.store?.previewImageUrl || ''}
                        alt={product.store?.gid || ''}
                        width={300}
                        height={300}
                      />
                    </div>
                    <div className="w-full pt-4  flex flex-col">
                      <span className="text-sm text-gray-500">
                        {product.store?.productType}
                      </span>
                      <div className=" w-full  justify-between flex">
                        <p className="text-md font-medium  text-pretty">
                          {product.store?.title}
                        </p>
                        <span>
                          {product.store?.priceRange?.maxVariantPrice}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="w-full flex justify-center gap-4 mt-6">
          <CarouselPrevious className="border-1 border-sidebar-ring rounded-none" />
          <CarouselNext className="border-1 border-sidebar-ring rounded-none" />
        </div>
      </Carousel>
    </div>
  );
};

export default ProductCarousel;
