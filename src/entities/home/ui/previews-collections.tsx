import { getCollection } from '@entities/collection/api/getCollection';
import { Link } from '@shared/i18n/navigation';
import { urlFor } from '@shared/sanity/lib/image';
import { HOME_PAGEResult } from '@shared/sanity/types';
import { Carousel, CarouselContent, CarouselItem } from '@shared/ui/carousel';
import getSymbolFromCurrency from 'currency-symbol-map';
import Image from 'next/image';

type PreviewsCollectionsProps = Extract<
  NonNullable<NonNullable<HOME_PAGEResult>['content']>[number],
  { _type: 'collectionsWithPreviews' }
> & { locale: string; buttonText?: string };

export const PreviewsCollections = async (props: PreviewsCollectionsProps) => {
  const { collections, previews, locale } = props;

  const collectionsDataReq = collections
    ?.map((col) => {
      const collectionHandle = col.handle;
      if (collectionHandle) {
        return getCollection({
          handle: collectionHandle,
          first: 12,
          locale,
        });
      }
    })
    .filter(Boolean);
  if (!collectionsDataReq) return null;
  const collectionsData = await Promise.all(collectionsDataReq);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      <div>
        <Carousel opts={{ loop: true }}>
          <CarouselContent>
            {previews?.map((preview) => (
              <CarouselItem key={preview._key}>
                <Link href={`/products/${preview.handle?.current}`}>
                  <Image
                    src={urlFor(preview).url()}
                    alt={'Preview image'}
                    width={500}
                    height={500}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover w-full"
                  />
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      <div>
        <Carousel className="" opts={{ loop: true }}>
          <CarouselContent>
            {collectionsData.filter(Boolean).map(
              (collection) =>
                collection && (
                  <>
                    {collection.collection?.products?.edges?.map((product) => (
                      <CarouselItem
                        className="basis-1/3"
                        key={product.node.handle}
                      >
                        <Link href={product.node.handle} className="h-full">
                          <div className="flex flex-col gap-3 group relative overflow-hidden h-full">
                            <div className="flex justify-start w-full">
                              <div className="relative aspect-[1/1] w-full md:max-w-[90%] lg:max-w-95%] ">
                                <Image
                                  src={
                                    product.node.media.edges[0].node
                                      .previewImage?.url
                                  }
                                  alt={product.node.title}
                                  fill
                                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 30vw, 20vw"
                                  className="object-cover w-full transition-transform duration-300 group-hover:scale-105"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col flex-grow">
                              <p className="text-start font-sans text-base group-hover:underline line-clamp-2 min-h-[3rem] mb-1">
                                {product.node.title}
                              </p>
                              <div className="mt-auto">
                                {product.node.metafield &&
                                product.node.metafield.key === 'znizka' ? (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="line-through text-gray-500 text-xs">
                                      {
                                        product.node.priceRange.maxVariantPrice
                                          .amount
                                      }{' '}
                                      {getSymbolFromCurrency(
                                        product.node.priceRange.maxVariantPrice
                                          .currencyCode,
                                      ) ||
                                        product.node.priceRange.maxVariantPrice
                                          .currencyCode}
                                    </span>

                                    <span className="text-red-600 font-bold text-sm">
                                      {(
                                        product.node.priceRange.maxVariantPrice
                                          .amount *
                                        (1 -
                                          parseFloat(
                                            product.node.metafield.value,
                                          ) /
                                            100)
                                      ).toFixed(2)}{' '}
                                      {getSymbolFromCurrency(
                                        product.node.priceRange.maxVariantPrice
                                          .currencyCode,
                                      ) ||
                                        product.node.priceRange.maxVariantPrice
                                          .currencyCode}
                                    </span>

                                    <span className="text-[10px] bg-red-100 text-red-700 px-1 rounded">
                                      -{product.node.metafield.value}%
                                    </span>
                                  </div>
                                ) : (
                                  <span className="font-bold text-sm">
                                    {
                                      product.node.priceRange.maxVariantPrice
                                        .amount
                                    }{' '}
                                    {getSymbolFromCurrency(
                                      product.node.priceRange.maxVariantPrice
                                        .currencyCode,
                                    ) ||
                                      product.node.priceRange.maxVariantPrice
                                        .currencyCode}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </CarouselItem>
                    ))}
                  </>
                ),
            )}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};
