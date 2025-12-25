import { Locale, locales } from '@/shared/i18n/routing';
import { getPage } from '@features/home/api/get-home-page';
import { PageBuilder } from '@widgets/page-builder';
import { getLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import Loading from './(checkout)/checkout/[...slug]/loading';
import Image from 'next/image';
import { Button } from '@shared/ui/button';
import Link from 'next/link';
import { CardCarousel } from '@entities/home/ui/cardCarousel';
import { StoriesCarousel } from '@entities/home/ui/stories-carousel';

export async function generateStaticParams() {
  return locales.map((locale) => ({
    locale: locale,
  }));
}

export default async function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <CurrentSession />
    </Suspense>
  );
}

const CurrentSession = async () => {
  const locale = (await getLocale()) as Locale;
  const cookie = await cookies();
  const gender = cookie.get('gender')?.value || 'woman';
  return <PageContent locale={locale} gender={gender} />;
};
const LeftImage = `${process.env.BLOB_BASE_URL}/assests/home/image/home-banner/hero-banner-left.png`;
const PageContent = async ({
  locale,
  gender,
}: {
  locale: Locale;
  gender: string;
}) => {
  'use cache';
  // cacheLife({ stale: 60, expire: 60 });
  const page = await getPage({ locale, gender });
  const collections = [
    { label: 'Collection 1', slug: '1', image: LeftImage },
    { label: 'Collection 2', slug: '2', image: LeftImage },
    { label: 'Collection 3', slug: '3', image: LeftImage },
    { label: 'Collection 4', slug: '4', image: LeftImage },
  ];
  const products = [
    {
      node: {
        title: 'Product 1',
        featuredImage: {
          url: LeftImage,
          width: 400,
          height: 400,
        },
        amount: 100,
        currency: '$',
      },
    },
    {
      node: {
        title: 'Product 2',
        featuredImage: {
          url: LeftImage,
          width: 400,
          height: 400,
        },
        amount: 100,
        currency: '$',
      },
    },
    {
      node: {
        title: 'Product 2',
        featuredImage: {
          url: LeftImage,
          width: 400,
          height: 400,
        },
        amount: 100,
        currency: '$',
      },
    },
    {
      node: {
        title: 'Product 2',
        featuredImage: {
          url: LeftImage,
          width: 400,
          height: 400,
        },
        amount: 100,
        currency: '$',
      },
    },
  ];
  const items = products.map((product) => (
    <div key={product.node.title} className="flex flex-col gap-3 pl-2.5">
      <div className="flex-col flex">
        <Image
          src={product.node.featuredImage?.url}
          alt={product.node.title}
          className="w-full h-full object-cover"
          width={product.node.featuredImage?.width || 400}
          height={product.node.featuredImage?.height || 400}
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-start font-sans  text-base group-hover:underline text-ellipsis overflow-hidden">
          {product.node.title}
        </p>
        <div className="flex flex-1">
          <p className=" font-400 text-xs">
            <span> {product.node.currency}</span>
            {product.node.amount}
          </p>
        </div>
      </div>
    </div>
  ));
  if (page) {
    return (
      <div className="flex flex-col ">
        <div className="flex flex-col">
          <div className="hero-banner relative">
            <Image
              src={LeftImage}
              alt=""
              className=" object-cover w-full max-h-[598px]"
              width={375}
              height={598}
            />
            <div className="absolute bottom-16 left-[32px] w-fit flex flex-col gap-5">
              <p className="text-white text-xl  font-sans font-400">
                Elevate Your Style <br /> Timeless Fashion,
                <br /> Sustainable <br /> Choices
              </p>
              <Button className="w-[120px]" variant={'secondary'}>
                Shop now
              </Button>
            </div>
          </div>
          <div className="main-collection-grid flex flex-col container ">
            <div className=" gap-12 flex flex-col py-8">
              <p className="p-4 font-400 text-xl">
                Elevate your lifestyle with a more intelligent, superior
                wardrobe. Our range is crafted sustainably with longevity in
                mind.
              </p>
              <div className="flex flex-col gap-5">
                {collections.map((collection) => (
                  <Link href={collection.slug}>
                    <div className="flex flex-col relative">
                      <h3 className="text-white text-xl  font-sans font-400 absolute bottom-5 left-5">
                        {collection.label}
                      </h3>
                      <Image
                        src={collection.image}
                        alt={collection.label}
                        className="object-cover w-full max-h-[598px]"
                        width={375}
                        height={598}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="product-carousel">
            <div className="py-8 flex flex-col gap-12">
              <p className="px-8 text-xl font-400 text-forgraund">
                What to Wear Now
              </p>
              <CardCarousel
                items={items}
                scrollable={false}
                className="basis-1/2 md:basis-1/4 ml-4"
              />
            </div>
          </div>
          <div className="main-collection-grid flex flex-col container ">
            <div className=" gap-12 flex flex-col py-8">
              <div className="flex flex-col gap-5">
                {collections.slice(0, 2).map((collection) => (
                  <Link href={collection.slug}>
                    <div className="flex flex-col relative">
                      <h3 className="text-white text-xl  font-sans font-400 absolute bottom-5 left-5">
                        {collection.label}
                      </h3>
                      <Image
                        src={collection.image}
                        alt={collection.label}
                        className="object-cover w-full max-h-[598px]"
                        width={375}
                        height={598}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="topic bg-muted/50 px-[34px] py-18 flex justify-center items-center flex-col gap-12">
            <h4 className="text-2xl text-center">
              The Art of Fewer,
              <br /> Better Choices
            </h4>
            <p className="text-base font-400 text-center text-pretty">
              Opting for quality over quantity means selecting timeless,
              durable, and responsibly made items. This approach simplifies our
              lives and fosters a deeper appreciation for our surroundings.
              Emphasizing longevity and responsible production resonates with a
              more sustainable and mindful lifestyle.
            </p>
          </div>
          <StoriesCarousel />
        </div>
      </div>
    );
  }

  return (
    <PageBuilder
      content={page?.content as any}
      documentId={page?._id}
      documentType="page"
    />
  );
};
