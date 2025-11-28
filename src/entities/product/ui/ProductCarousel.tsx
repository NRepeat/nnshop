import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/shared/ui/carousel';
import { Link } from '@shared/i18n/navigation';
import { Collection, PAGE_QUERYResult } from '@/shared/sanity/types';
import { getLocale, getTranslations } from 'next-intl/server';
import { getCollection } from '@entities/collection/api/getCollection';
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
  const shopifyCollection = await getCollection({
    handle: collectionHandle,
    first: 12,
  });
  if (!shopifyCollection) return null;
  const products = shopifyCollection.collection?.products.edges.map(
    (edge) => edge.node,
  );
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
              <div className="h-full px-0  pl-0.5 md:px-1 md:pl-2">
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
