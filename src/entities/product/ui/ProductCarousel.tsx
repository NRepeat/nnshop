import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/shared/ui/carousel';
import { Link } from '@shared/i18n/navigation';import { Collection, PAGE_QUERYResult } from '@/shared/sanity/types';
import { getLocale, getTranslations } from 'next-intl/server';
import { getCollection } from '@entities/collection/api/getCollection';
import { ProductCard } from './ProductCard';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { isProductFavorite } from '@features/product/api/isProductFavorite';
import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';

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
  const collectionHandle = collection?.store?.slug?.current;
  const locale = await getLocale();
  const tBetterAuth = await getTranslations({
    locale,
    namespace: 'productCarousel',
  });

  if (!collectionHandle) return null;

  const shopifyCollection = await getCollection({
    handle: collectionHandle,
    first: 12,
    locale,
  });

  if (!shopifyCollection) return null;

  const rawProducts =
    shopifyCollection.collection?.collection?.products.edges.map(
      (edge) => edge.node,
    ) || [];

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
      <div className="flex justify-between items-end pb-4">
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
        <CarouselContent className="ml-2">
          {productsWithFavStatus.map((product) => (
            <CarouselItem
              key={product.id}
              className="basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <div className="h-full px-0 pl-0.5 md:px-1 md:pl-2">
                <ProductCard
                  // @ts-ignore
                  product={product as Product}
                  isFav={product.isFav}
                  withCarousel={false}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="w-full hidden md:flex justify-center gap-4 mt-2">
          <CarouselPrevious
            className="rounded-none p-6 hover:bg-card"
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
