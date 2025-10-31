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
import { PAGE_QUERYResult, Product } from '@/shared/sanity/types';
import { Locale } from '@/shared/i18n/routing';
import { getLocale, getTranslations } from 'next-intl/server';

type ProductCarouselProps = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>['content']>[number],
  { _type: 'productCarousel' }
>;

const ProductCarousel = async ({
  products,
  title,
}: {
  title: ProductCarouselProps['title'];
  products: Product[];
}) => {
  // const plugin = useRef(AutoHeight({ active: true }));
  const tBetterAuth = await getTranslations('productCarousel');
  return (
    <div className="w-full">
      <div className="flex justify-between items-end   container pb-4">
        <h2 className="text-2xl md:text-5xl font-bold md:mb-5">
          {title ? title.en : ''}
        </h2>
        <div className="flex h-full justify-end">
          <Link href="/products" className="text-md underline">
            {tBetterAuth('VIEW_ALL')}
          </Link>
        </div>
      </div>
      <Carousel className="w-full" opts={{ loop: true, dragFree: true }}>
        <CarouselContent className="-ml-1 ">
          {products?.map((product, index) => (
            <CarouselItem
              key={index}
              className="pl-1 basis-1/2 md:basis-1/3 lg:basis-1/4 max-w-[400px]"
            >
              <div className="p-1 h-full">
                <Card className="h-full rounded-none p-0 border-0 shadow-none bg-[#eeeeee]">
                  <CardContent className="flex flex-col  rounded-none p-0 border-0 shadow-none h-full justify-between">
                    <div className="w-full flex justify-center items-center overflow-hidden  border-sidebar-ring ">
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
        <div className="w-full hidden md:flex justify-center gap-4 mt-6">
          <CarouselPrevious className=" rounded-sm" variant={'ghost'} />
          <CarouselNext className="rounded-sm" variant={'ghost'} />
        </div>
      </Carousel>
    </div>
  );
};

export default ProductCarousel;
