import { Card, CardContent } from '@/shared/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@shared/ui/button';
import { Bookmark } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { GetCollectionQuery } from '@shared/lib/shopify/types/storefront.generated';
import { Product } from '@shared/lib/shopify/types/storefront.types';

type ProductCardProps = {
  product: Product;
  addToCard?: boolean;
};

export const ProductCard = async ({
  product,
  addToCard = true,
}: ProductCardProps) => {
  const tBetterAuth = await getTranslations('productCarousel');

  return (
    <Card className="h-full shadow-none backdrop-blur-sm bg-transparent border-gray-200 border-nonerounded-xl  py-0">
      <CardContent className="  flex flex-col  rounded-none p-0 border-0 shadow-none h-full justify-between bg-transparent">
        <Link href={`/products/${product.handle}`}>
          <div className="relative flex justify-center items-center overflow-hidden  border-sidebar-ring w-full">
            <Image
              className="h-auto w-full "
              src={product.featuredImage?.url || ''}
              alt={product.featuredImage?.altText || ''}
              width={product.featuredImage?.width || 300}
              height={product.featuredImage?.height || 300}
            />
            {/*<div className="absolute right-3 top-3 group">
              <Bookmark className="group-hover:fill-black" />
            </div>*/}
          </div>
        </Link>
        {
          <div className="w-full pt-2 md:pt-6  flex flex-col gap-1">
            <span className="text-md font-bold">{product.vendor}</span>
            <div>
              <div className=" w-full flex-col  justify-between flex pb-4">
                <Link href={`/products/${product.handle}`}>
                  <p className="text-md font-light  text-pretty">
                    {product?.title}
                  </p>
                </Link>
                <span className="text-md font-light text-pretty">
                  Slize:{' '}
                  {product?.options.find((f) => f.name === 'Size')
                    ?.optionValues[0].name || 'N/A'}
                </span>
              </div>
              <span>
                {product.priceRange.maxVariantPrice.currencyCode}{' '}
                {product.priceRange.maxVariantPrice.amount}
              </span>
            </div>
          </div>
        }

        {addToCard && (
          <div className=" w-full mt-1 md:mt-4 flex justify-center">
            <Button
              variant={'outline'}
              className="w-full   rounded-none bg-transparent hover:bg-black hover:text-white  py-5 border shadow-none"
            >
              {tBetterAuth('add_to_cart')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
