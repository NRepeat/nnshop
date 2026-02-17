'use client';
import Image from 'next/image';
import { Link } from '@shared/i18n/navigation';
import { urlFor } from '@/shared/sanity/lib/image';
import { HOME_PAGEResult } from '@shared/sanity/types';
import { Carousel, CarouselContent, CarouselItem } from '@shared/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { resolveCollectionLink } from '@shared/lib/shopify/resolve-shopify-link';

type BrandGridProps = Extract<
  NonNullable<NonNullable<HOME_PAGEResult>['content']>[number],
  { _type: 'brandGridBlock' }
> & { locale: string; buttonText?: string; gender?: string };
export function BrandGrid({ barnds, locale, gender }: BrandGridProps) {
  if (!barnds || barnds.length === 0) return null;

  return (
    <section className="container  ">
      <div className="px-4 mx-auto py-4 md:py-8">
        {/*{
          <h2 className="mb-16 text-center  max-w-4xl text-pretty font-light text-lg md:text-3xl">
            {'Популярні бренди'}
          </h2>
        }*/}

        <div className="hidden md:grid grid-cols-2 items-center justify-items-center gap-x-6 gap-y-10 md:grid-cols-5 md:gap-x-8 md:gap-y-8">
          {barnds.map((brand) => (
            <Link
              key={brand._key}
              href={
                resolveCollectionLink(brand.collectionData, locale, gender).handle ||
                brand.collectionData?.handle ||
                ''
              }
              className="cursor-pointer basis-1/3"
            >
              <div className="group relative flex h-16 w-full max-w-[160px] items-center justify-center transition-all duration-300 hover:opacity-60">
                {brand.asset ? (
                  <Image
                    src={urlFor(brand).width(300).url()}
                    alt="brand logo"
                    width={160}
                    height={60}
                    className="max-h-full w-auto object-contain"
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
                <CarouselItem key={i} className="pl-2 basis-1/2 sm:basis-1/3">
                  <div className="flex flex-col gap-y-8">
                    {barnds.slice(i * 2, i * 2 + 2).map((brand) => (
                      <Link
                        href={`/brand/${brand.handle?.current}`}
                        key={brand._key}
                      >
                        <div className="group relative flex h-16 w-full max-w-[160px] items-center justify-center transition-all duration-300 hover:opacity-60 mx-auto">
                          {brand.asset ? (
                            <Image
                              src={urlFor(brand).width(300).url()}
                              alt="brand logo"
                              width={160}
                              height={60}
                              className="max-h-full w-auto object-contain"
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
        {/* <div className="mt-6 flex justify-center">
          <Button
            asChild
            variant="outline"
            className="group h-12 min-w-[200px] rounded-lg border-slate-300 px-8 text-sm font-medium transition-all hover:border-slate-900 hover:bg-transparent active:scale-95"
          >
            <Link href="/brands" className="flex items-center gap-2">
              {buttonText}
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div> */}
      </div>
    </section>
  );
}
