'use clinet';
import { Collection, PAGE_QUERYResult } from '@/shared/sanity/types';
import { Card, CardContent } from '@/shared/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/shared/ui/carousel';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Locale } from '@/shared/i18n/routing';
import { Button } from '@/shared/ui/button';

type ProductCarouselProps = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>['content']>[number],
  { _type: 'collectionsCarousel' }
>;

const CollectionsCarousel = (props: {
  collections:
    | Omit<Collection, '_createdAt' | '_id' | '_rev' | '_type' | '_updatedAt'>[]
    | undefined;
  title: ProductCarouselProps['title'];
  action_text: ProductCarouselProps['action_text'];
  action_link: ProductCarouselProps['action_link'];
}) => {
  const { collections, title, action_text, action_link } = props;
  const locale = useLocale() as Locale;
  const t = useTranslations('productCarousel');
  return (
    <div className="w-full container flex flex-col gap-8 py-16">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl md:text-5xl font-bold">
          {title ? title[locale as keyof typeof title] : ''}
        </h2>
        <div className="hidden md:flex items-center">
          <div className="flex h-full justify-end">
            <Link href={`/collection/all`} className="text-md underline">
              {action_text
                ? action_text[locale as keyof typeof title]
                  ? action_text[locale as keyof typeof title]
                  : t('VIEW_ALL')
                : t('VIEW_ALL')}
            </Link>
          </div>
        </div>
      </div>
      <Carousel className="w-full" opts={{ loop: true, dragFree: true }}>
        <CarouselContent className="-ml-1">
          {collections?.map((collection, index) => (
            <CarouselItem key={index} className="pl-1 basis-1/2 md:basis-1/3">
              <Link href={`/collection/${collection.store?.slug?.current}`}>
                <div className="p-1 h-full">
                  <Card className="h-full rounded-none p-0 border-0 shadow-none bg-transparent">
                    <CardContent className="relative flex flex-col  rounded-none p-0 border-0 shadow-none h-full justify-between">
                      <div className=" w-full flex justify-center items-center overflow-hidden  border-sidebar-ring ">
                        <Image
                          className="h-auto w-full "
                          src={collection.store?.imageUrl || ''}
                          alt={collection.store?.gid || ''}
                          width={300}
                          height={300}
                        />
                        <div className="w-full  flex flex-col py-2 px-4 absolute bottom-0 bg-card/60 backdrop-blur-sm">
                          <div className=" w-full  justify-between flex">
                            <p className="text-md font-medium  text-pretty">
                              {collection.store?.title}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="w-full justify-end gap-4 mt-4 hidden md:flex">
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
export default CollectionsCarousel;
