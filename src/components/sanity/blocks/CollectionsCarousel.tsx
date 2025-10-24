import { Button } from '@/components/ui/button';
import { Collection, PAGE_QUERYResult } from '@/sanity/types';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Link from 'next/link';
import Image from 'next/image';

type ProductCarouselProps = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>['content']>[number],
  { _type: 'collectionsCarousel' }
>;

const CollectionsCarousel = (props: {
  collections: Collection[];
  title: ProductCarouselProps['title'];
  action_text: ProductCarouselProps['action_text'];
  action_link: ProductCarouselProps['action_link'];
  locale: 'en' | 'ua';
}) => {
  const { collections, locale, title, action_text, action_link } = props;
  return (
    <div className="w-full flex ">
      <Carousel
        className="w-full flex-row flex"
        opts={{ loop: true, dragFree: true }}
      >
        <div className="min-w-[300px] flex flex-col justify-between container">
          <h2 className="text-5xl font-bold">{title ? title[locale] : ''}</h2>
          <div className="flex w-full justify-between">
            <Button className="">
              <Link href={action_link || ''}>
                {action_text ? action_text[locale] : ''}
              </Link>
            </Button>
            <div className=" flex justify-end gap-4 ">
              <CarouselPrevious className="border-1 border-sidebar-ring rounded-none" />
              <CarouselNext className="border-1 border-sidebar-ring rounded-none" />
            </div>
          </div>
        </div>

        <CarouselContent className="-ml-1 ">
          {collections?.map((collection, index) => (
            <CarouselItem key={index} className="pl-1 basis-1/2 ">
              <div className="p-1 h-full">
                <Card className="h-full rounded-none p-0 border-0 shadow-none">
                  <CardContent className="flex flex-col  rounded-none p-0 border-0 shadow-none h-full justify-between">
                    <div className="w-full flex justify-center items-center overflow-hidden  border-sidebar-ring">
                      <Image
                        className="h-auto w-full "
                        src={collection.store?.imageUrl || ''}
                        alt={collection.store?.gid || ''}
                        width={300}
                        height={300}
                      />
                    </div>
                    <div className="w-full pt-4  flex flex-col">
                      {/*<span className="text-sm text-gray-500">
                        {collection.store?.productType}
                      </span>*/}
                      <div className=" w-full  justify-between flex">
                        <p className="text-md font-medium  text-pretty">
                          {collection.store?.title}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
export default CollectionsCarousel;
