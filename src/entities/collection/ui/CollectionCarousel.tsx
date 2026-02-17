'use client';
import { Card, CardContent } from '@/shared/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/shared/ui/carousel';
import { Link } from '@shared/i18n/navigation';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Locale } from '@/shared/i18n/routing';

type CollectionItem = {
  _id?: string;
  title?: string | null;
  store?: {
    imageUrl?: string | null;
    isDeleted?: boolean | null;
    slug?: { current?: string | null } | null;
    title?: string | null;
    gid?: string | null;
  } | null;
};

const CollectionsCarousel = (props: {
  collections: CollectionItem[] | null | undefined;
  title?: string | { [key: string]: string } | null;
  action_text?: string | { [key: string]: string } | null;
  gender?: string;
}) => {
  const { collections, title, action_text, gender } = props;
  const locale = useLocale() as Locale;
  const t = useTranslations('productCarousel');

  // Handle both string (from coalesce) and object (localized) title formats
  const displayTitle = typeof title === 'string'
    ? title
    : title?.[locale] || '';
  const displayActionText = typeof action_text === 'string'
    ? action_text
    : action_text?.[locale] || t('VIEW_ALL');

  return (
    <div className="w-full container flex flex-col gap-8 py-1">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl md:text-5xl font-bold">
          {displayTitle}
        </h2>
        <div className="hidden md:flex items-center">
          <div className="flex h-full justify-end">
            <Link href={gender ? `/${gender}/all` : `/all`} className="text-md underline">
              {displayActionText || t('VIEW_ALL')}
            </Link>
          </div>
        </div>
      </div>
      <Carousel className="w-full" opts={{ loop: true, dragFree: true }}>
        <CarouselContent className="-ml-1">
          {collections?.map((collection, index) => (
            <CarouselItem key={index} className="pl-1 basis-1/2 md:basis-1/3">
              <Link href={gender ? `/${gender}/${collection.store?.slug?.current}` : `/${collection.store?.slug?.current}`}>
                <div className="p-1 h-full">
                  <Card className="h-full rounded-md p-0 border-0 shadow-none bg-transparent">
                    <CardContent className="relative flex flex-col  rounded-md p-0 border-0 shadow-none h-full justify-between">
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
            className=" rounded-md p-6 hover:bg-card"
            variant={'ghost'}
          />
          <CarouselNext
            className="rounded-md p-6 hover:bg-card"
            variant={'ghost'}
          />
        </div>
      </Carousel>
    </div>
  );
};
export default CollectionsCarousel;
