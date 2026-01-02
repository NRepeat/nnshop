import Gallery from '@features/product/ui/Gallery';
import {
  ProductVariant,
  Product as ShopifyProduct,
} from '@shared/lib/shopify/types/storefront.types';
import { PAGE_QUERYResult } from '@shared/sanity/types';
import { Session, User } from 'better-auth';
import { Button } from '@shared/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/ui/accordion';
import Link from 'next/link';
import { ProductCardSPP } from '@entities/product/ui/ProductCardSPP';
import { cn } from '@shared/lib/utils';
import ProductComments from '@features/product-comments/ui/ProductComments';

export const colorMap: { [key: string]: string } = {
  Бежевий: 'bg-[#F5F5DC]',
  Блакитний: 'bg-[#87CEEB]',
  Бордовий: 'bg-[#800000]',
  Бронзовий: 'bg-[#CD7F32]',
  Білий: 'bg-[#FFFFFF]',
  Жовтий: 'bg-[#FFFF00]',
  Зелений: 'bg-[#008000]',
  Золото: 'bg-[#FFD700]',
  Коричневий: 'bg-[#A52A2A]',
  "М'ятний": 'bg-[#98FF98]',
  Мультиколор: 'bg-gradient-to-r from-red-500 to-blue-500',
  Помаранчевий: 'bg-[#FFA500]',
  Пітон: 'bg-gray-500',
  Рожевий: 'bg-[#FFC0CB]',
  Рудий: 'bg-[#D2691E]',
  Синій: 'bg-[#0000FF]',
  Срібло: 'bg-[#C0C0C0]',
  Сірий: 'bg-[#808080]',
  Фіолетовий: 'bg-[#8A2BE2]',
  Хакі: 'bg-[#F0E68C]',
  Червоний: 'bg-[#FF0000]',
  Чорний: 'bg-[#000000]',
};

const ProductDetails = () => {
  return (
    <div className="border-[#ddd] border-y border-solid content-stretch flex gap-[72px] items-start px-[115px] py-[67px] w-full">
      <div className="basis-0 content-stretch flex flex-col gap-[26px] grow items-start min-h-px min-w-px relative shrink-0">
        <p className="font-['Styrene_A_Web:Light',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black tracking-[0.7px] uppercase w-full">
          DESIGN
        </p>
        <div className="content-stretch flex flex-col font-['Styrene_A_Web:Regular',sans-serif] gap-[18px] items-start not-italic relative shrink-0 text-black w-full">
          <p className="leading-[24px] relative shrink-0 text-[18px] w-full">{`Airy & Warm`}</p>
          <p className="leading-[20px] relative shrink-0 text-[13px] w-full">
            Our Alpaca Wool Crewneck Sweater features a bold cable knit design,
            a comfortable crew neck, and functional side slits, perfect for
            layering with your go-to pants.
          </p>
        </div>
      </div>
      <div className="basis-0 content-stretch flex flex-col gap-[26px] grow items-start min-h-px min-w-px relative shrink-0">
        <p className="font-['Styrene_A_Web:Light',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black tracking-[0.7px] uppercase w-full">
          QUALITY
        </p>
        <div className="content-stretch flex flex-col font-['Styrene_A_Web:Regular',sans-serif] gap-[18px] items-start not-italic relative shrink-0 text-black w-full">
          <p className="leading-[24px] relative shrink-0 text-[18px] w-full">
            Made in Italy
          </p>
          <p className="leading-[20px] relative shrink-0 text-[13px] w-full">
            Fashioned by an Italian mill dedicated to renewable fibers,
            following sustainable environmental and social standards established
            by Consorzio Promozione Filati (CPF).
          </p>
        </div>
      </div>
      <div className="basis-0 content-stretch flex flex-col gap-[26px] grow items-start min-h-px min-w-px relative shrink-0">
        <p className="font-['Styrene_A_Web:Light',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black tracking-[0.7px] uppercase w-full">
          SUSTAINABILITY
        </p>
        <div className="content-stretch flex flex-col font-['Styrene_A_Web:Regular',sans-serif] gap-[18px] items-start not-italic relative shrink-0 text-black w-full">
          <p className="leading-[24px] relative shrink-0 text-[18px] w-full">
            Sustainable Baby Alpaca
          </p>
          <p className="leading-[20px] relative shrink-0 text-[13px] w-full">
            Made using highest quality Baby Alpaca from Peru (certified mulesing
            free) and blended with a regenerated polyamide crafted for Cuyana.
          </p>
        </div>
      </div>
    </div>
  );
};

const ElegantEase = () => {
  const imgImage =
    'http://localhost:3845/assets/3273dd356ee24e8d6046a3d53e72f5b4bffef30d.png';
  const imgImage1 =
    'http://localhost:3845/assets/e35105eb5d505cdd4960368b76fe346424d9cf62.png';

  return (
    <div className="content-stretch flex flex-col gap-[48px] items-center relative w-full">
      <div className="content-stretch flex flex-col font-['Styrene_A_Web:Regular',sans-serif] gap-[16px] items-center not-italic px-0 py-[20px] relative shrink-0 text-black text-center w-full">
        <p className="leading-[32px] relative shrink-0 text-[24px] w-full">
          Elegant Ease
        </p>
        <p className="leading-[22px] relative shrink-0 text-[16px] w-full">
          Inspiration for Your Essential Wardrobe
        </p>
      </div>
      <div className="content-stretch flex gap-[20px] items-start relative shrink-0 w-full">
        <div className="basis-0 grow h-[652px] min-h-px min-w-px relative shrink-0">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              alt=""
              className="absolute h-[158.76%] left-[-4.08%] max-w-none top-[-57.06%] w-[162.24%]"
              src={imgImage}
            />
          </div>
        </div>
        <div className="basis-0 grow h-[652px] min-h-px min-w-px relative shrink-0">
          <img
            alt=""
            className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
            src={imgImage1}
          />
        </div>
      </div>
    </div>
  );
};

export async function ProductView({
  product,
  selectedVariant,
  relatedProducts,
}: {
  product: ShopifyProduct;
  selectedVariant: ProductVariant | undefined;
  //@ts-ignore
  content: PAGE_QUERYResult['content'];
  sanityDocumentId: string;
  sanityDocumentType: string;
  session: { session: Session; user: User };
  isQuickView?: boolean;
  relatedProducts: ShopifyProduct[];
}) {
  if (!product) throw new Error('Product not found');
  const images = product.images.edges.map((edge) => edge.node).filter(Boolean);
  const colorOptions = product.options.find(
    (option) => option.name.toLowerCase() === 'Колір'.toLowerCase(),
  )?.values;
  const sizeOptions = product.options.find(
    (option) => option.name.toLowerCase() === 'Розмір'.toLowerCase(),
  )?.values;
  return (
    <div className="container mx-auto py-12 space-y-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Gallery
          images={images}
          productId={product.id}
          isFavorite={false}
          //@ts-ignore
          selectedVariant={selectedVariant}
        />
        <div className="flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-medium">{product.title}</h2>
              <p className="text-xl mt-2">
                {Number(product.priceRange.maxVariantPrice.amount).toFixed(0)}{' '}
                {product.priceRange.maxVariantPrice.currencyCode}
              </p>
            </div>
            <Link href="/shop" className="text-sm underline">
              Shop / Clothing
            </Link>
          </div>
          <p className="mt-4 text-gray-700">{product.description}</p>
          <div className="mt-6">
            <span className="text-sm font-medium">
              Product Color:{' '}
              <span className="text-gray-500">
                {selectedVariant?.title.split(' / ')[1]}
              </span>
            </span>
          </div>
          {colorOptions && (
            <div className="mt-2">
              <h3 className="text-sm sr-only">Color</h3>
              <div className="flex gap-2 mt-1">
                {colorOptions.map((color) => (
                  <Button
                    key={color}
                    variant="outline"
                    size="icon"
                    className="rounded-full w-8 h-8"
                  >
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full border',
                        colorMap[color],
                      )}
                    />
                  </Button>
                ))}
              </div>
            </div>
          )}
          {sizeOptions && (
            <div className="mt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Product Size:</h3>
                <Link href="#" className="text-sm underline">
                  Size Chart
                </Link>
              </div>
              <div className="flex gap-2 mt-1">
                {sizeOptions.map((size) => (
                  <Button key={size} variant="outline">
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6">
            <Button className="w-full bg-black text-white hover:bg-gray-800">
              Add to Bag
            </Button>
          </div>
          <Accordion type="single" collapsible className="w-full mt-6">
            <AccordionItem value="item-1">
              <AccordionTrigger>Check In-Store Availability</AccordionTrigger>
              <AccordionContent>
                Yes, it is available in all stores.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Fit Details</AccordionTrigger>
              <AccordionContent>
                The model is 5'9" and wearing a size Small.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Fabrication & Care</AccordionTrigger>
              <AccordionContent>
                Made from 100% organic cotton. Machine wash cold.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Shipping & Returns</AccordionTrigger>
              <AccordionContent>
                Free shipping on orders over $50. Free returns.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      <ProductDetails />
      <ElegantEase />
      <ProductComments />

      <div className="content-stretch flex flex-col gap-[70px] items-center px-0 py-[74px] relative w-full">
        <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[26px] not-italic relative shrink-0 text-[20px] text-black text-center w-full">
          Style With
        </p>
        <div className="content-stretch flex gap-[20px] items-start px-[153px] py-0 relative shrink-0 w-full">
          {relatedProducts.slice(0, 3).map((p) => (
            <ProductCardSPP product={p} key={p.id} />
          ))}
        </div>
      </div>
      {/*{!isQuickView && (
        <PageBuilder
          content={content}
          documentId={sanityDocumentId}
          documentType={sanityDocumentType}
        />
      )}*/}
    </div>
  );
}
