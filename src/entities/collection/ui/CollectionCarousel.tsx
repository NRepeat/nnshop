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
import { useLocale } from 'next-intl';
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
  return (
    <div className="w-full flex container">
      <Carousel
        className="w-full flex-col md:flex-row grid grid-cols-3 gap-4"
        opts={{ loop: true, dragFree: true }}
      >
        <div className="col-span-1 flex flex-col justify-between ">
          <h2 className="text-2xl md:text-5xl font-bold">
            {title ? title.en : ''}
          </h2>
          <div className=" w-full justify-between hidden md:flex">
            <Button
              className="border-black border rounded-none hover:bg-black hover:text-card"
              variant={'outline'}
            >
              <Link href={action_link || ''}>
                {action_text ? action_text.en : ''}
              </Link>
            </Button>
            <div className=" flex justify-end gap-4 ">
              <CarouselPrevious
                className=" rounded-none p-6 hover:bg-card"
                variant={'ghost'}
              />
              <CarouselNext
                className="rounded-none p-6 hover:bg-card"
                variant={'ghost'}
              />
            </div>
          </div>
        </div>

        <CarouselContent className="-ml-1 col-span-2">
          {collections?.map((collection, index) => (
            <CarouselItem key={index} className="pl-1 basis-1/2 ">
              <Link href={`/collections/${collection.store?.slug?.current}`}>
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
        <div className=" w-full justify-between flex md:hidden">
          <Button className="rounded-none " variant={'ghost'}>
            <Link href={action_link || ''}>
              {action_text ? action_text.en : ''}
            </Link>
          </Button>
        </div>
      </Carousel>
    </div>
  );
};
export default CollectionsCarousel;
