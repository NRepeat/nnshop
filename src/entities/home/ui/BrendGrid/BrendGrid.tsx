'use client';
import Image from 'next/image';
import { Link } from '@shared/i18n/navigation';
import { urlFor } from '@/shared/sanity/lib/image';
import { HOME_PAGEResult } from '@shared/sanity/types';
import { Carousel, CarouselContent, CarouselItem } from '@shared/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { resolveCollectionLink } from '@shared/lib/shopify/resolve-shopify-link';
import { cn } from '@shared/lib/utils';

type BrandGridProps = Extract<
  NonNullable<NonNullable<HOME_PAGEResult>['content']>[number],
  { _type: 'brandGridBlock' }
> & { locale: string; buttonText?: string; gender?: string };
export function BrandGrid({ barnds, locale, gender }: BrandGridProps) {
  if (!barnds || barnds.length === 0) return null;

  const getBrandHref = (brand: NonNullable<typeof barnds>[number]) => {
    const collectionHandle = brand.collectionData?.handle;
    if (brand.isBrandCollection && collectionHandle) {
      return `/brand/${collectionHandle}`;
    }
    return (
      resolveCollectionLink(brand.collectionData, locale, gender).handle ||
      collectionHandle ||
      ''
    );
  };

  return (
    <section className="container  ">
      <div className="py-8">
        <div className="hidden md:grid grid-cols-2 items-center justify-items-center gap-x-6 gap-y-10 md:grid-cols-5 md:gap-x-4 md:gap-y-4">
          {barnds.map((brand) => (
            <Link
              key={brand._key}
              href={getBrandHref(brand)}
              className="cursor-pointer basis-1/3"
            >
              <div className="relative group flex aspect-video max-w-[160px] h-[100px] items-center justify-center overflow-hidden transition-all duration-300 hover:opacity-60">
                {brand.asset ? (
                  <Image
                    src={urlFor(brand).width(160).height(100).url()}
                    alt={brand.alt || brand.collectionData?.handle || 'brand logo'}
                    fill
                    sizes="160px"
                    className={cn('object-contain', {
                      'scale-150':
                        brand.collectionData?.handle === 'ghoud' ||
                        brand.collectionData?.handle === 'agl',
                    })}
                  />
                ) : null}
              </div>
            </Link>
          ))}
        </div>
        <Carousel
          className="block md:hidden"
          opts={{ loop: true }}
          plugins={[Autoplay({ active: true, delay: 1800, playOnInit: true })]}
        >
          <CarouselContent className="-ml-2">
            {Array.from({ length: Math.ceil(barnds.length / 2) }).map(
              (_, i) => (
                <CarouselItem key={i} className="pl-8 basis-1/3">
                  <div className="flex flex-col gap-y-8">
                    {barnds.slice(i * 2, i * 2 + 2).map((brand) => (
                      <Link href={getBrandHref(brand)} key={brand._key}>
                        <div className="group relative flex h-16 w-full max-w-[160px] items-center justify-center transition-all duration-300 hover:opacity-60 mx-auto">
                          {brand.asset ? (
                            <Image
                              src={urlFor(brand).width(160).height(100).url()}
                              alt={brand.alt || brand.collectionData?.handle || 'brand logo'}
                              fill
                              sizes="160px"
                              className={cn('object-contain', {
                                'scale-150':
                                  brand.collectionData?.handle === 'ghoud' ||
                                  brand.collectionData?.handle === 'agl',
                              })}
                            />
                          ) : null}
                        </div>
                      </Link>
                    ))}
                  </div>
                </CarouselItem>
              ),
            )}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
