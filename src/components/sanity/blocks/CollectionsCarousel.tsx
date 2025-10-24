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
import { useLocale } from 'next-intl';
import { Locale } from '@/i18n/routing';

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
    <div className="w-full flex ">
      <Carousel
        className="w-full flex-col md:flex-row flex gap-4"
        opts={{ loop: true, dragFree: true }}
      >
        <div className="lg:min-w-[500px] flex flex-col justify-between ">
          <h2 className="text-2xl md:text-5xl font-bold">
            {title ? title[locale] : ''}
          </h2>
          <div className=" w-full justify-between hidden md:flex">
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
                <Card className="h-full rounded-none p-0 border-0 shadow-none bg-[#eeeeee]">
                  <CardContent className="flex flex-col  rounded-none p-0 border-0 shadow-none h-full justify-between">
                    <div className="w-full flex justify-center items-center overflow-hidden  border-sidebar-ring ">
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
        <div className=" w-full justify-between flex md:hidden">
          <Button
            className="rounded-none border-1  border-gray-300"
            variant={'ghost'}
          >
            <Link href={action_link || ''}>
              {action_text ? action_text[locale] : ''}
            </Link>
          </Button>
        </div>
      </Carousel>
    </div>
  );
};
export default CollectionsCarousel;
