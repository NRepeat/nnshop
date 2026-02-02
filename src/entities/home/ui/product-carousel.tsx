import { CardCarousel } from '@entities/home/ui/cardCarousel';
import Image from 'next/image';
import { Link } from '@shared/i18n/navigation';
import { HOME_PAGEResult } from '@shared/sanity/types';
import { getCollection } from '@entities/collection/api/getCollection';
import getSymbolFromCurrency from 'currency-symbol-map';
type ProductCarouselGridProps = Extract<
  NonNullable<NonNullable<HOME_PAGEResult>['content']>[number],
  { _type: 'productCarousel' }
> & { locale: string };

export const ProductCarousel = async (props: ProductCarouselGridProps) => {
  const { collection, locale, title } = props;
  const collectionHandle = collection?.handle;
  if (!collectionHandle) return null;
  const shopifyCollection = await getCollection({
    handle: collectionHandle,
    first: 12,
    locale,
  });
  if (!shopifyCollection) return null;
  const products = shopifyCollection.collection?.collection?.products.edges.map(
    (edge) => edge.node,
  );
  const items = products?.map((product, index) => {
    return (
      <Link href={'/product/' + product.handle} className="h-full" key={index} prefetch>
        <div className="flex flex-col gap-3 group relative overflow-hidden h-full">
          <div className="flex justify-start w-full">
            <div className="relative aspect-[1/1] w-full md:max-w-[90%] lg:max-w-95%] ">
              <Image
                src={product.media.edges[0].node.previewImage?.url}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 30vw, 20vw"
                className="object-cover w-full transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>

          <div className="flex flex-col flex-grow">
            <p className="text-start font-sans text-base group-hover:border-b group-hover:border-current transition-colors line-clamp-2 min-h-[3rem] mb-1">
              {product.title}
            </p>
            <div className="mt-auto">
              {product.metafield &&
              product.metafield.key === 'znizka' &&
              product.metafield.value &&
              Number(product.metafield.value) > 0 ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="line-through text-gray-500 text-xs">
                    {parseFloat(
                      product.priceRange?.maxVariantPrice.amount,
                    ).toFixed(0)}{' '}
                    {getSymbolFromCurrency(
                      product.priceRange?.maxVariantPrice.currencyCode,
                    ) || product.priceRange?.maxVariantPrice.currencyCode}
                  </span>

                  <span className="text-red-600 font-bold text-sm">
                    {(
                      product.priceRange?.maxVariantPrice.amount *
                      (1 - parseFloat(product.metafield.value) / 100)
                    ).toFixed(0)}{' '}
                    {getSymbolFromCurrency(
                      product.priceRange?.maxVariantPrice.currencyCode,
                    ) || product.priceRange?.maxVariantPrice.currencyCode}
                  </span>

                  <span className="text-[10px] bg-red-100 text-red-700 px-1 rounded">
                    -{product.metafield.value}%
                  </span>
                </div>
              ) : (
                <span className="font-bold text-sm">
                  {parseFloat(
                    product.priceRange?.maxVariantPrice.amount,
                  ).toFixed(0)}{' '}
                  {getSymbolFromCurrency(
                    product.priceRange?.maxVariantPrice.currencyCode,
                  ) || product.priceRange?.maxVariantPrice.currencyCode}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  });

  return (
    <div className="product-carousel container">
      <div className="py-8 flex flex-col gap-12">
        <p className="px-4 text-xl font-400">{title as unknown as string}</p>
        <CardCarousel
          items={items}
          scrollable={false}
          className="basis-1/2 md:basis-1/4 ml-4"
        />
      </div>
    </div>
  );
};
